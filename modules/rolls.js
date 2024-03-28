export async function DiceRoll(actor_id,rolltitle,rollType,nombreatributo, nombrepericia, valotatributo, periciaentrenada, pericia, penalizador, modificador, dificultad)
{
    let actor=game.actors.get(actor_id)
    let explode=false
    let totalRoll = 0;
    let totalRoll1 = 0;
    let totalRoll2 = 0;
    let dicelist = "";
    let dicelist1 = "";
    let dicelist2 = "";
    let baddicelist = "";
    let dicelistbonus = "";
    let rollText="1d6";
    let titulo=rolltitle+" VS "+dificultad;
    let totalFinal = 0;
    let rollResult = "";
    let showbad = false;
    let Fracaso1 = false;
    let Fracaso2 = false;
    let Fracaso = false;
    let nVueltas = 0;
    
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
        if (Number(evaluateRoll.total)===1 && nVueltas ===0){
            explode = false
            let rollfail = new Roll(rollText);
		    let evaluateRollfail = rollfail.evaluate({async: false});
            if (game.modules.get('dice-so-nice')?.active){
                game.dice3d.showForRoll(rollfail,game.user,true,false,null)
            }
            dicelist1+=" ,"+evaluateRollfail.terms[0].results[0].result
            if (Number(evaluateRollfail.total)===1){
                Fracaso1 = true;
            }
        }   
        nVueltas++
	}while(explode);

    nVueltas = 0
    switch (rollType){
        case 'normal':
        {
          totalRoll = totalRoll1
          dicelist = dicelist1
          Fracaso = Fracaso1
          break;
        }
        case 'ventaja':
        {
            showbad = true;
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
                if (Number(evaluateRoll.total)===1 && nVueltas ===0){
                    explode = false
                    let rollfail = new Roll(rollText);
                    let evaluateRollfail = rollfail.evaluate({async: false});
                    if (game.modules.get('dice-so-nice')?.active){
                        game.dice3d.showForRoll(rollfail,game.user,true,false,null)
                    }
                    dicelist2+=" ,"+evaluateRollfail.terms[0].results[0].result
                    if (Number(evaluateRollfail.total)===1){
                        Fracaso2 = true;
                    }
                } 
                nVueltas++   
            }while(explode);
            if (totalRoll1 >= totalRoll2){
                totalRoll=totalRoll1
                dicelist=dicelist1
                baddicelist=dicelist2
                Fracaso=Fracaso1
            }
            else{
                totalRoll=totalRoll2
                dicelist=dicelist2 
                baddicelist=dicelist1
                Fracaso=Fracaso2
            }
          break;
        }
        case 'desventaja':
        {
            showbad=true;
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
                if (Number(evaluateRoll.total)===1 && nVueltas ===0){
                    explode = false
                    let rollfail = new Roll(rollText);
                    let evaluateRollfail = rollfail.evaluate({async: false});
                    if (game.modules.get('dice-so-nice')?.active){
                        game.dice3d.showForRoll(rollfail,game.user,true,false,null)
                    }
                    dicelist2+=" ,"+evaluateRollfail.terms[0].results[0].result
                    if (Number(evaluateRollfail.total)===1){
                        Fracaso2 = true;
                    }
                } 
                nVueltas++   
            }while(explode);
            if (totalRoll1 <= totalRoll2){
                totalRoll=totalRoll1
                dicelist=dicelist1
                baddicelist=dicelist2
                Fracaso=Fracaso1
            }
            else{
                totalRoll=totalRoll2
                dicelist=dicelist2 
                baddicelist=dicelist1
                Fracaso=Fracaso2
            }  
          break;
        }
    }
    totalFinal=Number(totalRoll)
    totalFinal+=Number(valotatributo)
    dicelistbonus+=" + "+valotatributo
    if (periciaentrenada==true){
        totalFinal+=2
        dicelistbonus+=" + 2"
    }
    if ((penalizador < 0) && ((pericia=="atletismo")||(pericia=="acrobacias")||(pericia=="sigilo"))){
        totalFinal+=penalizador
        dicelistbonus+=" "+penalizador
    }
    if (Number(modificador) != 0){
        totalFinal+=Number(modificador)
        if (Number(modificador)>0){
            dicelistbonus+=" + "
        }
        dicelistbonus+=modificador
    }
    if (totalFinal >= Number(dificultad)){
        rollResult="<td class=\"success\">Éxito</td>"
    }
    else {
        rollResult="<td class=\"failure\">Fallo</td>"
    }
    if (Fracaso == true){
        rollResult="<td class=\"failure\">Fallo Crítico</td>"
    }

    let renderedRoll = await renderTemplate("systems/mdi/templates/chat/simpleTestResult.html", { 
        pjName: actor.name,
        pjImage: actor.prototypeToken.texture.src,
        rollTitle: titulo,
        totalRoll: totalFinal, 
        dicelist: dicelist,
        rollResult: rollResult,
        showbad: showbad,
        baddicelist: baddicelist,
        dicelistbonus: dicelistbonus,
        actor_id: actor_id
    });

    const chatData = {
        speaker: ChatMessage.getSpeaker(),
        content: renderedRoll
    };

    ChatMessage.create(chatData);
    return;

}

export async function WeaponRoll(actor_id,rolltitle,rollType,nombreatributo, nombrepericia, valotatributo, periciaentrenada, modificador, dificultad, dano, modificadordano, armadura)
{
    let actor=game.actors.get(actor_id)
    let explode=false
    let totalRoll = 0;
    let totalRoll1 = 0;
    let totalRoll2 = 0;
    let dicelist = "";
    let dicelist1 = "";
    let dicelist2 = "";
    let baddicelist = "";
    let dicelistbonus = "";
    let rollText="1d6";
    let titulo=rolltitle+" VS "+dificultad;
    let totalFinal = 0;
    let rollResult = "";
    let showbad = false;
    let Fracaso1 = false;
    let Fracaso2 = false;
    let Fracaso = false;
    let nVueltas = 0;
    let targetImage = "/systems/mdi/style/icons/uncertainty.webp";
    let target= Array.from(game.user.targets)[0]?.actor;
      if (target){
        targetImage=target.prototypeToken.texture.src
      }

    
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
        if (Number(evaluateRoll.total)===1 && nVueltas ===0){
            explode = false
            let rollfail = new Roll(rollText);
		    let evaluateRollfail = rollfail.evaluate({async: false});
            if (game.modules.get('dice-so-nice')?.active){
                game.dice3d.showForRoll(rollfail,game.user,true,false,null)
            }
            dicelist1+=" ,"+evaluateRollfail.terms[0].results[0].result
            if (Number(evaluateRollfail.total)===1){
                Fracaso1 = true;
            }
        }   
        nVueltas++
	}while(explode);

    nVueltas = 0
    switch (rollType){
        case 'normal':
        {
          totalRoll = totalRoll1
          dicelist = dicelist1
          Fracaso = Fracaso1
          break;
        }
        case 'ventaja':
        {
            showbad = true;
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
                if (Number(evaluateRoll.total)===1 && nVueltas ===0){
                    explode = false
                    let rollfail = new Roll(rollText);
                    let evaluateRollfail = rollfail.evaluate({async: false});
                    if (game.modules.get('dice-so-nice')?.active){
                        game.dice3d.showForRoll(rollfail,game.user,true,false,null)
                    }
                    dicelist2+=" ,"+evaluateRollfail.terms[0].results[0].result
                    if (Number(evaluateRollfail.total)===1){
                        Fracaso2 = true;
                    }
                } 
                nVueltas++   
            }while(explode);
            if (totalRoll1 >= totalRoll2){
                totalRoll=totalRoll1
                dicelist=dicelist1
                baddicelist=dicelist2
                Fracaso=Fracaso1
            }
            else{
                totalRoll=totalRoll2
                dicelist=dicelist2 
                baddicelist=dicelist1
                Fracaso=Fracaso2
            }
          break;
        }
        case 'desventaja':
        {
            showbad=true;
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
                if (Number(evaluateRoll.total)===1 && nVueltas ===0){
                    explode = false
                    let rollfail = new Roll(rollText);
                    let evaluateRollfail = rollfail.evaluate({async: false});
                    if (game.modules.get('dice-so-nice')?.active){
                        game.dice3d.showForRoll(rollfail,game.user,true,false,null)
                    }
                    dicelist2+=" ,"+evaluateRollfail.terms[0].results[0].result
                    if (Number(evaluateRollfail.total)===1){
                        Fracaso2 = true;
                    }
                } 
                nVueltas++   
            }while(explode);
            if (totalRoll1 <= totalRoll2){
                totalRoll=totalRoll1
                dicelist=dicelist1
                baddicelist=dicelist2
                Fracaso=Fracaso1
            }
            else{
                totalRoll=totalRoll2
                dicelist=dicelist2 
                baddicelist=dicelist1
                Fracaso=Fracaso2
            }  
          break;
        }
    }
    totalFinal=Number(totalRoll)
    totalFinal+=Number(valotatributo)
    dicelistbonus+=" + "+valotatributo
    if (periciaentrenada==true){
        totalFinal+=2
        dicelistbonus+=" + 2"
    }
    if (Number(modificador) != 0){
        totalFinal+=Number(modificador)
        if (Number(modificador)>0){
            dicelistbonus+=" + "
        }
        dicelistbonus+=modificador
    }
    if (totalFinal >= Number(dificultad)){
        rollResult="<td class=\"success\">Éxito</td>"
    }
    else {
        rollResult="<td class=\"failure\">Fallo</td>"
    }

    let renderedRoll = await renderTemplate("systems/mdi/templates/chat/weaponTestResult.html", { 
        pjName: actor.name,
        pjImage: actor.prototypeToken.texture.src,
        rollTitle: titulo,
        totalRoll: totalFinal, 
        dicelist: dicelist,
        rollResult: rollResult,
        showbad: showbad,
        baddicelist: baddicelist,
        dicelistbonus: dicelistbonus,
        targetImage: targetImage,
        actor_id: actor_id
    });

    const chatData = {
        speaker: ChatMessage.getSpeaker(),
        content: renderedRoll
    };

    ChatMessage.create(chatData);
    return;

}