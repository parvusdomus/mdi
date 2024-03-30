import MDI_CHAR_SHEET from "./modules/mdi_charsheet.js";
import MDI_NPC_SHEET from "./modules/mdi_npcsheet.js";
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
  Actors.registerSheet("mdi", MDI_NPC_SHEET, {
    makeDefault: true,
    types: ['NPC']
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
  const NPCImage="systems/custos/style/icons/roman-toga.svg"
  if (actor.img=="icons/svg/mystery-man.svg"){
    switch (actor.type){
      case 'Jugador':
      {
        actor.update ({ 'img': PJImage });
        break;
      }
      case 'npc':
      {
        actor.update ({ 'img': NPCImage });
        break;
      }
    }
  }
})