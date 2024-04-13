import MDI_CHAR_SHEET from "./modules/mdi_charsheet.js";
import MDI_VILLANO_SHEET from "./modules/mdi_villanosheet.js";
import MDI_ESBIRRO_SHEET from "./modules/mdi_esbirrosheet.js";
import MDI_ITEM_SHEET from "./modules/mdi_itemsheet.js";
import mdiChat from "./modules/chat.js";
import {InitiativeRoll} from './modules/combat.js';



Hooks.once("init", function(){
  document.getElementById("logo").src = "/systems/mdi/style/images/logo2.webp";
  console.log("test | INITIALIZING MDI CHARACTER SHEETS...");
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("mdi", MDI_CHAR_SHEET, {
    makeDefault: true,
    types: ['Jugador']
  });
  Actors.registerSheet("mdi", MDI_VILLANO_SHEET, {
    makeDefault: true,
    types: ['Villano','Sobrenatural']
  });
  Actors.registerSheet("mdi", MDI_ESBIRRO_SHEET, {
    makeDefault: true,
    types: ['Esbirro', 'Animal', 'Lugarteniente']
  });

  console.log("test | INITIALIZING MDI ITEM SHEETS...");
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("mdi", MDI_ITEM_SHEET,{
    makeDefault: true,
    types: ['talento', 'objeto', 'arma', 'escudo', 'armadura']
  });

    // Slowing down pings
    CONFIG.Canvas.pings.styles.pulse.duration = 2000
    CONFIG.Canvas.pings.styles.alert.duration = 2000
    CONFIG.Canvas.pings.styles.arrow.duration = 2000

  console.log("test | INITIALIZING MDI SETTINGS...");

  game.settings.register('mdi', 'activarMiedo', {
    name: "Activar Miedo",
    hint: "Activa en la ficha el contador de Voluntad y de estados de Miedo",
    type: Boolean,
    default: false,
    scope: 'world',
    requiresReload: false,
    config: true
  });

  game.settings.register('mdi', 'activarTooltips', {
    name: "Activar descripciones emergentes",
    hint: "Activa en la ficha las descripciones emergentes",
    type: Boolean,
    default: true,
    scope: 'world',
    requiresReload: false,
    config: true
  });

});


Hooks.on("renderPause", () => {
  $("#pause img").attr("class", "fa-spin pause-image");
  $("#pause figcaption").attr("class", "pause-mdi");
});


Hooks.on('renderChatLog', (app, html, data) => mdiChat.chatListeners(html))

Hooks.on('refreshToken', () => {

})

Hooks.on('createCombatant', async (combatant) => {
  let total = await InitiativeRoll (combatant.actorId)
  combatant.update ({'initiative': total})
})

Hooks.on("createActor", async (actor) =>{
  const PJImage="systems/mdi/style/icons/duality-mask.svg"
  const EsbirroImage="systems/mdi/style/icons/overkill.svg"
  const LugartenienteImage="systems/mdi/style/icons/pyromaniac.svg"
  const AnimalImage="systems/mdi/style/icons/fangs.svg"
  const VillanoImage="systems/mdi/style/icons/crowned-skull.svg"
  const SobrenaturalImage="systems/mdi/style/icons/spark-spirit.svg"
  if (actor.img=="icons/svg/mystery-man.svg"){
    switch (actor.type){
      case 'Jugador':
      {
        actor.updateSource({"prototypeToken.actorLink": true});
        actor.updateSource({"prototypeToken.bar1.attribute": "pv"});
        actor.updateSource({"prototypeToken.bar2.attribute": "fortuna"});
        actor.updateSource({"prototypeToken.displayBars": "50"});
        actor.updateSource({"prototypeToken.displayName": "50"});
        actor.updateSource({"prototypeToken.disposition": "1"});
        actor.update ({ 'img': PJImage });
        break;
      }
      case 'Esbirro':
      {
        actor.updateSource({"prototypeToken.actorLink": false});
        actor.updateSource({"prototypeToken.bar1.attribute": "pv"});
        actor.updateSource({"prototypeToken.bar2.attribute": "fortuna"});
        actor.updateSource({"prototypeToken.displayBars": "40"});
        actor.updateSource({"prototypeToken.displayName": "40"});
        actor.updateSource({"prototypeToken.disposition": "-1"});
        actor.updateSource({"prototypeToken.appendNumber": true});
        actor.update ({ 'img': EsbirroImage });
        break;
      }
      case 'Lugarteniente':
      {
        actor.updateSource({"prototypeToken.actorLink": false});
        actor.updateSource({"prototypeToken.bar1.attribute": "pv"});
        actor.updateSource({"prototypeToken.bar2.attribute": "fortuna"});
        actor.updateSource({"prototypeToken.displayBars": "40"});
        actor.updateSource({"prototypeToken.displayName": "40"});
        actor.updateSource({"prototypeToken.disposition": "-1"});
        actor.updateSource({"prototypeToken.appendNumber": true});
        actor.update ({ 'img': LugartenienteImage });
        break;
      }
      case 'Animal':
      {
        actor.updateSource({"prototypeToken.actorLink": false});
        actor.updateSource({"prototypeToken.bar1.attribute": "pv"});
        actor.updateSource({"prototypeToken.bar2.attribute": "fortuna"});
        actor.updateSource({"prototypeToken.displayBars": "40"});
        actor.updateSource({"prototypeToken.displayName": "40"});          
        actor.updateSource({"prototypeToken.disposition": "-1"});
        actor.updateSource({"prototypeToken.appendNumber": true});
        actor.update ({ 'img': AnimalImage });
        break;
      }
      case 'Villano':
      {
        actor.updateSource({"prototypeToken.actorLink": true});
        actor.updateSource({"prototypeToken.bar1.attribute": "pv"});
        actor.updateSource({"prototypeToken.bar2.attribute": "fortuna"});
        actor.updateSource({"prototypeToken.displayBars": "40"});
        actor.updateSource({"prototypeToken.displayName": "40"});          
        actor.updateSource({"prototypeToken.disposition": "-1"});
        actor.updateSource({"prototypeToken.appendNumber": true});
        actor.update ({ 'img': VillanoImage });
        break;
      }
      case 'Sobrenatural':
      {
        actor.updateSource({"prototypeToken.actorLink": false});
        actor.updateSource({"prototypeToken.bar1.attribute": "pv"});
        actor.updateSource({"prototypeToken.bar2.attribute": "fortuna"});
        actor.updateSource({"prototypeToken.displayBars": "40"});
        actor.updateSource({"prototypeToken.displayName": "40"});          
        actor.updateSource({"prototypeToken.disposition": "-1"});
        actor.updateSource({"prototypeToken.appendNumber": true});
        actor.update ({ 'img': SobrenaturalImage });
        break;
      }
    }
  }
})

Hooks.on("createItem", async (item) =>{
  const talentoImage="systems/mdi/style/icons/juggler.svg"
  const armaImage="systems/mdi/style/icons/crossed-sabres.svg"
  const armaduraImage="systems/mdi/style/icons/armor-vest.svg"
  const escudoImage="systems/mdi/style/icons/cross-shield.svg"
  if (item.img=="icons/svg/item-bag.svg"){
    switch (item.type){
      case 'talento':
      {
        item.update ({ 'img': talentoImage });
        break;
      }
      case 'arma':
      {
        item.update ({ 'img': armaImage });
        break;
      }
      case 'armadura':
      {
        item.update ({ 'img': armaduraImage });
        break;
      }
      case 'escudo':
      {
        item.update ({ 'img': escudoImage });
        break;
      }
    }
  }
})