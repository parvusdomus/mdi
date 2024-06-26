export async function InitiativeRoll(actor_id)
{
    let actor=game.actors.get(actor_id)
    let explode=false
    let totalRoll = 0;
    let totalRoll1 = 0;
    let totalRoll2 = 0;
    let iniciativa = Number(actor.system.iniciativa.value);
    let rollType = "normal"
    if (actor.type=="Jugador"||actor.type=="Villano"||actor.type=="Sobrenatural")
    {
        iniciativa-=Number(actor.system.iniciativa.penalizador);
        rollType = actor.system.iniciativa.tipo;
    }
    let dicelistbonus = " +"+actor.system.iniciativa.value
    if (Number(actor.system.iniciativa.penalizador)>0){
        dicelistbonus+=" - "+actor.system.iniciativa.penalizador
    }
    let rollText="1d6";
    let totalFinal = 0;
    let nVueltas = 0;
    let Fracaso = false;
    let Fracaso1 = false;
    let Fracaso2 = false;
    let dicelist = "";
    let dicelist1 = "";
    let dicelist2 = "";
    let baddicelist = "";
    let Critico = false;
    let rollResult = "";
    let showbad = false;
    
    do
	{
        explode=false;
		let roll = new Roll(rollText);
		let evaluateRoll = await roll.evaluate();
        if (game.modules.get('dice-so-nice')?.active){
            game.dice3d.showForRoll(roll,game.user,true,false,null)
        }
        if (Number(evaluateRoll.total)===6){
            Critico = true
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
		    let evaluateRollfail = await rollfail.evaluate();
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
                let evaluateRoll = await roll.evaluate();
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
                    let evaluateRollfail = await rollfail.evaluate();
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
                let evaluateRoll = await roll.evaluate();
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
                    let evaluateRollfail = await rollfail.evaluate();
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

    totalFinal=Number(totalRoll)+Number(iniciativa)
    if (Fracaso == true){totalFinal=-1}
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
        actor_id: actor_id,
        showbad: showbad,
        baddicelist: baddicelist,
    });

    const chatData = {
        speaker: ChatMessage.getSpeaker(),
        content: renderedRoll
    };

    ChatMessage.create(chatData);
    
    return totalFinal;
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
    let resultList = "";
    let showbad = false;
    let Fracaso1 = false;
    let Fracaso2 = false;
    let Fracaso = false;
    let nVueltas = 0;
    let danototal = 0;
    let targetImage = "/systems/mdi/style/icons/uncertainty.webp";
    let targetName = ""
    let target= Array.from(game.user.targets)[0]?.actor;
      if (target){
        targetImage=target.prototypeToken.texture.src
        targetName=target.name
      }

    
    do
	{
        explode=false;
		let roll = new Roll(rollText);
		let evaluateRoll = await roll.evaluate();
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
		    let evaluateRollfail = await rollfail.evaluate();
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
                let evaluateRoll = await roll.evaluate();
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
                    let evaluateRollfail = await rollfail.evaluate();
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
                let evaluateRoll = await roll.evaluate();
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
                    let evaluateRollfail = await rollfail.evaluate();
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
        danototal = (Number(totalFinal) + Number(dano) + Number(modificadordano)) - (Number(dificultad) + Number(armadura))
        if (danototal < 0){
            danototal = 0
        }
        rollResult="<td class=\"success aplicadano\" data-dano="+danototal+">Click para aplicar daño: "+danototal+"</td>"
        resultList="<td>("+totalFinal+"+"+dano
        if (modificadordano != 0){
            resultList+="+"+modificadordano
        }
        resultList+=") - ("+dificultad
        if (armadura != 0){
            resultList+="+"+armadura
        }
        resultList+=")</td>"
        
    }
    else {
        rollResult="<td class=\"failure\">Fallo</td>"
    }
    if (Fracaso == true){
        rollResult="<td class=\"failure\">Fallo Crítico</td>"
    }

    let renderedRoll = await renderTemplate("systems/mdi/templates/chat/weaponTestResult.html", { 
        pjName: actor.name,
        pjImage: actor.prototypeToken.texture.src,
        rollTitle: titulo,
        totalRoll: totalFinal, 
        dicelist: dicelist,
        rollResult: rollResult,
        resultList: resultList,
        showbad: showbad,
        baddicelist: baddicelist,
        dicelistbonus: dicelistbonus,
        targetImage: targetImage,
        targetName: targetName,
        actor_id: actor_id
    });

    const chatData = {
        speaker: ChatMessage.getSpeaker(),
        content: renderedRoll
    };

    ChatMessage.create(chatData);
    return;

}