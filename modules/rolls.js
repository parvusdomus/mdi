export async function DiceRoll(actor_id,rolltitle,rollType,nombreatributo, nombrepericia, valotatributo, periciaentrenada, modificador, dificultad)
{
    console.log ("FUNCION DE TIRADA")
    console.log ("ACTOR ID")
    console.log (actor_id)
    console.log ("ROLL TYPE")
    console.log (rollType)
    console.log ("NOMBRE ATRIBUTO")
    console.log (nombreatributo)
    console.log ("NOMBRE PERICIA")
    console.log (nombrepericia)
    console.log ("VALOR ATRIBUTO")
    console.log (valotatributo)
    console.log ("PERICIA ENTRENADA?")
    console.log (periciaentrenada)
    console.log ("MODIFICADOR")
    console.log (modificador)
    console.log ("DIFICULTAD")
    console.log (dificultad)
    let actor=game.actors.get(actor_id)
    let explode=false
    let totalRoll = 0;
    let totalRoll1 = 0;
    let totalRoll2 = 0;
    let dicelist = "";
    let dicelist1 = "";
    let dicelist2 = "";
    let rollText="1d6";
    let titulo=rolltitle+" VS "+dificultad;
    let totalFinal = 0;
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
            explode = true
            totalRoll1--
        }
		totalRoll1 += Number(evaluateRoll.total)
        if (dicelist1==""){
            dicelist1+=evaluateRoll.terms[0].results[0].result
        }
        else {
            dicelist1+=" ,"+evaluateRoll.terms[0].results[0].result
        }   
	}while(explode);

    switch (rollType){
        case 'normal':
        {
          totalRoll = totalRoll1
          dicelist = dicelist1
          break;
        }
        case 'ventaja':
        {
            do
            {
                explode=false;
                let roll = new Roll(rollText);
                let evaluateRoll = roll.evaluate({async: false});
                if (game.modules.get('dice-so-nice')?.active){
                    game.dice3d.showForRoll(roll,game.user,true,false,null)
                }
                if (Number(evaluateRoll.total)===6){
                    explode = true
                    totalRoll2--
                }
                totalRoll2 += Number(evaluateRoll.total)
                if (dicelist2==""){
                    dicelist2+=evaluateRoll.terms[0].results[0].result
                }
                else {
                    dicelist2+=" ,"+evaluateRoll.terms[0].results[0].result
                }   
            }while(explode);
            if (totalRoll1 >= totalRoll2){
                totalRoll=totalRoll1
                dicelist=dicelist1
            }
            else{
                totalRoll=totalRoll2
                dicelist=dicelist2 
            }
          break;
        }
        case 'desventaja':
        {
            do
            {
                explode=false;
                let roll = new Roll(rollText);
                let evaluateRoll = roll.evaluate({async: false});
                if (game.modules.get('dice-so-nice')?.active){
                    game.dice3d.showForRoll(roll,game.user,true,false,null)
                }
                if (Number(evaluateRoll.total)===6){
                    explode = true
                    totalRoll2--
                }
                totalRoll2 += Number(evaluateRoll.total)
                if (dicelist2==""){
                    dicelist2+=evaluateRoll.terms[0].results[0].result
                }
                else {
                    dicelist2+=" ,"+evaluateRoll.terms[0].results[0].result
                }   
            }while(explode);
            if (totalRoll1 <= totalRoll2){
                totalRoll=totalRoll1
                dicelist=dicelist1
            }
            else{
                totalRoll=totalRoll2
                dicelist=dicelist2 
            }  
          break;
        }
      }
    
    console.log ("TIRADA 1")
    console.log (totalRoll1)
    console.log (dicelist1)
    console.log ("TIRADA 2")
    console.log (totalRoll2)
    console.log (dicelist2)
    console.log ("TIRADA ELEGIDA")
    console.log (totalRoll)
    console.log (dicelist)
    totalFinal=Number(totalRoll)
    totalFinal+=Number(valotatributo)
    dicelist+=" + "+valotatributo
    if (periciaentrenada==true){
        totalFinal+=2
        dicelist+=" + 2"
    }
    if (Number(modificador) != 0){
        totalFinal+=Number(modificador)
        if (Number(modificador)>0){
            dicelist+=" + "
        }
        dicelist+=modificador
    }
    if (totalFinal >= Number(dificultad)){
        rollResult="<td class=\"success\">Éxito</td>"
    }
    else {
        rollResult="<td class=\"failure\">Fallo</td>"
    }

    let renderedRoll = await renderTemplate("systems/mdi/templates/chat/simpleTestResult.html", { 
        pjName: actor.name,
        pjImage: actor.prototypeToken.texture.src,
        rollTitle: titulo,
        totalRoll: totalFinal, 
        dicelist: dicelist,
        rollResult: rollResult,
        actor_id: actor_id
    });

    const chatData = {
        speaker: ChatMessage.getSpeaker(),
        content: renderedRoll
    };

    ChatMessage.create(chatData);
    return;

}
