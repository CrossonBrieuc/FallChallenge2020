import sys
import math
import time
import random
import copy


# - - START VARIABLES - -

tour=0

rubi_importance=3   #immportance des rubis dans les calculs de chemin
max_reccurence=10   #limite de reccurence pour path_finding()
nb_learn=12     #nombre de sort apris en début de partie
path_test_nbr=20    #nombre de test de chemin par potion


# - - - FUNCTION - - -

def place_maker(brew_action, spell_action,inv):
    '''
        cherche un moyen de faire de la place dans l'inventaire
    '''
    res='NA'
    
    for i in brew_action:
        cost=[0,0,0,0]
        for x in range(4):
            cost[x]=inv[x]+i['cost'][x]
        if sum(cost)<11 and min(cost)>=0:
            res = i
            break

    if res=='NA':
        for i in spell_action:
            cost=[0,0,0,0]
            for x in range(4):
                cost[x]=inv[x]+i['cost'][x]
            if sum(cost)<11 and min(cost)>=0:
                res = i
                break
    return res



def action_rec(start_inv, sec_inv, inv, spell_list, reverse, cmpt):
    '''
        fonction reccursive pour path_finding()
    '''
    cmpt+=1
    inc=0
    choose_spell='NA'
    action_list=""

    #cherche le 1er el manquant
    if reverse==False:
        inc=inv.index(min(inv))
    else:
        inc=sec_inv.index(min(sec_inv))
    

    #choisi un sort aléatoire qui donne de l'el inc
    lng=len(spell_list[inc])
    for i in range(lng):
        x=spell_list[inc][random.randint(0,lng-1)]
        if sum(start_inv)+sum(x['cost'])<11 and x['cost'][inc]>0:
            choose_spell=x
            break

    
    #test si un sort a été trouvé
    if choose_spell=='NA' or cmpt==max_reccurence:
        return 'NA'
    else:
        sec_inv=copy.copy(start_inv)

        for i in range(4):
            inv[i]+=choose_spell['cost'][i]
            sec_inv[i]+=choose_spell['cost'][i]

        action_list+="CAST "+str(choose_spell['id'])+"|"

        if choose_spell['ready']==False:
            action_list+=('REST|')

        if min(inv)<0:
            action_list+=action_rec(start_inv, sec_inv, inv, spell_list, False, cmpt)
        elif min(sec_inv)<0:
            action_list+=action_rec(start_inv, sec_inv, inv, spell_list, True, cmpt)

        return action_list


def path_finding(potion_list, spell_list, inv, time1):
    '''
        cherche le meilleur chemin a suivre pour faire des point
        input : -list des action
                -inventaire du joueur
        output : -1st action a realiser
    '''

    path_list=[]
    path_value=-99999
    sort_spell_list=[[],[],[],[]]

    for x in spell_list:
        for i in range(4):
            if x['cost'][i]>0:
                sort_spell_list[i].append(x)

    for x in potion_list:
        path='NNNNNNNNNNNNNNNNNNNNNNNNN'

        objectif=[]
        for i in range(4):
            objectif.append(x['cost'][i]+inv[i])

        if min(objectif)>=0:
            path=['BREW '+str(x['id'])]
            current_value=x['price']
        else:
            for i in range(path_test_nbr):
                path_test=action_rec(inv, copy.copy(inv), copy.copy(objectif), copy.deepcopy(sort_spell_list), False, 0)[:-1].split('|')
                if len(path_test)<len(path) and 'N' not in path_test:
                    path=path_test
            current_value=x['price']-(len(path)*rubi_importance)

        time2 = time.process_time()
        print(x,"\ntime :",round((time2-time1)*1000,5),"ms", file=sys.stderr, flush=True)

        print(current_value,path, file=sys.stderr, flush=True)
        
        if current_value>path_value and 'N' not in path:
            path_value=current_value
            path_list=path

    if len(path_list)==0:
        path=place_maker(potion_list, spell_list,inv)
        print("do :",path, file=sys.stderr, flush=True)
        if path['ready']==True or path['type']=='BREW':
            path_list=[str(path['type'])+" "+str(path['id'])]
        else:
            path_list=['REST']

    #print(path_list[-1],path_value, file=sys.stderr, flush=True)
    return path_list[-1]




# - - - GAME LOOP - - -

while True:

    tour+=1
    time_start = time.process_time()

    # - - VARIABLES - -

    result="WAIT"
    me={
        'inv':[],
        'score':0
    }
    enemy={
        'inv':[],
        'score':0
    }
    learn_action=[]
    spell_action=[]
    brew_action=[]

    # - - INPUT - -

    action_count = int(input())  # the number of spells and recipes in play
    for i in range(action_count):
        # action_type: in the first league: BREW; later: CAST, OPPONENT_CAST, LEARN, BREW
        # tome_index: in the first two leagues: always 0; later: the index in the tome if this is a tome spell, equal to the read-ahead tax
        # tax_count: in the first two leagues: always 0; later: the amount of taxed tier-0 ingredients you gain from learning this spell
        # castable: in the first league: always 0; later: 1 if this is a castable player spell
        # repeatable: for the first two leagues: always 0; later: 1 if this is a repeatable player spell
        action_id, action_type, delta_0, delta_1, delta_2, delta_3, price, tome_index, tax_count, castable, repeatable = input().split()

        tome_index = int(tome_index)
        tax_count = int(tax_count)
        castable = castable != "0"
        repeatable = repeatable != "0"

        if action_type=="BREW":
            brew_action.append({
                'type':action_type,
                'id':int(action_id),
                'cost':[int(delta_0),int(delta_1),int(delta_2),int(delta_3)],
                'price':int(price),
            })
        elif action_type=='CAST':
            spell_action.append({
                'type':action_type,
                'id':int(action_id),
                'cost':[int(delta_0),int(delta_1),int(delta_2),int(delta_3)],
                'ready':castable
            })
        elif action_type=='LEARN':
            learn_action.append({
                'type':action_type,
                'id':int(action_id)
            })

    for i in range(2):
        Input = [int(j) for j in input().split()]
        if i==0 : me['inv']=Input[:4] ; me['score']=Input[4]
        else : enemy['inv']=Input[:4] ; enemy['score']=Input[4]


    


    # - - CHOIX ACTION - -


    if tour<nb_learn:
        result="LEARN "+str(learn_action[0]['id'])
    else:
        result = path_finding(brew_action, spell_action, me['inv'], time_start)

    # - - DEBUG - -

    # To debug: print("Debug", file=sys.stderr, flush=True)
    print("ME :",me,"\nEN :",enemy, file=sys.stderr, flush=True)

    print("round :",tour, file=sys.stderr, flush=True)
    time_end=time.process_time()
    print("time :",round((time_end-time_start)*1000,5),"ms", file=sys.stderr, flush=True)


    # - - OUTPUT - -

    # in the first league: BREW <id> | WAIT; later: BREW <id> | CAST <id> [<times>] | LEARN <id> | REST | WAIT
    print(result)
