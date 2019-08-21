#!/usr/bin/env python3
import requests
import json
import random
import time
import sys

#################################################################
# Declaring global
#################################################################

class behavior:
	BALANCED = 'BALANCED' # split fights in 5 for each leeks + farmer
	EQUALIZE = 'EQUALIZE' # focus on the lowest leek
	FARMING  = 'FARMING'  # focus on farmer
	# EFARMING = 'EFARMING' # TODO regroup levels then focus on farmer
	TODOLIST = 'TODOLIST' # do the todolist (ignore limit)

class bcolors:
	HEADER = '\033[95m'		# purple
	OKBLUE = '\033[94m'		# blue
	OKGREEN = '\033[92m'	# green
	WARNING = '\033[93m' 	# yellow
	FAIL = '\033[91m'		# red
	ENDC = '\033[0m'
	BOLD = '\033[1m'
	UNDERLINE = '\033[4m'

winnerSwitch = {
	0: bcolors.WARNING+"DRAW"+bcolors.ENDC,
	1: bcolors.OKGREEN+"WIN "+bcolors.ENDC,
	2: bcolors.FAIL+"LOSE"+bcolors.ENDC,
}

_FARMER_ = 0 # keep those IDS as is, I use this implicitly in id detection & behavior
_LEEK_1_ = _FARMER_ + 1
_LEEK_2_ = _LEEK_1_ + 1
_LEEK_3_ = _LEEK_2_ + 1
_LEEK_4_ = _LEEK_3_ + 1
_DELAY_ = 2 # seconds between each check when waiting for fight result


#################################################################
# Declaring accouts
#################################################################
accounts = [
	{
		'login': 'account1',
		'password': 'password1',
		'behavior': behavior.TODOLIST,
		'limit': 50, # if behavior != TODOLIST, how many fights we always keep in stock
		'todolist': { # only needed if behavior = TODOLIST
			_FARMER_: 0,
			_LEEK_1_: 0,
			_LEEK_2_: 0,
			_LEEK_3_: 0,
			_LEEK_4_: 0,
		}
	},
	{
		'login': 'account2',
		'password': 'password2',
		'behavior': behavior.BALANCED,
		'limit': 100, # if behavior != TODOLIST, how many fights we always keep in stock
	},
]

#################################################################
# Declaring functions
#################################################################

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
			time.sleep(_DELAY_)
			continue
		elif winner>=0:
			win = winnerSwitch.get(winner, 'WTF?')
			if is_farmer:
				myTalent = result['report']['farmer1']['talent'] + result['report']['farmer1']['talent_gain']
				enTalent = result['report']['farmer2']['talent'] + result['report']['farmer2']['talent_gain']
				print("\r%s %s (%s) vs %s (%s)"%(win, result['report']['farmer1']['name'], myTalent, result['report']['farmer2']['name'], enTalent))
			else:
				print("\r%s %s -lvl%s (%s) vs %s (%s)"%(win, result['leeks1'][0]['name'], result['leeks1'][0]['level'], result['leeks1'][0]['talent'], result['leeks2'][0]['name'], result['leeks2'][0]['talent']))
			sys.stdout.flush()
			return

# print a resume of the account state & return leeks number to ID association
def displayWelcome(farmer):
	# handling farmer infos
	fName = farmer['login']
	fTalent = farmer['talent']
	fLevel = farmer['total_level']
	fHabs = farmer['habs']
	nbFights = farmer['fights']
	isOutOfGarden = farmer['in_garden'] != 1
	
	print("%sCurrent: %s%s%s - lvl%s | talent: %s | habs: %s | fights left: %s%s"%(bcolors.BOLD, bcolors.HEADER, fName, bcolors.ENDC, fLevel, fTalent, fHabs, nbFights, bcolors.ENDC))
	if isOutOfGarden:
		print("%s/!\\%s farmer not in garden ! %s/!\\%s"%(bcolors.FAIL, bcolors.WARNING, bcolors.FAIL, bcolors.ENDC))
		
	leeksID = {}
	index = _LEEK_1_
	for leekid, leekinfo in farmer['leeks'].items():
		# saving leek realID
		leeksID[index] = leekid
		index += 1
		
		# display welcome info
		lName = leekinfo['name']
		lLevel = leekinfo['level']
		lTalent = leekinfo['talent']
		lCapital = leekinfo['capital']
		warn = ""
		if lCapital > 0:
			warn = "%s/!\\%s %s capital points unused %s/!\\%s"%(bcolors.FAIL, bcolors.WARNING, lCapital, bcolors.FAIL, bcolors.ENDC)
		print("%s - lvl%s | talent: %s %s"%(lName, lLevel, lTalent, warn))
	return leeksID

# get or generate the todolist depending on behavior
def getTodoList(account, farmer, behav):
	limit = account.get('limit')
	fights = farmer['fights']
	size = len(farmer['leeks'])
	if size != 1: # can do farmer fights
		size += 1
	if behav == behavior.TODOLIST:
		return account.get('todolist')
	elif behav == behavior.BALANCED:
		nb = max(fights - limit, 0)
		if size == 1:
			return { _LEEK_1_: nb }
		else:
			part = nb // size
			left = nb % size
			result = {}
			for x in range(size):
				result[x] = part
			result[_FARMER_] += left # adding what is left to farmer fight
			return result
	elif behav == behavior.EQUALIZE:
		index = _LEEK_1_
		lowestIndex = _FARMER_
		lowestLevel = 302
		for leekid, leekinfo in farmer['leeks'].items():
			lLevel = leekinfo['level']
			if lowestLevel > lLevel:
				lowestIndex = index
				lowestLevel = lLevel
			index += 1
		return { lowestIndex: max(fights - limit, 0) }
	elif behav == behavior.FARMING :
		return { _FARMER_: max(fights - limit, 0) }
	else:
		print("%s/!\\ UNKNOWN BEHAVIOR /!\\%s"%(bcolors.FAIL, bcolors.ENDC))
		return {}
	

#################################################################
# Main program
#################################################################

for account in accounts:
	login = account.get('login')
	password = account.get('password')
	behav = account.get('behavior')
	
	# connecting to leekwars
	s = requests.session()
	r = s.post("https://leekwars.com/api/farmer/login-token/", data={'login':login,'password':password})
	headers = {'Authorization': 'Bearer %s'%r.json()['token']}
	farmer = r.json()['farmer']
	

	# welcome & get leeks to realID
	leeks_to_ID = displayWelcome(farmer)
	
	# get todolist according to behavior
	todolist = getTodoList(account, farmer, behav)

	# processing todolist
	for leekid, nb_fight in todolist.items():
		while nb_fight > 0:
			is_farmer = leekid == _FARMER_
			if is_farmer:
				fight_id = farmer_fight()
			else:
				fight_id = solo_fight(leeks_to_ID[leekid])
				
			nb_fight -= 1
			wait_fight_result(fight_id, is_farmer)
