from utils import g

class behavior:
	BALANCED = 'BALANCED' # split fights in 5 for each leeks + farmer
	EQUALIZE = 'EQUALIZE' # focus on the lowest leek
	FARMING  = 'FARMING'  # focus on farmer
	# EFARMING = 'EFARMING' # TODO regroup levels then focus on farmer
	TODOLIST = 'TODOLIST' # do the todolist (ignore limit)
	NONE = 'NONE'
	
	def getTodoList(account, farmer):
		behav = account.get('behavior')
		limit = account.get('limit')
		fights = farmer['fights']
		size = len(farmer['leeks'])
		if size != 1: # can do farmer fights
			size += 1
		if behav == behavior.NONE:
			return {}
		elif behav == behavior.TODOLIST:
			return account.get('todolist')
		elif behav == behavior.BALANCED:
			nb = max(fights - limit, 0)
			if size == 1:
				return { g._LEEK_1_: nb }
			else:
				part = nb // size
				left = nb % size
				result = {}
				for x in range(size):
					result[x] = part
				result[g._FARMER_] += left # adding what is left to farmer fight
				return result
		elif behav == behavior.EQUALIZE:
			index = g._LEEK_1_
			lowestIndex = g._FARMER_
			lowestLevel = 302
			for leekid, leekinfo in farmer['leeks'].items():
				lLevel = leekinfo['level']
				if lowestLevel > lLevel:
					lowestIndex = index
					lowestLevel = lLevel
				index += 1
			return { lowestIndex: max(fights - limit, 0) }
		elif behav == behavior.FARMING :
			return { g._FARMER_: max(fights - limit, 0) }
		else:
			print("%s/!\\ UNKNOWN BEHAVIOR /!\\%s"%(bcolors.FAIL, bcolors.ENDC))
			return {}

