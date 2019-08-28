from behavior import behavior
from glob import g

#################################################################
# Declaring accounts
#################################################################

class accounts:
	list= [
		{
			'login': 'myLogin',
			'password': 'myPassword',
			'behavior': behavior.TODOLIST,
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
			'login': 'my2ndLogin',
			'password': 'my2ndPassword',
			'behavior': behavior.NONE,
		},
	]
