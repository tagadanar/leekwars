#!/usr/bin/env python3
from settings import accounts
from behavior import behavior
from utils import bcolors, g
from lwapi import lwapi

#################################################################
# Main program
#################################################################

for account in accounts.list:
	login = account.get('login')
	password = account.get('password')
	behav = account.get('behavior')
	
	api = lwapi()
	# connecting to leekwars
	farmer = api.connect(login, password)
	
	# welcome & get leeks to realID
	leeks_to_ID = api.display_welcome(farmer)
	
	# get todolist according to behavior
	todolist = behavior.getTodoList(account, farmer, behav)

	# processing todolist
	for leekid, nb_fight in todolist.items():
		while nb_fight > 0:
			is_farmer = leekid == g._FARMER_
			if is_farmer:
				fight_id = api.farmer_fight()
			else:
				fight_id = api.solo_fight(leeks_to_ID[leekid])
				
			nb_fight -= 1
			api.wait_fight_result(fight_id, is_farmer)
