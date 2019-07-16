#!/usr/bin/env python3
import requests
import json
import random
import time
import sys

_FARMER_ = '_______' # todo make it uuid or something... ?
delay = 2 # seconds between each check when waiting for fight result

# add an object for each account
accounts = [
	{
		'login': '<my_account_login>', 
		'password': '<my_account_password>',
		'todolist': {
			'<my_leekID>': 10,
			'<my_otherID>': 10,
			_FARMER_:10,
		}
	},
]

#################################################################
# Declaring global & functions
#################################################################
class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

winnerSwitch = {
	0: bcolors.WARNING+"DRAW"+bcolors.ENDC,
	1: bcolors.OKGREEN+"WIN "+bcolors.ENDC,
	2: bcolors.FAIL+"LOSE"+bcolors.ENDC,
}

# launch a solo fight against random adv, return fight_id
def solo_fight(leekid):
	# pick a rand adv from sologarden
	r = s.get("https://leekwars.com/api/garden/get-leek-opponents/%s"%leekid, headers=headers, data={'leek_id':leekid})
	garden = r.json()['opponents']
	e = random.choice(garden)
	eid = e['id']
	# launch the fight
	r = s.post("https://leekwars.com/api/garden/start-solo-fight/%s/%s"%(leekid,eid), headers=headers, data={'leek_id':leekid, 'target_id':eid})
	fight_id = r.json()['fight']
	return fight_id
	
# launch a farmer fight against random adv, return fight_id
def farmer_fight():
	# pick a rand adv from farmergarden
	r = s.get("https://leekwars.com/api/garden/get-farmer-opponents", headers=headers)
	garden = r.json()['opponents']
	e = random.choice(garden)
	eid = e['id']
	# launch the fight
	r = s.post("https://leekwars.com/api/garden/start-farmer-fight/%s"%eid, headers=headers, data={'leek_id':leekid,'target_id':eid})
	fight_id = r.json()['fight']
	return fight_id

# wait for fight result then print it
def wait_fight_result(fight_id, is_farmer):
	firstwait = True
	while True:
		r = s.get("https://leekwars.com/api/fight/get/%s"%fight_id, headers=headers, data={'fight_id':fight_id})
		result = r.json()['fight']
		winner = result['winner']
		if winner==-1: # Fight isn't resolved yet
			if firstwait:
				sys.stdout.write('waiting.')
				firstwait = False
			else:
				sys.stdout.write('.')
			sys.stdout.flush()
			time.sleep(delay)
			continue
		elif winner>=0:
			win = winnerSwitch.get(winner, 'WTF?')
			if is_farmer:
				print("\r%s %s (%s) vs %s (%s)"%(win, result['report']['farmer1']['name'], result['report']['farmer1']['talent'], result['report']['farmer2']['name'], result['report']['farmer2']['talent']))
			else:
				print("\r%s %s -lvl%s (%s) vs %s (%s)"%(win, result['leeks1'][0]['name'], result['leeks1'][0]['level'], result['leeks1'][0]['talent'], result['leeks2'][0]['name'], result['leeks2'][0]['talent']))
			sys.stdout.flush()
			return

#################################################################
# Main program
#################################################################

for account in accounts:
	login = account.get('login')
	password = account.get('password')
	todolist = account.get('todolist')
	
	# connecting to leekwars
	s = requests.session()
	r = s.post("https://leekwars.com/api/farmer/login-token/", data={'login':login,'password':password})
	headers = {'Authorization': 'Bearer %s'%r.json()['token']}

	# processing todolist
	for leekid, nb_fight in todolist.items():
		while nb_fight > 0:
			is_farmer = leekid == _FARMER_
			if is_farmer:
				fight_id = farmer_fight()
			else:
				fight_id = solo_fight(leekid)
				
			nb_fight -= 1
			wait_fight_result(fight_id, is_farmer)
