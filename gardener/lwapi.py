import requests
import json
import random
import time
import sys

from utils import bcolors, g

#################################################################
# leekwars API
#################################################################
class lwapi:
	def __init__(self):
		self.s = requests.session()
		self.winnerSwitch = {
			0: bcolors.WARNING+"DRAW"+bcolors.ENDC,
			1: bcolors.OKGREEN+"WIN "+bcolors.ENDC,
			2: bcolors.FAIL+"LOSE"+bcolors.ENDC,
		}
		self.rooturl = "https://leekwars.com/api"

	# connecting to leekwars
	def connect(self, login, password):
		r = self.s.post("%s/farmer/login-token/"%self.rooturl, data={'login':login,'password':password})
		self.headers = {'Authorization': 'Bearer %s'%r.json()['token']}
		# this get refresh connected status on account (for NONE behavior)
		self.s.get("%s/garden/get-farmer-opponents"%self.rooturl, headers=self.headers)
		return r.json()['farmer']

	# launch a solo fight against random adv, return fight_id
	def solo_fight(self, leekid):
		# pick a rand adv from sologarden
		r = self.s.get("%s/garden/get-leek-opponents/%s"%(self.rooturl,leekid), headers=self.headers, data={'leek_id':leekid})
		garden = r.json()['opponents']
		e = random.choice(garden)
		eid = e['id']
		# launch the fight
		r = self.s.post("%s/garden/start-solo-fight/%s/%s"%(self.rooturl,leekid,eid), headers=self.headers, data={'leek_id':leekid, 'target_id':eid})
		fight_id = r.json()['fight']
		return fight_id
		
	# launch a farmer fight against random adv, return fight_id
	def farmer_fight(self):
		# pick a rand adv from farmergarden
		r = self.s.get("%s/garden/get-farmer-opponents"%self.rooturl, headers=self.headers)
		garden = r.json()['opponents']
		e = random.choice(garden)
		eid = e['id']
		# launch the fight
		r = self.s.post("%s/garden/start-farmer-fight/%s"%(self.rooturl,eid), headers=self.headers, data={'target_id':eid})
		fight_id = r.json()['fight']
		return fight_id

	# wait for fight result then print it
	def wait_fight_result(self, fight_id, is_farmer):
		firstwait = True
		while True:
			r = self.s.get("%s/fight/get/%s"%(self.rooturl,fight_id), headers=self.headers, data={'fight_id':fight_id})
			result = r.json()['fight']
			winner = result['winner']
			if winner==-1: # Fight isn't resolved yet
				if firstwait:
					sys.stdout.write('waiting.')
					firstwait = False
				else:
					sys.stdout.write('.')
				sys.stdout.flush()
				time.sleep(g._DELAY_)
				continue
			elif winner>=0:
				win = self.winnerSwitch.get(winner, 'WTF?')
				if is_farmer:
					myTalent = result['report']['farmer1']['talent'] + result['report']['farmer1']['talent_gain']
					enTalent = result['report']['farmer2']['talent'] + result['report']['farmer2']['talent_gain']
					print("\r%s %s (%s) vs %s (%s)"%(win, result['report']['farmer1']['name'], myTalent, result['report']['farmer2']['name'], enTalent))
				else:
					print("\r%s %s -lvl%s (%s) vs %s (%s)"%(win, result['leeks1'][0]['name'], result['leeks1'][0]['level'], result['leeks1'][0]['talent'], result['leeks2'][0]['name'], result['leeks2'][0]['talent']))
				sys.stdout.flush()
				return

	# print a resume of the account state & return leeks number to ID association
	def display_welcome(self, farmer):
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
		index = g._LEEK_1_
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
