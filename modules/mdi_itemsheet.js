export default class MDI_ITEM_SHEET extends ItemSheet{
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
          classes: ["mdi", "sheet", "item"],
          template: "systems/mdi/templates/actors/character.html",
          width: 400,
          height: 350,
          tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "general" }]
        });
  
    }
    get template(){
        return `systems/mdi/templates/items/${this.item.type}.html`;
    }

    getData() {
      const data = super.getData();
      data.periciaArma = {
        cac: "Cuerpo a c.",
        sinarmas: "Sin armas",
        atletismo: "Atletismo",
        distancia: "A distancia"
      }
      return data;
    }


  
  }