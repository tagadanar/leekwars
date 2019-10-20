from behavior import behavior
from utils import g, shutdown

#################################################################
# Declaring accounts
#################################################################
class accounts:
	shutdown = shutdown.OFF
	list= [
		{
			'login': 'myAccount',
			'password': 'myPassword',
			'behavior': behavior.EQUALIZE,
			'limit': 50, # if behavior != TODOLIST, how many fights we always keep in stock
			'todolist': { # only needed if behavior = TODOLIST
				g._FARMER_: 0,
				g._LEEK_1_: 0,
				g._LEEK_2_: 0,
				g._LEEK_3_: 0,
				g._LEEK_4_: 0,
			}
		},
		{
			'login': 'myAccount2',
			'password': 'myPassword2',
			'behavior': behavior.NONE,
		}
	]
