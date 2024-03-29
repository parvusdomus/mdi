export async function InitiativeRoll(actor_id)
{
    console.log ("ROLLING INITIATIVE")
    let actor=game.actors.get(actor_id)
    let explode=false
    let totalRoll = 0;
    let iniciativa = Number(actor.system.iniciativa.value)-Number(actor.system.iniciativa.penalizador);
    let dicelistbonus = " +"+actor.system.iniciativa.value
    if (Number(actor.system.iniciativa.penalizador)>0){
        dicelistbonus+=" - "+actor.system.iniciativa.penalizador
    }
    let rollText="1d6";
    let totalFinal = 0;
    let nVueltas = 0;
    let Fracaso = false;
    let dicelist = "";
    let Critico = false;
    let rollResult = "";
    do
	{
        explode=false;
		let roll = new Roll(rollText);
		let evaluateRoll = roll.evaluate({async: false});
        if (game.modules.get('dice-so-nice')?.active){
            game.dice3d.showForRoll(roll,game.user,true,false,null)
        }
        if (Number(evaluateRoll.total)===6){
            Critico = true
            explode = true
            totalRoll--
        }
		totalRoll += Number(evaluateRoll.total)
        if (dicelist==""){
            dicelist+=evaluateRoll.terms[0].results[0].result
        }
        else {
            dicelist+=" ,"+evaluateRoll.terms[0].results[0].result
        }
        if (Number(evaluateRoll.total)===1 && nVueltas ===0){
            explode = false
            let rollfail = new Roll(rollText);
		    let evaluateRollfail = rollfail.evaluate({async: false});
            if (game.modules.get('dice-so-nice')?.active){
                game.dice3d.showForRoll(rollfail,game.user,true,false,null)
            }
            if (Number(evaluateRollfail.total)===1){
                Fracaso = true;
            }
        }   
        nVueltas++
	}while(explode);
    console.log ("TOTAL ROLL")
    console.log (totalRoll)
    totalFinal=Number(totalRoll)+Number(iniciativa)
    if (Fracaso == true){totalFinal=-1}
    console.log ("TOTAL FINAL")
    console.log (totalFinal)
    if (Fracaso == true){
        rollResult="<td class=\"failure\">Fallo Crítico</td>"
    }
    if (Critico == true){
        rollResult="<td class=\"success\">Éxito Crítico</td>"
    }
    let renderedRoll = await renderTemplate("systems/mdi/templates/chat/initiativeResult.html", { 
        pjName: actor.name,
        pjImage: actor.prototypeToken.texture.src,
        rollTitle: "Tirada de Iniciativa",
        totalRoll: totalFinal, 
        dicelist: dicelist,
        rollResult: rollResult,
        dicelistbonus: dicelistbonus,
        actor_id: actor_id
    });

    const chatData = {
        speaker: ChatMessage.getSpeaker(),
        content: renderedRoll
    };

    ChatMessage.create(chatData);
    
    return totalFinal;
}