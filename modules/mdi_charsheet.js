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
      html.find('a.dice-roll').click(this._onDiceRoll.bind(this));
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
      console.log ("ON EQUIP")
		  const dataset = event.currentTarget.dataset;
		  const item = this.actor.items.get(dataset.id);
      console.log ("ITEM")
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
      switch (dataset.pericia){
        //LAS DE BRIO
        case 'atletismo':
        {
          if (dataset.current == "false"){
            this.actor.update ({'system.brio.atletismo.valor': true});
          }
          else{
            this.actor.update ({'system.brio.atletismo.valor': false});
          }
          break;
        }
        case 'equitacion':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.brio.equitacion.valor': true});
          }
          else{
            this.actor.update ({'system.brio.equitacion.valor': false});
          }
          break;
        }
        case 'intimidar':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.brio.intimidar.valor': true});
          }
          else{
            this.actor.update ({'system.brio.intimidar.valor': false});
          }
          break;
        }
        case 'cac':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.brio.cac.valor': true});
          }
          else{
            this.actor.update ({'system.brio.cac.valor': false});
          }
          break;
        }
        case 'sinarmas':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.brio.sinarmas.valor': true});
          }
          else{
            this.actor.update ({'system.brio.sinarmas.valor': false});
          }
          break;
        }
        case 'supervivencia':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.brio.supervivencia.valor': true});
          }
          else{
            this.actor.update ({'system.brio.supervivencia.valor': false});
          }
          break;
        }
        //LAS DE PICARESCA
        case 'acrobacias':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.picaresca.acrobacias.valor': true});
          }
          else{
            this.actor.update ({'system.picaresca.acrobacias.valor': false});
          }
          break;
        }
        case 'enganar':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.picaresca.enganar.valor': true});
          }
          else{
            this.actor.update ({'system.picaresca.enganar.valor': false});
          }
          break;
        }
        case 'perspicacia':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.picaresca.perspicacia.valor': true});
          }
          else{
            this.actor.update ({'system.picaresca.perspicacia.valor': false});
          }
          break;
        }
        case 'distancia':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.picaresca.distancia.valor': true});
          }
          else{
            this.actor.update ({'system.picaresca.distancia.valor': false});
          }
          break;
        }
        case 'latrocinio':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.picaresca.latrocinio.valor': true});
          }
          else{
            this.actor.update ({'system.picaresca.latrocinio.valor': false});
          }
          break;
        }
        case 'sigilo':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.picaresca.sigilo.valor': true});
          }
          else{
            this.actor.update ({'system.picaresca.sigilo.valor': false});
          }
          break;
        }
        //LAS DE GALANTERIA
        case 'bajos':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.galanteria.bajos.valor': true});
          }
          else{
            this.actor.update ({'system.galanteria.bajos.valor': false});
          }
          break;
        }
        case 'comercio':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.galanteria.comercio.valor': true});
          }
          else{
            this.actor.update ({'system.galanteria.comercio.valor': false});
          }
          break;
        }
        case 'seduccion':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.galanteria.seduccion.valor': true});
          }
          else{
            this.actor.update ({'system.galanteria.seduccion.valor': false});
          }
          break;
        }
        case 'arte':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.galanteria.arte.valor': true});
          }
          else{
            this.actor.update ({'system.galanteria.arte.valor': false});
          }
          break;
        }
        case 'diplomacia':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.galanteria.diplomacia.valor': true});
          }
          else{
            this.actor.update ({'system.galanteria.diplomacia.valor': false});
          }
          break;
        }
        case 'animales':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.galanteria.animales.valor': true});
          }
          else{
            this.actor.update ({'system.galanteria.animales.valor': false});
          }
          break;
        }
        //LAS DE ERUDICION
        case 'humanidades':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.erudicion.humanidades.valor': true});
          }
          else{
            this.actor.update ({'system.erudicion.humanidades.valor': false});
          }
          break;
        }
        case 'ingenieria':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.erudicion.ingenieria.valor': true});
          }
          else{
            this.actor.update ({'system.erudicion.ingenieria.valor': false});
          }
          break;
        }
        case 'medicina':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.erudicion.medicina.valor': true});
          }
          else{
            this.actor.update ({'system.erudicion.medicina.valor': false});
          }
          break;
        }
        case 'ciencias':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.erudicion.ciencias.valor': true});
          }
          else{
            this.actor.update ({'system.erudicion.ciencias.valor': false});
          }
          break;
        }
        case 'linguistica':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.erudicion.linguistica.valor': true});
          }
          else{
            this.actor.update ({'system.erudicion.linguistica.valor': false});
          }
          break;
        }
        case 'navegacion':
        {
          if (dataset.current=="false"){
            this.actor.update ({'system.erudicion.navegacion.valor': true});
          }
          else{
            this.actor.update ({'system.erudicion.navegacion.valor': false});
          }
          break;
        }
      }
    }

    async _onPericiaRoll(data){
      const dataset = data;
      console.log ("PERICIA ROLL")
      console.log (dataset)
      
    }

    async _onDiceRoll(event)
    {
      event.preventDefault();
      DiceRollV2(event);
      return;
    }
  
  }