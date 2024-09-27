export default class mdiChat {
    static chatListeners (html) {
      html.on('click', '.aplicadano', this._aplicaDano.bind(this));
    }

    static _aplicaDano (event, data){
      const dataset = event.currentTarget.dataset;
      const element = event.currentTarget;
      let target= Array.from(game.user.targets)[0]?.actor;
      const effect = CONFIG.statusEffects.find(e => e.id === CONFIG.specialStatusEffects.DEFEATED);
      let combatant 
      if (game.combat){
        combatant= game.combat.getCombatantByActor(target);
      }
      if (!target){
        ui.notifications.warn(game.i18n.localize("Debes seleccionar un objetivo"));
      }
      else {
        let currentpv=Number(target.system.pv.value)-Number(dataset.dano)
        if (currentpv < 0){currentpv=0}
        target.update ({ 'system.pv.value': currentpv });
        ui.notifications.info(target.name+" recibe daño: "+dataset.dano); 
        if (currentpv <= 0){
          ui.notifications.info(target.name+" ha muerto...");
          target.update({defeated: true});
          if (combatant){
            combatant.token.toggleActiveEffect(effect, {overlay: true});
            return combatant.update({defeated: true});
          }
          else{ 
            let label = "dead";
            let icon = "systems/mdi/style/icons/death-skull.svg"
            let effect = {
              label,
              icon,
              flags: {
                core:{
                  statusId: "dead",
                  overlay: true
                }
              }
            }
            target.createEmbeddedDocuments("ActiveEffect", [effect])
          }
        }

        console.log (target)
      }

    }
}