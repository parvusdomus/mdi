import {DiceRoll} from "./rolls.js";
import {WeaponRoll} from "./rolls.js";
export default class MDI_CHAR_SHEET extends ActorSheet{
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
          classes: ["mdi", "sheet", "actor"],
          template: "systems/mdi/templates/actors/character.html",
          width: 780,
          height: 680,
          tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".right-section", initial: "general" }],
          scrollY: ['section.right-section']
        });
  
    }
    getData() {
      const data = super.getData();
      if (this.actor.type == 'Jugador') {
        this._prepareCharacterItems(data);
        this._calculaValores(data);
        //this._updateInitiative(data);
      }
      return data;
    }

    _prepareCharacterItems(sheetData){
      const actorData = sheetData;
      const Talentos = [];
      const Armas = [];
      const Armaduras = [];
      const Escudos = [];
      const Objetos = [];
      for (let i of sheetData.items){
        switch (i.type){
          case 'talento':
				  {
					  Talentos.push(i);
					  break;
				  }
          case 'arma':
				  {
					  Armas.push(i);
					  break;
				  }
          case 'objeto':
				  {
					  Objetos.push(i);
					  break;
				  }
          case 'armadura':
				  {
					  Armaduras.push(i);
					  break;
				  }
          case 'escudo':
				  {
					  Escudos.push(i);
					  break;
				  }
        }
      }
      actorData.Talentos = Talentos;
      actorData.Armas = Armas;
      actorData.Armaduras = Armaduras;
      actorData.Escudos = Escudos;
      actorData.Objetos = Objetos;
      actorData.settings = {
        //enableKnacks: game.settings.get("mdi", "enableKnacks")
      }
      actorData.isGM = game.user.isGM;

    }

    _calculaValores(actorData) {
      const data = actorData;
      let maxPV = 6+Number(this.actor.system.brio.valor)
      let defensa = Math.floor((Number(this.actor.system.picaresca.valor)+Number(this.actor.system.brio.valor))/2)+4
      let iniciativa = Math.floor((Number(this.actor.system.picaresca.valor)+Number(this.actor.system.erudicion.valor))/2)
      let fortuna = Math.floor((Number(this.actor.system.galanteria.valor)+Number(this.actor.system.erudicion.valor))/2)

      this.actor.update ({ 'system.pv.max': maxPV });
      this.actor.update ({ 'system.defensa.value': defensa });
      this.actor.update ({ 'system.iniciativa.value': iniciativa });
      this.actor.update ({ 'system.fortuna.max': fortuna });
      
    }

    _updateInitiative(sheetData){
      let initiative=""
      if (sheetData.actor.system.trait=="Agile" || sheetData.actor.system.subtrait.reflexes){
        initiative="3d6cs>=5"
      }
      else{
        initiative="2d6cs>=5"
      }
      this.actor.update ({ 'system.initiative': initiative });
    }


    activateListeners(html)
	  {
		  super.activateListeners(html);
      html.find('a.item-create').click(this._onItemCreate.bind(this));
      html.find('a.item-edit').click(this._onEditClick.bind(this));
      html.find('a.item-show').click(this._onShowClick.bind(this));
		  html.find('a.item-delete').click(this._onDeleteClick.bind(this));
      html.find('a.item-equip').click(this._onEquipToggle.bind(this));
      html.find('a.pericia-click').click(this._onPericia.bind(this));
      html.find('a.weapon-click').click(this._onWeaponRoll.bind(this));
    }

    _onItemCreate(event) {
      event.preventDefault();
      const header = event.currentTarget;
      const type = header.dataset.type;
      const data = duplicate(header.dataset);
      const name = `${type.capitalize()}`;
      const itemData = {
        name: name,
        type: type,
        data: data
      };
      // Remove the type from the dataset since it's in the itemData.type prop.
      delete itemData.data["type"];
    
      // Finally, create the item!
      //     return this.actor.createOwnedItem(itemData);
      return Item.create(itemData, {parent: this.actor});
    }

    async _onEditClick(event, data)
	  {
      event.preventDefault();
		  const dataset = event.currentTarget.dataset;
		  const item = this.actor.items.get(dataset.id);
		  item.sheet.render(true);
		  return;
    }

    async _onShowClick(event, data)
	  {
      event.preventDefault();
		  const dataset = event.currentTarget.dataset;
		  const item = this.actor.items.get(dataset.id);
      let chatData = {}
      let msg_content = "<p><span>"+item.name+" </span>"
      if (item.system.tag != ""){msg_content+="<span style=\"background-color:"+item.system.bg_color+"; color:"+item.system.text_color+"\">&nbsp;"+item.system.tag+"&nbsp;</span>"}
      msg_content+="</p>"
      if (item.system.desc != ""){msg_content+="<hr>"+item.system.desc}
      chatData = {
        content: msg_content,
      };
      ChatMessage.create(chatData);
		  return;
    }

    async _onEquipToggle(event, data)
	  {
      event.preventDefault();
		  const dataset = event.currentTarget.dataset;
		  const item = this.actor.items.get(dataset.id);
      console.log (item)
      if (item.system.equipada==true){
        item.update ({ 'system.equipada': false });
      }
      else{
        item.update ({ 'system.equipada': true });
      }
		  return;
    }
    
    async _onDeleteClick(event, data)
    {
      event.preventDefault();
      const dataset = event.currentTarget.dataset;
      console.log ("dataset")
      Dialog.confirm({
        title: game.i18n.localize("MDI.ui.deleteTitle"),
			  content: game.i18n.localize("MDI.ui.deleteText"),
        yes: () => this.actor.deleteEmbeddedDocuments("Item", [dataset.id]),
        no: () => {},
        defaultYes: false
         });
      return;
    }

    async _onPericia(event, data)
    {
      event.preventDefault();
      const dataset = event.currentTarget.dataset;
      if (event.shiftKey){
        this._onPericiaToggle(dataset)
      }
      else{
        this._onPericiaRoll(dataset)
      }
    }

    async _onPericiaToggle(data)
    {
      const dataset = data;
      if (dataset.pericia==""){
        return;
      }
      let actor=this.actor
      let periciaentrenada=actor.system[dataset.atributo][dataset.pericia].valor
      let pericia="system."+dataset.atributo+"."+dataset.pericia+".valor"
      let valor=false
      if (periciaentrenada == false) {
        valor=true
      }
      this.actor.update ({[pericia]: valor});
      return;
    }

    async _onPericiaRoll(data){
      const dataset = data;
      let actor=this.actor
      let nombreatributo=actor.system[dataset.atributo].etiqueta
      let valoratributo=actor.system[dataset.atributo].valor
      let nombrepericia=""
      let periciaentrenada=false
      if (dataset.pericia!=""){
        nombrepericia=" ("+actor.system[dataset.atributo][dataset.pericia].etiqueta+")";
        periciaentrenada=actor.system[dataset.atributo][dataset.pericia].valor
      }
      let titulo=nombreatributo+nombrepericia
      let html_content='<div class="dialogo">'
      html_content+='<table><tr><td><h2><label>'+titulo+'</label></h2></td></tr></table>'
      html_content+='<table><tr><td><h1><label>'+valoratributo+'</label></h1></td>'
      if (periciaentrenada==true){
        html_content+='<td><h1><label>+ 2</label></h1></td>'
      }
      html_content+='<td><h1><label>+</label></h1></td><td><h1><input name="modificador" id="modificador" data-dtype="Number" value="0" size=2></input></h1></td>'
      html_content+='<td><h2><label>VS</label></h2></td><td><h1><input name="dificultad" id="dificultad" data-dtype="Number" value="5" size=2></input><h1></td>'
      html_content+='</tr></table></div>'
      let actor_id = this.actor._id;
      let d = new Dialog({
        title: titulo,
        content: html_content,
        buttons: {
         desventaja: {
          icon: '<i class="fa-solid fa-dice" style="color: darkred;"></i>',
          label: "Desventaja",
          callback: () => {
            let dificultad=document.getElementById("dificultad").value;
            let modificador=document.getElementById("modificador").value;
            DiceRoll(actor_id,titulo,'desventaja',nombreatributo, nombrepericia, valoratributo, periciaentrenada, modificador, dificultad)
          }
         },
         normal: {
          icon: '<i class="fa-solid fa-dice-six"></i>',
          label: "Normal",
          callback: () => {
            let dificultad=document.getElementById("dificultad").value;
            let modificador=document.getElementById("modificador").value;
            DiceRoll(actor_id,titulo,'normal',nombreatributo, nombrepericia, valoratributo, periciaentrenada, modificador, dificultad)
          }
         },
         ventaja: {
          icon: '<i class="fa-solid fa-dice"></i>',
          label: "Ventaja",
          callback: () => {
            let dificultad=document.getElementById("dificultad").value;
            let modificador=document.getElementById("modificador").value;
            DiceRoll(actor_id,titulo,'ventaja',nombreatributo, nombrepericia, valoratributo, periciaentrenada, modificador, dificultad)
          }
         }
        },
        default: "normal",
        render: html => console.log("Register interactivity in the rendered dialog"),
        close: html => console.log("This always is logged no matter which option is chosen")
       });
       d.render(true);

    }

    async _onWeaponRoll(event, data){
      event.preventDefault();
		  const dataset = event.currentTarget.dataset;
      const actor=this.actor;
      const item = this.actor.items.get(dataset.id);
      console.log ("ON WEAPON ROLL")
      console.log ("DATASET")
      console.log (dataset)
      console.log ("ACTOR")
      console.log (actor)
      console.log ("ITEM")
      console.log (item)
      
      let pericia=item.system.pericia
      let atributo=""
      switch (pericia){
        case 'cac':
        {
          atributo="brio"
          break;
        }
        case 'sinarmas':
        {
          atributo="brio"
          break;
        }
        case 'atletismo':
        {
          atributo="brio"
          break;
        }
        case 'distancia':
        {
          atributo="picaresca"
          break;
        }
      }
      let nombreatributo=actor.system[atributo].etiqueta
      let valoratributo=actor.system[atributo].valor
      let nombrepericia=" ("+actor.system[atributo][pericia].etiqueta+")";
      let periciaentrenada=actor.system[atributo][pericia].valor
      let titulo=nombreatributo+nombrepericia
      let html_content='<div class="dialogo">'
      html_content+='<table><tr><td><h2><label>'+titulo+'</label></h2></td></tr></table>'
      html_content+='<table><tr><td><h1><label>'+valoratributo+'</label></h1></td>'
      if (periciaentrenada==true){
        html_content+='<td><h1><label>+ 2</label></h1></td>'
      }
      html_content+='<td><h1><label>+</label></h1></td><td><h1><input name="modificador" id="modificador" data-dtype="Number" value="0" size=2></input></h1></td>'
      html_content+='<td><h2><label>VS</label></h2></td><td><h1><input name="dificultad" id="dificultad" data-dtype="Number" value="5" size=2></input><h1></td>'
      html_content+='</tr></table>'
      html_content+='<table><tr><td><h2><label>'+item.name+'</label></h2></td></tr></table>'
      html_content+='<table><tr><td><h2><label>Daño</label></h2></td>'
      html_content+='<td><h1><label>'+item.system.dano+'</label></h1></td>'
      html_content+='<td><h1><label>+</label></h1></td><td><h1><input name="modificadordano" id="modificadordano" data-dtype="Number" value="0" size=2></input></h1></td>'
      html_content+='<td><h2><label>Armadura</label></h2></td><td><h1><input name="armadura" id="armadura" data-dtype="Number" value="0" size=2></input><h1></td>'
      html_content+='</tr></table>'
      html_content+='</div>'
      let actor_id = this.actor._id;
      let d = new Dialog({
        title: titulo,
        content: html_content,
        buttons: {
         desventaja: {
          icon: '<i class="fa-solid fa-dice" style="color: darkred;"></i>',
          label: "Desventaja",
          callback: () => {
            let dificultad=document.getElementById("dificultad").value;
            let modificador=document.getElementById("modificador").value;
            WeaponRoll(actor_id,titulo,'desventaja',nombreatributo, nombrepericia, valoratributo, periciaentrenada, modificador, dificultad)
          }
         },
         normal: {
          icon: '<i class="fa-solid fa-dice-six"></i>',
          label: "Normal",
          callback: () => {
            let dificultad=document.getElementById("dificultad").value;
            let modificador=document.getElementById("modificador").value;
            WeaponRoll(actor_id,titulo,'normal',nombreatributo, nombrepericia, valoratributo, periciaentrenada, modificador, dificultad)
          }
         },
         ventaja: {
          icon: '<i class="fa-solid fa-dice"></i>',
          label: "Ventaja",
          callback: () => {
            let dificultad=document.getElementById("dificultad").value;
            let modificador=document.getElementById("modificador").value;
            WeaponRoll(actor_id,titulo,'ventaja',nombreatributo, nombrepericia, valoratributo, periciaentrenada, modificador, dificultad)
          }
         }
        },
        default: "normal",
        render: html => console.log("Register interactivity in the rendered dialog"),
        close: html => console.log("This always is logged no matter which option is chosen")
       });
       d.render(true);

    }
  
  }