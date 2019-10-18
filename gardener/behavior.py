class behavior:
	BALANCED = 'BALANCED' # split fights in 5 for each leeks + farmer
	EQUALIZE = 'EQUALIZE' # focus on the lowest leek
	FARMING  = 'FARMING'  # focus on farmer
	# EFARMING = 'EFARMING' # TODO regroup levels then focus on farmer
	TODOLIST = 'TODOLIST' # do the todolist (ignore limit)
	NONE = 'NONE'

class Todolist:
	def __init__(self, account, api):
		self.behavior = account.get('behavior')
		self.todolist = account.get('todolist')
		self.limit = account.get('limit')
		self.api = api
		self.fights = api.farmer['fights']
		self.size = len(api.farmer['leeks'])
		if self.size != 1: # can do farmer fights
			self.size += 1

	def getGenerator(self):
		if self.behavior == behavior.NONE:
			return []
		elif self.behavior == behavior.TODOLIST:
			return self.todolistGenerator()
		elif self.behavior == behavior.BALANCED:
			return self.balancedGenerator()
		elif self.behavior == behavior.EQUALIZE:
			return self.equalizeGenerator()
		elif self.behavior == behavior.FARMING:
			return self.farmingGenerator()
		else:
			print("%s/!\\ UNKNOWN BEHAVIOR /!\\%s"%(bcolors.FAIL, bcolors.ENDC))
			return []

	def todolistGenerator(self):
		for leekid, nb_fight in self.todolist.items():
			while nb_fight > 0:
				yield leekid
				nb_fight -= 1

	def balancedGenerator(self):
		nb = max(self.fights - self.limit, 0)
		if self.size == 1:
			while nb > 0:
				yield g._LEEK_1_
				nb -= 1
		else:
			while nb > 0:
				for x in range(self.size):
					yield x
					nb -= 1

	def equalizeGenerator(self):
		nb = max(self.fights - self.limit, 0)
		while nb > 0:
			# TODO refresh leek state after each fight

			# check same level
			is_same_level = True
			baselvl = self.api.farmer['leeks'][0].leekinfo['level']
			for leekid, leekinfo in self.api.farmer['leeks'].items():
				if baselvl != leekinfo['level']:
					is_same_level = False
					break
			if is_same_level:
				yield g._FARMER_

			# not same lvl, focus on lower
			index = g._LEEK_1_
			lowestIndex = g._FARMER_
			lowestLevel = 302
			for leekid, leekinfo in self.api.farmer['leeks'].items():
				lLevel = leekinfo['level']
				if lowestLevel > lLevel:
					lowestIndex = index
					lowestLevel = lLevel
				index += 1
			yield lowestIndex
		
	def farmingGenerator(self):
		nb = max(self.fights - self.limit, 0)
		while nb > 0:
			yield g._FARMER_
			nb -= 1 
