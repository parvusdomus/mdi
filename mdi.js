import MDI_CHAR_SHEET from "./modules/mdi_charsheet.js";
import MDI_NPC_SHEET from "./modules/mdi_npcsheet.js";
import MDI_ITEM_SHEET from "./modules/mdi_itemsheet.js";
import {_getInitiativeFormula} from './modules/combat.js';
import {diceToFaces} from "./modules/rolls.js";
import mdiChat from "./modules/chat.js";



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

  game.settings.register('mdi', 'bgImage', {
    name: game.i18n.localize("MDI.config.bgImageName"),
    hint: game.i18n.localize("MDI.config.bgImageHint"),
    type: String,
    default: 'systems/mdi/style/images/white.webp',
    scope: 'world',
    requiresReload: true,
    config: true,
    filePicker: 'image',
  });

  game.settings.register('mdi', 'chatBgImage', {
    name: game.i18n.localize("MDI.config.chatBgImageName"),
    hint: game.i18n.localize("MDI.config.chatBgImageHint"),
    type: String,
    default: 'systems/mdi/style/images/white.webp',
    scope: 'world',
    requiresReload: true,
    config: true,
    filePicker: 'image',
  });

  game.settings.register('mdi', 'mainColor', {
      name: game.i18n.localize("MDI.config.mainColorName"),
      hint: game.i18n.localize("MDI.config.mainColorHint"),
      scope: 'world',
      requiresReload: true,
      config: true,
      type: String,
      default: '#395F64',
  });

  game.settings.register('mdi', 'secondaryColor', {
    name: game.i18n.localize("MDI.config.secondaryColorName"),
    hint: game.i18n.localize("MDI.config.secondaryColorHint"),
    scope: 'world',
    requiresReload: true,
    config: true,
    type: String,
    default: '#AEB7BA',
  }); 

  const root = document.querySelector(':root');
  let bgImagePath="url(../../../"+game.settings.get ("mdi", "bgImage")+")"
  root.style.setProperty('--bg-image',bgImagePath)
  let chatbgImagePath="url(../../../"+game.settings.get ("mdi", "chatBgImage")+")"
  root.style.setProperty('--chat-bg-image',chatbgImagePath)
  let mainColor=game.settings.get ("mdi", "mainColor")
  root.style.setProperty('--main-color',mainColor)
  let secondaryColor=game.settings.get ("mdi", "secondaryColor")
  root.style.setProperty('--secondary-color',secondaryColor)



  


  //DICE FACE HELPER
  Handlebars.registerHelper("times", function(n, content)
    {
      let result = "";
      for (let i = 0; i < n; ++i)
      {
          result += content.fn(i);
      }
    
      return result;
    });
    
  Handlebars.registerHelper("face", diceToFaces);

});


Hooks.on("renderPause", () => {
  $("#pause img").attr("class", "fa-spin pause-image");
  $("#pause figcaption").attr("class", "pause-mdi");
});

Hooks.on('renderSettingsConfig', (app, el, data) => {
  // Insert color picker input
  el.find('[name="mdi.mainColor"]').parent()
    .append(`<input type="color" value="${game.settings.get('mdi','mainColor')}" data-edit="mdi.mainColor">`)
  el.find('[name="mdi.secondaryColor"]').parent()
    .append(`<input type="color" value="${game.settings.get('mdi','secondaryColor')}" data-edit="mdi.secondaryColor">`) 
});

Hooks.on('renderChatLog', (app, html, data) => mdiChat.chatListeners(html))

Hooks.on('refreshToken', () => {

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