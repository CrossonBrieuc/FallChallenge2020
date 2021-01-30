// - - START VARIABLES - -

let tour=0

const int = parseInt
const str = toString
const reducer = (accumulator, currentValue) => accumulator + currentValue;

const rubi_importance=3   //immportance des rubis dans les calculs de chemin
const max_reccurence=15  //limite de reccurence pour path_finding()
const nb_learn=12     //nombre de sort apris en début de partie
const path_test_nbr=500    //nombre de test de chemin par potion



// - - - FUNCTION - - -

function rdmInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function place_maker(brew_action, spell_action,inv){
    /*
        cherche un moyen de faire de la place dans l'inventaire
    */
    res='NA'
    
    for (let i =0;i<brew_action.length;i++){
        addCost=[0,0,0,0]
        for (let x=0;x<4;x++){
            addCost[x]=inv[x]+brew_action[i].cost[x]
        }
        if (addCost.reduce(reducer)<11 && Math.min(...addCost)>=0){
            res = brew_action[i]
            break
        }
    }
    if (res=='NA'){
        for (let i =0;i<spell_action.length;i++){
            addCost=[0,0,0,0]
            for (let x=0;x<4;x++){
                addCost[x]=inv[x]+spell_action[i].cost[x]
            }
            if (addCost.reduce(reducer)<11 && Math.min(...addCost)>=0){
                res = spell_action[i]
                break
            }
        }
    }
    return res
}



function path_finding(potion_list, spell_list, inv){
    /*
        cherche le meilleur chemin a suivre pour faire des point
        input : -list des action
                -inventaire du joueur
        output : -1st action a realiser
    */

    let path_list=[];
    let path_value=-99999;
    let sort_spell_list=[[],[],[],[]];
    


    spell_list.forEach(x=>{
        for (let i=0;i<4;i++){
            if (x.cost[i]>0){
                sort_spell_list[i].push(x);
            }
        }
    });

    function action_rec(sec_inv, newinv, reverse, cmpt){
    /*
        fonction reccursive pour path_finding()
    */
    cmpt+=1;
    let inc=0;
    let choose_spell='NA';
    let action_list="";

    //cherche le 1er el manquant
    if (reverse==false){
        inc=newinv.indexOf(Math.min(newinv[0],newinv[1],newinv[2],newinv[3]));
    }else{
        inc=sec_inv.indexOf(Math.min(sec_inv[0],sec_inv[1],sec_inv[2],sec_inv[3]));
    }

    //choisi un sort aléatoire qui donne de l'el inc
    const lng=sort_spell_list[inc].length;
    for (let i=0;i<lng;i++){
        let x=sort_spell_list[inc][rdmInt(lng)];
        if (inv.reduce(reducer)+x.cost.reduce(reducer)<11 && x.cost[inc]>0){
            choose_spell=x;
            break;
        }
    }
    
    //test si un sort a été trouvé
    if (choose_spell=='NA' || cmpt==max_reccurence){
        return 'NA';
    }else{
        sec_inv=[...inv]

        for (let i=0;i<4;i++){
            newinv[i]+=choose_spell.cost[i];
            sec_inv[i]+=choose_spell.cost[i];
        }

        action_list+="CAST "+choose_spell.id+"|";

        if (choose_spell.ready==false){
            action_list+=('REST|');
        }
        if (Math.min(newinv[0],newinv[1],newinv[2],newinv[3])<0){
            action_list+=action_rec(sec_inv, newinv, false, cmpt);
        }else if (Math.min(sec_inv[0],sec_inv[1],sec_inv[2],sec_inv[3])<0){
            action_list+=action_rec(sec_inv, newinv, true, cmpt);
        }
        return action_list;
    }
}



    potion_list.forEach(x=>{
        let t0 = new Date().getTime();
        let path=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'NA'];
        let objectif=[];
        for (let i=0;i<4;i++){
            objectif.push(x.cost[i]+inv[i]);
        }
        if (Math.min(...objectif)>=0){
            path=['BREW '+x.id];
            current_value=x.price;
        }else{
            for (let i=0;i<path_test_nbr;i++){
                let newInv=[...inv];
                let newObj=[...objectif];
                path_test=action_rec(newInv, newObj, false, 0).split('|');
                if (path_test.length<path.length && path_test[path_test.length-1] != 'NA'){
                    path_test=path_test.splice(0,path_test.length-1)
                    path=path_test;
                }
            }
            current_value=x.price-(path.length*rubi_importance);
        }
        //console.error(x,"\n",current_value,path)
        if (current_value>path_value && path[path.length-1] != 'NA'){
            path_value=current_value
            path_list=path
        }
        let t1 = new Date().getTime();
        console.error("action_rec time : " + (t1 - t0) + " ms.");
    });
    if (path_list.length==0){
        path=place_maker(potion_list, spell_list,inv);
        if (path.ready==true || path.type=='BREW'){
            console.error("do : ",path)
            path_list=[path.type+" "+path.id];
        }else{
            path_list=['REST'];
        }
    }
    console.error(path_list)
    return path_list[path_list.length-1];
}



// - - - GAME LOOP - - -

while (true) {

    tour++;

    // - - VARIABLES - -

    let result="WAIT";
    let me={
        'inv':[],
        'score':0
    }
    let enemy={
        'inv':[],
        'score':0
    }
    let learn_action=[];
    let spell_action=[];
    let brew_action=[];
    
    // - - INPUT - -

    const actionCount = int(readline()); // the number of spells and recipes in play
    let t0 = new Date().getTime();
    for (let i = 0; i < actionCount; i++) {
        var inputs = readline().split(' ');
        const actionId = int(inputs[0]); // the unique ID of this spell or recipe
        const actionType = inputs[1]; // in the first league: BREW; later: CAST, OPPONENT_CAST, LEARN, BREW
        const delta0 = int(inputs[2]); // tier-0 ingredient change
        const delta1 = int(inputs[3]); // tier-1 ingredient change
        const delta2 = int(inputs[4]); // tier-2 ingredient change
        const delta3 = int(inputs[5]); // tier-3 ingredient change
        const price = int(inputs[6]); // the price in rupees if this is a potion
        const tomeIndex = int(inputs[7]); // in the first two leagues: always 0; later: the index in the tome if this is a tome spell, equal to the read-ahead tax; For brews, this is the value of the current urgency bonus
        const taxCount = int(inputs[8]); // in the first two leagues: always 0; later: the amount of taxed tier-0 ingredients you gain from learning this spell; For brews, this is how many times you can still gain an urgency bonus
        const castable = inputs[9] !== '0'; // in the first league: always 0; later: 1 if this is a castable player spell
        const repeatable = inputs[10] !== '0'; // for the first two leagues: always 0; later: 1 if this is a repeatable player spell

        if (actionType=="BREW"){
            brew_action.push({
                'type':actionType,
                'id':actionId,
                'cost':[delta0,delta1,delta2,delta3],
                'price':price,
            });
        }else if (actionType=='CAST'){
            spell_action.push({
                'type':actionType,
                'id':actionId,
                'cost':[delta0,delta1,delta2,delta3],
                'ready':castable
            });
        }else if (actionType=='LEARN'){
            learn_action.push({
                type:actionType,
                id:actionId
            });
        }
    }
    for (let i = 0; i < 2; i++) {
        var inputs = readline().split(' ');
        const inv0 = parseInt(inputs[0]); // tier-0 ingredients in inventory
        const inv1 = parseInt(inputs[1]);
        const inv2 = parseInt(inputs[2]);
        const inv3 = parseInt(inputs[3]);
        const score = parseInt(inputs[4]); // amount of rupees
        if (i==0){
            me.inv=[inv0,inv1,inv2,inv3];
            me.score=score;
        }else{
            enemy.inv=[inv0,inv1,inv2,inv3];
            enemy.score=score;
        }
    }

    // - - CHOIX ACTION - -

    if (tour<nb_learn){
        result = "LEARN " + learn_action[0].id;
    }else{
        result = path_finding(brew_action, spell_action, me.inv);
    }

    // - - DEBUG - -

    console.error(me,enemy);
    let t1 = new Date().getTime();
    console.error("time : " + (t1 - t0) + " ms.");

    // - - OUTPUT - -

    console.log(result);
}
