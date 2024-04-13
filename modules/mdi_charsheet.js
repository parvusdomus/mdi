import {DiceRoll} from "./rolls.js";
import {WeaponRoll} from "./combat.js";
import {InitiativeRoll} from "./combat.js";
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
      this._prepareCharacterItems(data);
      this._calculaValores(data);
      return data;
    }

    _prepareCharacterItems(sheetData){
      const actorData = sheetData;
      const Talentos = [];
      const Armas = [];
      const Armaduras = [];
      const Escudos = [];
      const Objetos = [];
      let armadura=0;
      let defensa=0;
      let penalizador=0;
      let penalizadorescudo=0;
      let penalizadordosmanos=0;
      let penalizadorinit=0;
      let tipoIniciativa="normal"
      let bonoFortuna=0;
      for (let i of sheetData.items){
        switch (i.type){
          case 'talento':
				  {
					  Talentos.push(i);
            if (i.name=="Predestinado"){
              bonoFortuna++
            }
            if (i.name=="Reliquia"){
              bonoFortuna++
            }
					  break;
				  }
          case 'arma':
				  {
					  Armas.push(i);
            if (i.system.dosmanos == true){
              penalizadordosmanos=2
            }
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
            if (i.system.equipada==true){
              armadura+=Math.abs(i.system.puntuacion)
              penalizador+=Math.abs(i.system.penalizacion)
            }
					  break;
				  }
          case 'escudo':
				  {
					  Escudos.push(i);
            if (i.system.equipada==true){
              defensa+=Math.abs(i.system.puntuacion)
              penalizadorescudo+=Math.abs(i.system.penalizacion)
            }
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
        activarMiedo: game.settings.get("mdi", "activarMiedo"),
        activarTooltips: game.settings.get("mdi", "activarTooltips")
      }
      actorData.isGM = game.user.isGM;
      let Acorazado = actorData.Talentos.find((k) => k.name === "Acorazado");
      if (Acorazado){
        penalizadorescudo=0;
      }
      let Grande = actorData.Talentos.find((k) => k.name === "Cuanto más grande, mejor");
      if (Grande){
        penalizadordosmanos=0;
      }
      let Centella = actorData.Talentos.find((k) => k.name === "Como la centella");
      if (Centella){
        tipoIniciativa="ventaja"
      }
      penalizadorinit=penalizadorescudo+penalizadordosmanos;
      this.actor.update ({ 'system.armadura.equipo': armadura });
      this.actor.update ({ 'system.defensa.equipo': defensa });
      this.actor.update ({ 'system.penalizador.equipo': penalizador });
      this.actor.update ({ 'system.iniciativa.penalizadorescudo': penalizadorescudo });
      this.actor.update ({ 'system.iniciativa.tipo': tipoIniciativa });
      this.actor.update ({ 'system.iniciativa.penalizadordosmanos': penalizadordosmanos });
      this.actor.update ({ 'system.iniciativa.penalizador': penalizadorinit });
      this.actor.update ({ 'system.fortuna.bono': bonoFortuna });

    }

    _calculaValores(actorData) {
      const data = actorData;
      let maxPV = 6+Number(this.actor.system.brio.valor)
      let defensa = Math.floor((Number(this.actor.system.picaresca.valor)+Number(this.actor.system.brio.valor))/2)+4+Number(this.actor.system.defensa.equipo)
      let iniciativa = Math.floor((Number(this.actor.system.picaresca.valor)+Number(this.actor.system.erudicion.valor))/2)
      let fortuna = Math.floor((Number(this.actor.system.galanteria.valor)+Number(this.actor.system.erudicion.valor))/2)+Number(this.actor.system.fortuna.bono)
      let armadura = Number(this.actor.system.armadura.equipo)
      let penalizador = Number(this.actor.system.penalizador.equipo)
      let valormayor = 0
      let valormenor = 99
      const atributos = ["brio", "picaresca", "galanteria", "erudicion"]
      for (let atributo in atributos) {
        if (this.actor.system[atributos[atributo]].valor > valormayor){
          valormayor = this.actor.system[atributos[atributo]].valor
        }
        if (this.actor.system[atributos[atributo]].valor < valormenor){
          valormenor = this.actor.system[atributos[atributo]].valor
        }
      }
      let voluntad = Math.floor((valormayor+valormenor)/2)
      this.actor.update ({ 'system.pv.max': maxPV });
      this.actor.update ({ 'system.defensa.value': defensa });
      this.actor.update ({ 'system.armadura.value': armadura });
      this.actor.update ({ 'system.penalizador.value': penalizador });
      this.actor.update ({ 'system.iniciativa.value': iniciativa });
      this.actor.update ({ 'system.fortuna.max': fortuna });
      this.actor.update ({ 'system.voluntad.value': voluntad });
    }

    activateListeners(html)
	  {
		  super.activateListeners(html);
      html.find('a.item-create').click(this._onItemCreate.bind(this));
      html.find('a.item-edit').click(this._onEditClick.bind(this));
		  html.find('a.item-delete').click(this._onDeleteClick.bind(this));
      html.find('a.item-equip').click(this._onEquipToggle.bind(this));
      html.find('a.pericia-click').click(this._onPericia.bind(this));
      html.find('a.weapon-click').click(this._onWeaponRoll.bind(this));
      html.find('a.estado-click').click(this._onEstadoToggle.bind(this));
      html.find('a.iniciativa-click').click(this._onIniciativaRoll.bind(this));
      html.find('a.voluntad-click').click(this._onVoluntadRoll.bind(this));
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

    async _onEquipToggle(event, data)
	  {
      event.preventDefault();
		  const dataset = event.currentTarget.dataset;
		  const item = this.actor.items.get(dataset.id);
      if (item.system.equipada==true){
        item.update ({ 'system.equipada': false });
      }
      else{
        item.update ({ 'system.equipada': true });
      }
		  return;
    }

    async _onEstadoToggle(event, data)
	  {
      event.preventDefault();
		  const dataset = event.currentTarget.dataset;
      let estado = this.actor.system.voluntad.estado;
      switch (estado) {
        case 'normal':
        {
          this.actor.update ({ 'system.voluntad.estado': "asustado" });
          break;
        }
        case 'asustado':
        {
          this.actor.update ({ 'system.voluntad.estado': "aterrorizado" });
          break;
        }
        case 'aterrorizado':
        {
          this.actor.update ({ 'system.voluntad.estado': "trastornado" });
          break;
        }
        case 'trastornado':
        {
          this.actor.update ({ 'system.voluntad.estado': "normal" });
          break;
        }
        
      }
		  return;
    }
    
    async _onDeleteClick(event, data)
    {
      event.preventDefault();
      const dataset = event.currentTarget.dataset;
      Dialog.confirm({
        title: "Borrar objeto",
			  content: "¿Estás seguro de que quieres borrar eso?",
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

    async _onIniciativaRoll(event, data)
    {
      event.preventDefault();
      const dataset = event.currentTarget.dataset;
      InitiativeRoll (this.actor._id)
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
      let penalizador=0-Number(this.actor.system.penalizador.value)
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
      if ((penalizador < 0) && ((dataset.pericia=="atletismo")||(dataset.pericia=="acrobacias")||(dataset.pericia=="sigilo"))){
        html_content+='<td><h1><label>- '+Math.abs(penalizador)+'</label></h1></td>'
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
            DiceRoll(actor_id,titulo,'desventaja',nombreatributo, nombrepericia, valoratributo, periciaentrenada, dataset.pericia, penalizador, modificador, dificultad)
          }
         },
         normal: {
          icon: '<i class="fa-solid fa-dice-six"></i>',
          label: "Normal",
          callback: () => {
            let dificultad=document.getElementById("dificultad").value;
            let modificador=document.getElementById("modificador").value;
            DiceRoll(actor_id,titulo,'normal',nombreatributo, nombrepericia, valoratributo, periciaentrenada, dataset.pericia, penalizador, modificador, dificultad)
          }
         },
         ventaja: {
          icon: '<i class="fa-solid fa-dice"></i>',
          label: "Ventaja",
          callback: () => {
            let dificultad=document.getElementById("dificultad").value;
            let modificador=document.getElementById("modificador").value;
            DiceRoll(actor_id,titulo,'ventaja',nombreatributo, nombrepericia, valoratributo, periciaentrenada, dataset.pericia, penalizador, modificador, dificultad)
          }
         }
        },
        default: "normal",
        render: html => console.log("Register interactivity in the rendered dialog"),
        close: html => console.log("This always is logged no matter which option is chosen")
       });
       d.render(true);

    }

    async _onVoluntadRoll(event, data){
      const dataset = data;
      let actor=this.actor
      let nombreatributo="Voluntad"
      let valoratributo=actor.system.voluntad.value
      let penalizador=0
      let nombrepericia=""
      let periciaentrenada=false
      let titulo=nombreatributo
      let html_content='<div class="dialogo">'
      html_content+='<table><tr><td><h2><label>'+titulo+'</label></h2></td></tr></table>'
      html_content+='<table><tr><td><h1><label>'+valoratributo+'</label></h1></td>'
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
            DiceRoll(actor_id,titulo,'desventaja',nombreatributo, nombrepericia, valoratributo, periciaentrenada, nombrepericia, penalizador, modificador, dificultad)
          }
         },
         normal: {
          icon: '<i class="fa-solid fa-dice-six"></i>',
          label: "Normal",
          callback: () => {
            let dificultad=document.getElementById("dificultad").value;
            let modificador=document.getElementById("modificador").value;
            DiceRoll(actor_id,titulo,'normal',nombreatributo, nombrepericia, valoratributo, periciaentrenada, nombrepericia, penalizador, modificador, dificultad)
          }
         },
         ventaja: {
          icon: '<i class="fa-solid fa-dice"></i>',
          label: "Ventaja",
          callback: () => {
            let dificultad=document.getElementById("dificultad").value;
            let modificador=document.getElementById("modificador").value;
            DiceRoll(actor_id,titulo,'ventaja',nombreatributo, nombrepericia, valoratributo, periciaentrenada, nombrepericia, penalizador, modificador, dificultad)
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
      let targetdefense=5
      let targetarmor=0
      let target= Array.from(game.user.targets)[0]?.actor;
      if (target){
        targetdefense=target.system.defensa.value
        targetarmor=target.system.armadura.value
      }
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
      html_content+='<td><h2><label>VS</label></h2></td><td><h1><input name="dificultad" id="dificultad" data-dtype="Number" value='+targetdefense+' size=2></input><h1></td>'
      html_content+='</tr></table>'
      html_content+='<table><tr><td><h2><label>'+item.name+'</label></h2></td></tr></table>'
      html_content+='<table><tr><td><h2><label>Daño</label></h2></td>'
      html_content+='<td><h1><label>'+item.system.dano+'</label></h1></td>'
      html_content+='<td><h1><label>+</label></h1></td><td><h1><input name="modificadordano" id="modificadordano" data-dtype="Number" value="0" size=2></input></h1></td>'
      html_content+='<td><h2><label>Armadura</label></h2></td><td><h1><input name="armadura" id="armadura" data-dtype="Number" value='+targetarmor+' size=2></input><h1></td>'
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
            let modificadordano=document.getElementById("modificadordano").value;
            let armadura=document.getElementById("armadura").value;
            WeaponRoll(actor_id,titulo,'desventaja',nombreatributo, nombrepericia, valoratributo, periciaentrenada, modificador, dificultad, item.system.dano, modificadordano, armadura)
          }
         },
         normal: {
          icon: '<i class="fa-solid fa-dice-six"></i>',
          label: "Normal",
          callback: () => {
            let dificultad=document.getElementById("dificultad").value;
            let modificador=document.getElementById("modificador").value;
            let modificadordano=document.getElementById("modificadordano").value;
            let armadura=document.getElementById("armadura").value;
            WeaponRoll(actor_id,titulo,'normal',nombreatributo, nombrepericia, valoratributo, periciaentrenada, modificador, dificultad, item.system.dano, modificadordano, armadura)
          }
         },
         ventaja: {
          icon: '<i class="fa-solid fa-dice"></i>',
          label: "Ventaja",
          callback: () => {
            let dificultad=document.getElementById("dificultad").value;
            let modificador=document.getElementById("modificador").value;
            let modificadordano=document.getElementById("modificadordano").value;
            let armadura=document.getElementById("armadura").value;
            WeaponRoll(actor_id,titulo,'ventaja',nombreatributo, nombrepericia, valoratributo, periciaentrenada, modificador, dificultad, item.system.dano, modificadordano, armadura)
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