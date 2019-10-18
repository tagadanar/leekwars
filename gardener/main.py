#!/usr/bin/env python3
from settings import accounts
from behavior import behavior, Todolist
from utils import bcolors, g
from lwapi import lwapi

#################################################################
# Main program
#################################################################

for account in accounts.list:
	login = account.get('login')
	password = account.get('password')
	
	api = lwapi()
	# connecting to leekwars
	farmer = api.connect(login, password)
	
	# welcome & get leeks to realID
	leeks_to_ID = api.display_status()
	
	todolist = Todolist(account, api)
	for leekid in todolist.getGenerator():
		is_farmer = leekid == g._FARMER_
		if is_farmer:
			fight_id = api.farmer_fight()
		else:
			fight_id = api.solo_fight(leeks_to_ID[leekid])
			
		api.wait_fight_result(fight_id, is_farmer)

	if account.get('behavior') != behavior.NONE:
		api.display_status()
