export default class mdiChat {
    static chatListeners (html) {
      html.on('click', '.aplicadano', this._aplicaDano.bind(this));
    }

    static _aplicaDano (event, data){
      const dataset = event.currentTarget.dataset;
      const element = event.currentTarget;
      let target= Array.from(game.user.targets)[0]?.actor;
      const effect = CONFIG.statusEffects.find(e => e.id === CONFIG.specialStatusEffects.DEFEATED);
      const combatant = game.combat.getCombatantByActor(target);
      if (!target){
        ui.notifications.warn(game.i18n.localize("Debes seleccionar un objetivo"));
      }
      else {
        let currentpv=Number(target.system.pv.value)
        currentpv-=Number(dataset.dano)
        if (currentpv < 0){currentpv=0}
        target.update ({ 'system.pv.value': currentpv });
        ui.notifications.info(target.name+" recibe daño: "+dataset.dano); 
        if (currentpv <= 0){
          ui.notifications.info(target.name+" ha muerto...");
          target.update({defeated: true});
          combatant.token.toggleActiveEffect(effect, {overlay: true});
          return combatant.update({defeated: true});
          
        }
      }

    }
}