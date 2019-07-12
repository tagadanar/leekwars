import requests
import json
import random
import time
import sys

login = ''
password = ''
leekid = ''
nb_fight = 50 # todo get
delay = 2 # in seconds

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

switcher = {
	0: bcolors.WARNING+"DRAW"+bcolors.ENDC,
	1: bcolors.OKGREEN+"WIN "+bcolors.ENDC,
	2: bcolors.FAIL+"LOSE"+bcolors.ENDC
}


# connection
s = requests.session()
r = s.post("https://leekwars.com/api/farmer/login-token/", data={'login':login,'password':password})
token = r.json()['token']

while nb_fight > 0:
	# pick a rand adv from sologarden
	r = s.get("https://leekwars.com/api/garden/get-leek-opponents/%s"%leekid, headers={'Authorization': 'Bearer %s'%token}, data={'leek_id':leekid})
	garden = r.json()['opponents']
	e = random.choice(garden)
	eid = e['id']
	
	# launch the fight
	r = s.post("https://leekwars.com/api/garden/start-solo-fight/%s/%s"%(leekid,eid), headers={'Authorization': 'Bearer %s'%token}, data={'leek_id':leekid,'target_id':eid})
	fight_id = r.json()['fight']
	nb_fight -= 1
	
	waiting = True
	firstwait = True
	while waiting:
		r = s.get("https://leekwars.com/api/fight/get/%s"%fight_id, headers={'Authorization': 'Bearer %s'%token}, data={'fight_id':fight_id})
		result = r.json()['fight']
		winner = result['winner']
		if winner==-1:
			if firstwait:
				sys.stdout.write('waiting.')
				firstwait = False
			else:
				sys.stdout.write('.')
			sys.stdout.flush()
			time.sleep(delay)
			continue
		elif winner>=0:
			win = switcher.get(winner, 'WTF?')
			print("\r%s %s -lvl%s (%s) vs %s (%s)"%(win, result['leeks1'][0]['name'], result['leeks1'][0]['level'], result['leeks1'][0]['talent'], result['leeks2'][0]['name'], result['leeks2'][0]['talent']))
			sys.stdout.flush()
			waiting = False
