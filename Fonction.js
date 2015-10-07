global __debug_operation;
function startOp(){
	__debug_operation = getOperations();
}
function stopOp(title){
	debug(title + ": " + (getOperations()-__debug_operation-7));
}

/* GLOBAL */

global ENTITY_LEEK_ = 0;
global ENTITY_PUNY_BULB = 1;
global ENTITY_ROCKY_BULB = 2;
global ENTITY_ICED_BULB = 3;
global ENTITY_HEALER_BULB = 4;
global ENTITY_METALLIC_BULB = 5;
global ENTITY_FIRE_BULB = 6;
global ENTITY_LIGHTNING_BULB = 7;

function getEntityType(entity){
	if(!isSummon(entity)) return ENTITY_LEEK_;
	var chips = getChips(entity);
	if(inArray(chips, CHIP_VACCINE)) return ENTITY_HEALER_BULB;
	if(inArray(chips, CHIP_FORTRESS)) return ENTITY_METALLIC_BULB;
	if(inArray(chips, CHIP_ROCKFALL)) return ENTITY_ROCKY_BULB;
	if(inArray(chips, CHIP_ICEBERG)) return ENTITY_ICED_BULB;
	if(inArray(chips, CHIP_METEORITE)) return ENTITY_FIRE_BULB;
	if(inArray(chips, CHIP_LIGHTNING)) return ENTITY_LIGHTNING_BULB;
	return ENTITY_PUNY_BULB; 
}

global areaCells1 = [];
global areaCells2 = [];
global areaCells3 = [];

function prepareCellArea(c, area){
	var result;
	if(area == AREA_CIRCLE_1){
		result = [ c + 17, c + 18, c - 17, c - 18];
	}else if(area == AREA_CIRCLE_2){
		result = [ c + 17, c + 18, c - 17, c - 18, c + 35, c - 35, c + 1, c - 1, c + 36, c - 36, c + 34, c - 34];
	}else if(area == AREA_CIRCLE_3){
		result = [ c + 17, c + 18, c - 17, c - 18, c + 35, c - 35, c + 1, c - 1, c + 36, c - 36, c + 34, c - 34, c - 54, c - 53, c - 52, c - 51, c - 16, c + 19, c - 19, c + 16, c + 51, c + 52, c + 53, c + 54];
	}
	var tmp = result;
	for(var r in tmp) if(r < 0 || r > 612 || getCellDistance(c, r) > 5 || isObstacle(r)) removeElement(result, r);
	return result;
}

function getCellArea(c, area){
	if(area == AREA_CIRCLE_1) return areaCells1[c];
	if(area == AREA_CIRCLE_2) return areaCells2[c];
	if(area == AREA_CIRCLE_3) return areaCells3[c];
	return null;
}

// OPE PREPARE:~3361497
if(getTurn()==1){
	for(var i=0;i<613;i++){
		push(areaCells1, prepareCellArea(i, AREA_CIRCLE_1));
		push(areaCells2, prepareCellArea(i, AREA_CIRCLE_2));
		push(areaCells3, prepareCellArea(i, AREA_CIRCLE_3));
	}
}

/* USEFULL FUNCTION */
function getNextPlaya(current, max){
	if(current < max) return current+1;
	if(current == max) return 1;
}

function getListOfLeekWhoPlayBefore(leek){
	var arrayLeekToOrder = [];
	for(var a in getAliveAllies()){
		arrayLeekToOrder[a] = getEntityTurnOrder(a);
	}
	for(var e in getAliveEnemies()){
		arrayLeekToOrder[e] = getEntityTurnOrder(e);
	}
	var max = count(arrayLeekToOrder);
	var next = getNextPlaya(arrayLeekToOrder[getLeek()], max);
	var result = [];
	while(arrayLeekToOrder[leek] != next){
		push(result, next);
		next = getNextPlaya(next, max);
	}
	return result;
}

function getHealerCells(){
	var cellz = [];
	for(var al in getAliveAllies()) if(getEntityType(al) == ENTITY_HEALER_BULB) push(cellz, getCell(al));
	return cellz;
}

function getAllAllyBulbCell(){
	var bulbz = [];
	for(var al in getAliveAllies()) if(isSummon(al)) push(bulbz, getCell(al));
	return bulbz;
}

function getAllAllyBulb(){
	var bulbz = [];
	for(var al in getAliveAllies()) if(isSummon(al)) push(bulbz, al);
	return bulbz;
}

function getAllAllyLeek(){
	var leekz = [];
	for(var al in getAliveAllies()) if(!isSummon(al)) push(leekz, al);
	return leekz;
}

function getAllBulbCellToIgnore(){
	var bulbz = getAllAllyBulbCell();
	for(var en in getAliveEnemies()) if(isSummon(en)) push(bulbz, getCell(en));
	return bulbz;
}

function getAllEnemyBulb(){
	var bulbz = [];
	for(var en in getAliveEnemies()) if(isSummon(en)) push(bulbz, en);
	return bulbz;
}

function getEnemiesToIgnore(){
	var enemiesToIgnore = [];
	for(var en in getAliveEnemies()) push(enemiesToIgnore, en);
	for(var al in getAliveAllies()) if(isSummon(al)) push(enemiesToIgnore, al);
	return enemiesToIgnore;
}

function getALLCellToIgnore(){
	var toIgnore = [];
	for(var en in getAliveEnemies()) push(toIgnore, getCell(en));
	for(var al in getAliveAllies()) push(toIgnore, getCell(al));
	return toIgnore;
}

// Use global
function countAllyBulb(type){
	var bulbz = getAllAllyBulb();
	if(type == null) return count(bulbz);
	else{
		var nb = 0;
		for(var b in bulbz){
			if(getEntityType(b) == type){
				nb++;
			}
		}
		return nb;
	}
}

function isAlreadyOnEffect(leek, e){
	// 	effect [type, value, caster_id, turns, critical, item_id, target_id]
	//			0	, 1	   , 2.....
	for(var effect in getEffects(leek)){
		if(effect[5] == e){
			return true;
		}
	}
	return false;
}

function countEffects(leek, e){
	// 	effect [type, value, caster_id, turns, critical, item_id, target_id]
	//			0	, 1	   , 2.....
	var count = 0;
	for(var effect in getEffects(leek)){
		debug(effect);
		if(effect[5] == e){
			count++;
		}
	}
	return count;
}

// return array with turn & all value.
function getPsnDmg(leek){
	var dmg = ["turn":0, "all":0];
	for(var effect in getEffects(leek)){
		if(effect[5] == WEAPON_GAZOR
		|| effect[5] == WEAPON_FLAME_THROWER
		|| effect[5] == CHIP_VENOM
		|| effect[5] == CHIP_TOXIN
		|| effect[5] == CHIP_PLAGUE){
			dmg["all"]+= effect[1]*effect[3];
			dmg["turn"]+= effect[1];
		}
	}
	return dmg;
}

// renvoie le poireau sans prendre en compte les bulbes.
function getEnemyLeek(selfCell){
	var near = getNearestEnemy();
	var issum = isSummon(near);
	if(issum == false) return near;
	var dst = 50;
	var enemies = getAliveEnemies();
	for(var enemy in enemies){
		var tmp = getCellDistance(selfCell, getCell(enemy));
		if(isSummon(enemy) == false && tmp < dst){
			dst = tmp;
			near = enemy;
		}
	}
	return near;
}

function getAnotherEnemyLeek(selfCell, notThisEnemy){
	var near = getNearestEnemy();
	var issum = isSummon(near) || near == notThisEnemy;
	if(issum == false) return near;
	var dst = 50;
	var enemies = getAliveEnemies();
	for(var enemy in enemies){
		var tmp = getCellDistance(selfCell, getCell(enemy));
		if(isSummon(enemy) == false && tmp < dst && enemy != notThisEnemy){
			dst = tmp;
			near = enemy;
		}
	}
	return near;
};

// renvoie le poireau sans prendre en compte les bulbes.
function getEnemyLeekByPath(selfCell){
	var near, dst = 30;
	var enemies = getAliveEnemies();
	var toIgnore = getEnemiesToIgnore();
	for(var enemy in enemies){
		var tmp = getPathLength(selfCell, getCell(enemy), toIgnore);
		if(isSummon(enemy) == false && tmp < dst){
			dst = tmp;
			near = enemy;
		}
	}
	if(!near) debugE('NOENEMYFOUND,FALLBACK!');
	if(near) return near;
	else return getEnemyLeek(selfCell);
};

function getRingCellz(c){
	var result = [c+19, c-19, c+53, c-53, c-16, c+16, c+52, c-52];
	var tmp = result;
	for(var r in tmp) if(getCellDistance(c, r) > 5) removeElement(result, r);
	return result;
};

function getReachableCells(cell, mp, ignoreCells){
	var stack = [cell];
	var tmp = [cell];// tableau tmp ou je stock les cases d'où je veux partir ensuite.
	var next = [];
	while(mp > 0){
		for(var currentWorkingCell in tmp){
			for(var c in getCellArea(currentWorkingCell, AREA_CIRCLE_1)){
				if((isEmptyCell(c) || inArray(ignoreCells,c)) && !inArray(stack, c)){
					push(stack, c);
					push(next, c);
				}
			}
		}
		tmp = next;
		next = [];
		mp--;
	}
	return stack;
}

// cells must be in form : [cell:dist]
function newReachableCells(cells, mp, ignoreCells){ 
	var stack = cells;
	var tmp = cells;
	var next = [];
	while(mp > 0){
		for(var currentWorkingCell : var dist in tmp){
			for(var c in @getCellArea(currentWorkingCell, AREA_CIRCLE_1)){
				if((isEmptyCell(c) || inArray(ignoreCells, c)) && stack[c] == null){
					stack[c] = dist+1;
					next[c] = dist+1;
				}
			}
		}
		tmp = next;
		next = [];
		mp--;
	}
	return stack;
}

function getFarestCell(cells, c){
	var bestCell, dst, tmp;
	for(var cell in cells){
		tmp = getCellDistance(cell, c);
		if(!dst || dst < tmp){
			dst = tmp;
			bestCell = cell;
		}
	}
	return bestCell;
};

function getClosestCell(cells, c){
	var bestCell, dst, tmp;
	for(var cell: var danger in cells){
		tmp = getCellDistance(cell, c);
		if(!dst || dst > tmp){
			dst = tmp;
			bestCell = cell;
		}
	}
	return bestCell;
};

function getClosestPathCell(cells, c){
	var bestCell, dst, tmp;
	for(var cell: var danger in cells){
		tmp = getPathLength(cell, c, getAllBulbCellToIgnore());
		if(tmp != null && (!dst || dst > tmp)){
			dst = tmp;
			bestCell = cell;
		}
	}
	if(bestCell && bestCell != getCell()) return bestCell;
	else return getClosestCell(cells, c);
};

function needShield(limit){
	for(var e in getAliveEnemies()){
		if(getStrength(e) > limit) return true;
	}
	return false;
}

function getBestSafeCellToTeleport(cellsToHide, moveCells){
	var selfCell = getCell();
	var selfLife = getLife();
	var toIgnore = getALLCellToIgnore();
	var tmpDmg = 1000000, tmpDistMid = 50;
	var bestCell = null, mvCell = null;
	for(var c: var dmg in cellsToHide){
		var distFromMid = getCellDistance(306, c);
		if(getCellDistance(selfCell, c)>5 && selfLife/1.5 > dmg && (bestCell==null || dmg < tmpDmg || (dmg == tmpDmg && distFromMid < tmpDistMid))){
			if(getPath(c, selfCell, toIgnore) != null){
				var cellFrom = getCellToUseChipOnCell(CHIP_TELEPORTATION, c);
				if(canUseChipOnCell(CHIP_TELEPORTATION, c)
				|| inArray(moveCells, cellFrom)){
					debugW("cellcoolbegood:"+c + " &dmg=" + dmg);
					mvCell = cellFrom;
					bestCell = c;
					tmpDmg = dmg;
					tmpDistMid = distFromMid;
				}
			}
		}
	}
	if(mvCell!=null)moveTowardCell(mvCell);
	return bestCell;
}

function getBestSafeCell(mvCells, cellsDanger){
	var bestCell = null, tmpdanger = 1000000, tmpDist = 50;
	for(var c: var danger in cellsDanger){
		var distFromMid = getCellDistance(c, 306);
		if(inArray(mvCells, c) && (bestCell==null || tmpdanger > danger || (tmpdanger == danger && tmpDist > distFromMid))){
			tmpdanger = danger;
			tmpDist = distFromMid;
			bestCell = c;
		}
	}
	return bestCell;
}

/////////////////////////
//////// ACTION /////////
/////////////////////////

function autoLiberateIfNeeded(){
	for(var leek in getAliveAllies()){
		if(!isSummon(leek) && canUseChip(CHIP_LIBERATION, leek)){
			var poison = getPsnDmg(leek);
			if(poison["turn"] > getLife(leek) || poison["all"] > getTotalLife(leek)/1.8)
				useChip(CHIP_LIBERATION, leek);
		}
	}
}

/////////////////////////
//////// SUMMON /////////
/////////////////////////

function summonPunyBulbShitStorm(leek){
	var c = getCell(leek);
	var cells = getRingCellz(c);
	for(var cell in cells) if(canUseChipOnCell(CHIP_PUNY_BULB, cell)) {
		summon(CHIP_PUNY_BULB, cell, function(){
			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_HELMET)) useChip(CHIP_HELMET, ally);
			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_PROTEIN) && getStrength(ally)>0) useChip(CHIP_PROTEIN, ally);
			for(var ally in getAliveAllies()) if(!isSummon(ally) && getLife(ally) < getTotalLife(ally)) useChip(CHIP_BANDAGE, ally);
			useChip(CHIP_PEBBLE, getNearestEnemy());
			
			if(round(rand())) moveToward(getNearestEnemy());
			else moveToward(leek, getCellDistance(getCell(), getCell(leek))-2);

			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_PROTEIN) && getStrength(ally)>0) useChip(CHIP_PROTEIN, ally);
			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_HELMET)) useChip(CHIP_HELMET, ally);
			for(var ally in getAliveAllies()) if(!isSummon(ally) && getLife(ally) < getTotalLife(ally)) useChip(CHIP_BANDAGE, ally);
			useChip(CHIP_PEBBLE, getNearestEnemy());
			
		});
		break;
	}
};

function summonPunyBulbHeal(leek){
	var c = getCell(leek);
	var cells = getRingCellz(c);
	for(var cell in cells) if(canUseChipOnCell(CHIP_PUNY_BULB, cell)) {
		summon(CHIP_PUNY_BULB, cell, function(){
			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_HELMET)) useChip(CHIP_HELMET, ally);
			for(var ally in getAliveAllies()) if(!isSummon(ally) && getLife(ally) < getTotalLife(ally)) useChip(CHIP_BANDAGE, ally);
			useChip(CHIP_PEBBLE, getNearestEnemy());
			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_PROTEIN) && getStrength(ally)>0) useChip(CHIP_PROTEIN, ally);

			var leekcell = getCell(leek);
			var enemyCell = getCell(getEnemyLeek(leekcell));
			var tmp = getRingCellz(leekcell);
			var cellz = [];
			for(var cl in tmp) if(!isOnSameLine(cl, enemyCell)) push(cellz, cl);
			moveTowardCells(cellz);

			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_HELMET)) useChip(CHIP_HELMET, ally);
			for(var ally in getAliveAllies()) if(!isSummon(ally) && getLife(ally) < getTotalLife(ally)) useChip(CHIP_BANDAGE, ally);
			useChip(CHIP_PEBBLE, getNearestEnemy());
			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_PROTEIN) && getStrength(ally)>0) useChip(CHIP_PROTEIN, ally);
		});
		break;
	}
};

function summonRockBulb(leek){
	var c = getCell(leek);
	var cells = getRingCellz(c);
	for(var cell in cells) if(canUseChipOnCell(CHIP_ROCKY_BULB, cell)) {
		summon(CHIP_ROCKY_BULB, cell, function(){
			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_HELMET)) useChip(CHIP_HELMET, ally);

			var enemy = getNearestEnemy();
			
			var theCell = getCellToUseChip(CHIP_ROCKFALL, enemy);
			moveTowardCell(theCell);
			useChip(CHIP_ROCKFALL, enemy);
			for(var cc in getCellArea(getCell(enemy), AREA_CIRCLE_2)){
				useChip(CHIP_ROCKFALL, cc);
			}
			useChip(CHIP_ROCK, enemy);
			useChip(CHIP_PEBBLE, enemy);

			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_HELMET)) useChip(CHIP_HELMET, ally);
			useChip(CHIP_HELMET, getLeek());
		});
		break;
	}
};

function summonFrostBulb(leek){
	var c = getCell(leek);
	var cells = getCellArea(c, AREA_CIRCLE_2);
	for(var cell in cells) if(getCellDistance(c, cell) > 1 && canUseChipOnCell(CHIP_ICED_BULB, cell)) {
		summon(CHIP_ICED_BULB, cell, function(){
			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_REFLEXES)) useChip(CHIP_REFLEXES, ally);

			var enemy = getNearestEnemy();
			
			var theCell;
			if(getTP()>6 && getCooldown(CHIP_ICEBERG) == 0) theCell = getCellToUseChip(CHIP_ICEBERG, enemy);
			else if(getCooldown(CHIP_STALACTITE) == 0) theCell = getCellToUseChip(CHIP_STALACTITE, enemy);
			else theCell = getCellToUseChip(CHIP_ICE, enemy);
			moveTowardCell(theCell);
			useChip(CHIP_ICEBERG, enemy);
			for(var cc in getCellArea(getCell(enemy), AREA_CIRCLE_2)){
				if(canUseChipOnCell(CHIP_ICEBERG, cc)) useChip(CHIP_ICEBERG, cc);
			}
			useChip(CHIP_STALACTITE, enemy);
			useChip(CHIP_ICE, enemy);
			useChip(CHIP_ICE, enemy);

			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_REFLEXES)) useChip(CHIP_REFLEXES, ally);
			useChip(CHIP_REFLEXES, getLeek());
		});
		break;
	}
};

function summonHealerBulb(leek){
	var c = getCell(leek);
	var cells = getCellArea(c, AREA_CIRCLE_2);
	for(var cell in cells) if(getCellDistance(c, cell) > 1 && canUseChipOnCell(CHIP_HEALER_BULB, cell)) {
		summon(CHIP_HEALER_BULB, cell, function(){		
		
			// if solo et que y'a pas urgence on perma apply vaccine
			if(getFightType() == FIGHT_TYPE_SOLO && getLife(leek) > getTotalLife(leek)/2 && !isAlreadyOnEffect(leek, CHIP_VACCINE)) useChip(CHIP_VACCINE, leek);
			// vaccin sur un ally non-bulb, qui n'a pas déjà vaccin, et qui n'est pas fulllife et qui n'a pas besoin urgement de heal
			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_VACCINE) && getLife(ally) < getTotalLife(ally) && getLife(ally) > getTotalLife(ally)/2) useChip(CHIP_VACCINE, ally);
			// cure sur un ally non-bulb, à qui il manque au moins 100hp
			for(var ally in getAliveAllies()) if(!isSummon(ally) && getLife(ally) < getTotalLife(ally) - 100) useChip(CHIP_CURE, ally);
			// perfusion sur un ally non-bulb, à qui il manque au moins 100hp
			for(var ally in getAliveAllies()) if(!isSummon(ally) && getLife(ally) < getTotalLife(ally) - 100)
			{
				useChip(CHIP_DRIP, ally);
				// TODO marche pas ce truc en mousse... faire un truc lancé DRIP en aoe quand j'ai pas la los/range.
				for(var cc in getCellArea(getCell(ally), AREA_CIRCLE_2)){
					useChip(CHIP_DRIP, cc);
				}
			}
			// vaccin sur un ally non-bulb, non full life.
			// vaccin sur un ally non-bulb, qui n'a pas déjà vaccin, et qui n'est pas fulllife
			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_VACCINE) && getLife(ally) < getTotalLife(ally)) useChip(CHIP_VACCINE, ally);
			// bandage sur un ally non-bulb, à qui il manque au moins 50hp
			for(var ally in getAliveAllies()) if(!isSummon(ally) && getLife(ally) < getTotalLife(ally) - 50) useChip(CHIP_BANDAGE, ally);


			var theCell = getCellToUseChip(CHIP_CURE, leek);
			moveTowardCell(theCell);
			
			// if solo on perma apply vaccine
			if(getFightType() == FIGHT_TYPE_SOLO && getLife(leek) > getTotalLife(leek)/2) useChip(CHIP_VACCINE, leek);
			// vaccin sur un ally non-bulb, qui n'a pas déjà vaccin, et qui n'est pas fulllife et qui n'a pas besoin urgement de heal
			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_VACCINE) && getLife(ally) < getTotalLife(ally) && getLife(ally) > getTotalLife(ally)/2) useChip(CHIP_VACCINE, ally);
			// cure sur un ally non-bulb, à qui il manque au moins 100hp
			for(var ally in getAliveAllies()) if(!isSummon(ally) && getLife(ally) < getTotalLife(ally) - 100) useChip(CHIP_CURE, ally);
			// perfusion sur un ally non-bulb, à qui il manque au moins 100hp
			for(var ally in getAliveAllies()) if(!isSummon(ally) && getLife(ally) < getTotalLife(ally) - 100)
			{
				useChip(CHIP_DRIP, ally);
				// TODO marche pas ce truc en mousse... faire un truc lancé DRIP en aoe quand j'ai pas la los/range.
				for(var cc in getCellArea(getCell(ally), AREA_CIRCLE_2)){
					useChip(CHIP_DRIP, cc);
				}
			}
			// vaccin sur un ally non-bulb, non full life.
			// vaccin sur un ally non-bulb, qui n'a pas déjà vaccin, et qui n'est pas fulllife
			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_VACCINE) && getLife(ally) < getTotalLife(ally)) useChip(CHIP_VACCINE, ally);
			// bandage sur un ally non-bulb, à qui il manque au moins 50hp
			for(var ally in getAliveAllies()) if(!isSummon(ally) && getLife(ally) < getTotalLife(ally) - 50) useChip(CHIP_BANDAGE, ally);

			// vaccin sur un ally bulb, qui n'a pas déjà vaccin, et qui n'est pas fulllife
			for(var ally in getAliveAllies()) if(isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_VACCINE) && getLife(ally) < getTotalLife(ally)) useChip(CHIP_VACCINE, ally);
			// cure sur un ally bulb, à qui il manque au moins 100hp
			for(var ally in getAliveAllies()) if(isSummon(ally) && getLife(ally) < getTotalLife(ally) - 100) useChip(CHIP_CURE, ally);
			// perfusion sur un ally bulb, à qui il manque au moins 100hp
			for(var ally in getAliveAllies()) if(isSummon(ally) && getLife(ally) < getTotalLife(ally) - 100)
			{
				useChip(CHIP_DRIP, ally);
				for(var cc in getCellArea(getCell(ally), AREA_CIRCLE_2)){
					useChip(CHIP_DRIP, cc);
				}
			}
			// bandage sur un ally bulb, à qui il manque au moins 50hp
			for(var ally in getAliveAllies()) if(isSummon(ally) && getLife(ally) < getTotalLife(ally) - 50) useChip(CHIP_BANDAGE, ally);
			
			if(getLife() < getTotalLife()-100){
				useChip(CHIP_CURE, getLeek());
				useChip(CHIP_BANDAGE, getLeek());
			}
			
			moveAwayFrom(getNearestEnemy(), round(rand()) + 4);
		});
		break;
	}
}

function summonMetalBulb(leek){
	var c = getCell(leek);
	var cells = getCellArea(c, AREA_CIRCLE_1);
	for(var cell in cells) if(canUseChipOnCell(CHIP_HEALER_BULB, cell)) {
		summon(CHIP_METALLIC_BULB, cell, function(){
			if(getFightType()==FIGHT_TYPE_SOLO){
				useChip(CHIP_WALL, leek);
				useChip(CHIP_ARMOR, leek);
				useChip(CHIP_SHIELD, leek);
				useChip(CHIP_SEVEN_LEAGUE_BOOTS, leek);
				moveTowardCell(getCellToUseChip(CHIP_SEVEN_LEAGUE_BOOTS, leek));
				useChip(CHIP_WALL, leek);
				useChip(CHIP_ARMOR, leek);
				useChip(CHIP_SHIELD, leek);
				useChip(CHIP_SEVEN_LEAGUE_BOOTS, leek);
				
				useChip(CHIP_SEVEN_LEAGUE_BOOTS, getLeek());
				moveTowardCell(getCellToUseChip(CHIP_SEVEN_LEAGUE_BOOTS, leek));				
			}else{
				for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_ARMOR)) useChip(CHIP_ARMOR, ally);
				for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_SEVEN_LEAGUE_BOOTS)) useChip(CHIP_SEVEN_LEAGUE_BOOTS, ally);
				for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_SHIELD)) useChip(CHIP_SHIELD, ally);
				for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_WALL)) useChip(CHIP_WALL, ally);
				moveToward(getNearestAlly());
				for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_ARMOR)) useChip(CHIP_ARMOR, ally);
				for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_SEVEN_LEAGUE_BOOTS)) useChip(CHIP_SEVEN_LEAGUE_BOOTS, ally);
				for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_SHIELD)) useChip(CHIP_SHIELD, ally);
				for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_WALL)) useChip(CHIP_WALL, ally);
			}
		});
		break;
	}
}

/* ATTACK FUNCTION */
function getSimplifiedWeaponInfos(weapon){
	if(weapon==WEAPON_PISTOL) 
		return ["type": EFFECT_DAMAGE, "min":15, "max":20, "avg":18, "tp":3];
	else if(weapon==WEAPON_MACHINE_GUN) 
		return ["type": EFFECT_DAMAGE, "min":20, "max":24, "avg":22, "tp":4];
	else if(weapon==WEAPON_DOUBLE_GUN) 
		return ["type": EFFECT_DAMAGE, "min":18, "max":25, "avg":23, "tp":4]; // other shoot in upped avg.
	else if(weapon==WEAPON_SHOTGUN)
		return ["type": EFFECT_DAMAGE, "min":33, "max":43, "avg":38, "tp":5];
	else if(weapon==WEAPON_MAGNUM)
		return ["type": EFFECT_DAMAGE, "min":25, "max":40, "avg":33, "tp":5];
	else if(weapon==WEAPON_LASER)
		return ["type": EFFECT_DAMAGE, "min":43, "max":59, "avg":51, "tp":6];
	else if(weapon==WEAPON_GRENADE_LAUNCHER)
		return ["type": EFFECT_DAMAGE, "min":45, "max":53, "avg":49, "tp":6];
	else if(weapon==WEAPON_FLAME_THROWER)
		return ["type": EFFECT_POISON, "min":22, "max":30, "avg":26, "tp":6];
	else if(weapon==WEAPON_DESTROYER)
		return ["type": EFFECT_DAMAGE, "min":40, "max":60, "avg":50, "tp":6];
	else if(weapon==WEAPON_GAZOR)
		return ["type": EFFECT_POISON, "min":30, "max":35, "avg":33, "tp":7];
	else if(weapon==WEAPON_B_LASER)
		return ["type": EFFECT_DAMAGE, "min":50, "max":60, "avg":55, "tp":5];
	else if(weapon==WEAPON_ELECTRISOR)
		return ["type": EFFECT_DAMAGE, "min":70, "max":80, "avg":75, "tp":7];
	else if(weapon==WEAPON_M_LASER)
		return ["type": EFFECT_DAMAGE, "min":90, "max":100, "avg":95, "tp":8];
	else debugE("getSimplifiedWeaponInfos:WEAPON_NOT_IN_LIST");
}

function getMySimplifiedPotentialDmgInOneAttack(weapon, enemy){
	var wInfos = getSimplifiedWeaponInfos(weapon);
	var potentialDMG = 0;
	if(wInfos["type"]==EFFECT_DAMAGE){
		potentialDMG = wInfos["avg"]*(1+(getStrength()/100));
		potentialDMG = ((potentialDMG*(1-(getRelativeShield(enemy)/100)))-getAbsoluteShield(enemy));
	}else if(wInfos["type"]==EFFECT_POISON){
		potentialDMG = wInfos["avg"]*(1+(getMagic()/100));
	}else debugE("getMySimplifiedPotentialDmg:UNKNOWN_WEAPON_TYPE");
	if(potentialDMG < 0) potentialDMG = 0;
	return potentialDMG;
}

function getSimplfiedPotentialDmg(enemy, ratio){
	var str = getStrength(enemy);
	var mgc = getMagic(enemy);
	var enemyPotentialDmg = 0;
	var nbAttack = 2;
	var dmgStr = 65 * ratio/100;
	var dmgMgc = 50 * ratio/100;
	if(str >= mgc){
		enemyPotentialDmg= (1+(str/100))*dmgStr;// dmg per attack
		enemyPotentialDmg=((enemyPotentialDmg*(1-(getRelativeShield()/100)))-getAbsoluteShield())*nbAttack;
	}else{
		enemyPotentialDmg = (1+(mgc/100))*dmgMgc *nbAttack;
	}
	if(enemyPotentialDmg<0) enemyPotentialDmg=0;
	return enemyPotentialDmg;
}

function getSimplfiedPotentialDmgUnshielded(enemy, ratio){
	var str = getStrength(enemy);
	var mgc = getMagic(enemy);
	var enemyPotentialDmg = 0;
	var nbAttack = 2;
	var dmgStr = 80 * ratio/100;
	var dmgMgc = 50 * ratio/100;
	if(str >= mgc){
		enemyPotentialDmg= (1+(str/100))*dmgStr*nbAttack;
	}else{
		enemyPotentialDmg = (1+(mgc/100))*dmgMgc *nbAttack;
	}
	if(enemyPotentialDmg<0) enemyPotentialDmg=0;
	return enemyPotentialDmg;
}

function getDamagePercentage(cell1, cell2, area) {     
	if (cell1 == cell2) return 100;
	var dist = getCellDistance(cell1, cell2);
	var areaDist = 0;
	if(AREA_CIRCLE_1 == area) areaDist = 1;
	if(AREA_CIRCLE_2 == area) areaDist = 2;
	if(AREA_CIRCLE_3 == area) areaDist = 3;
	if(dist > areaDist ) return 0;
	var ratio = 100 - ((50 / areaDist) * dist);
	return ratio;
}

// show score on map in red, array must be sorted descending (high to low).
function showScoreRed(array){
	if(count(array)>0){
		//debug(array);
		var max;
		for(var v in array){ max = v; break; }
		for(var cell: var score in array){
			if(max==0) mark(cell, COLOR_GREEN);
			else mark(cell, getColor(score/max*255 , 0, (255-(score/max*255))));
		}
	}else{
		debugE("NO CELLZ TO ATTACK");
	}
}

// show score on map in green if == 0 or nivelling blue if > 0, array must be sorted ascending (low to high)
function showScoreGreen(array){
	if(count(array)>0){
		//debug(array);
		var max=0;
		for(var v in array){ if(v > max) max = v; }
		for(var cell: var score in array){
			if(max==0) mark(cell, COLOR_GREEN);
			else mark(cell, getColor(0, 255-(score/max*255), score/max*255));
		}
	}else{
		debugE("NO CELLZ TO ATTACK");
	}
}

function showScoreGreenWithMax(array, max){
	if(count(array)>0){
		//debug(array);
		for(var cell: var score in array){
			mark(cell, getColor(0, 255-(score/max*255), score/max*255));
		}
	}else{
		debugE("NO CELLZ TO ATTACK");
	}
}

// special healer_bulb
function getCellzQualityToHeal(){
	var coefAllyLeek = 6;
	var coefAllyBulb = 1;
	var coefEnmyLeek = 5;
	var coefEnmyBulb = 2;
	var self = getLeek();
	
	var arrayResult = [];
	for(var i = 0; i <= 612; i++){
		if(!isObstacle(i)){
			for(var leek in getChipTargets(CHIP_DRIP, i)){
				if(isAlly(leek) && leek != self){
					if(isSummon(leek))
						arrayResult[i]+=getDamagePercentage(i, getCell(leek), AREA_CIRCLE_2)*coefAllyBulb;
					else
						arrayResult[i]+=getDamagePercentage(i, getCell(leek), AREA_CIRCLE_2)*coefAllyLeek;
				}else{
					if(isSummon(leek)) 
						arrayResult[i]-=getDamagePercentage(i, getCell(leek), AREA_CIRCLE_2)*coefEnmyBulb;
					else 
						arrayResult[i]-=getDamagePercentage(i, getCell(leek), AREA_CIRCLE_2)*coefEnmyLeek;
				}
			}
		}
	}
	
	
}

// environ 160k opération en 1v6 avec gazor
// 120k opération en 1v6 avec grenade launcher
// 70k opération en 1v6 avec magnum
// WARNING /!\ NOT WORKING WITH LINE WEAPON § TODO spécial case. pour le moment utiliser les functions de flammerfunctions.
// todo one day: récupérer les stats en armor et science et anticiper les dégats réels, si j'achève un leek, etc... pour avoir un meilleur classement de quality.
function getCellzQualityToAttack(weapon){
	var coefAllyLeek = 6;
	var coefAllyBulb = 1;
	var coefAllyBulbHealer = 3;
	var coefAllyPunyBulb = 0.1;
	var coefEnmyLeek = 5;
	var coefEnmyBulb = 2;
	var coefEnmyBulbHealer = 4;
	var coefEnmyBulbMetal = 3;
	var coefEnmyPunyBulb = 0.1;
	if(getMagic()>199 && weapon==WEAPON_GAZOR){
		if(getFightType()==FIGHT_TYPE_SOLO) coefEnmyBulbMetal = 0;
		else coefEnmyBulbMetal = 1;
	}
	var self = getLeek();

	var weaponArea = getWeaponArea(weapon);
	var arrayCellToLeeks = [];
	var arrayResult = [];
	
	for(var i = 0; i <= 612; i++){
		arrayResult[i] = 0;//["cell":i, "score":0];
		if(!isObstacle(i)){
			for(var leek in getWeaponTargets(weapon, i)){
				if(isAlly(leek) && leek != self){
					if(isSummon(leek)){
						var entityType = getEntityType(leek);
						if(entityType == ENTITY_HEALER_BULB)
							arrayResult[i] -= getMySimplifiedPotentialDmgInOneAttack(weapon, leek) * getDamagePercentage(i, getCell(leek), weaponArea)/100 * coefAllyBulbHealer;
						else if(entityType == ENTITY_PUNY_BULB)
							arrayResult[i] -= getMySimplifiedPotentialDmgInOneAttack(weapon, leek) * getDamagePercentage(i, getCell(leek), weaponArea)/100 * coefAllyPunyBulb;
						else
							arrayResult[i] -= getMySimplifiedPotentialDmgInOneAttack(weapon, leek) * getDamagePercentage(i, getCell(leek), weaponArea)/100 * coefAllyBulb;
					}else
						arrayResult[i] -= getMySimplifiedPotentialDmgInOneAttack(weapon, leek) * getDamagePercentage(i, getCell(leek), weaponArea)/100 * coefAllyLeek;
				}
				// possible amélioration de perf en retirant la condition superflu
				else if(isEnemy(leek)){
					if(isSummon(leek)){
						var entityType = getEntityType(leek);
						if(entityType == ENTITY_HEALER_BULB)
							arrayResult[i] += getMySimplifiedPotentialDmgInOneAttack(weapon, leek) * getDamagePercentage(i, getCell(leek), weaponArea)/100 * coefEnmyBulbHealer;
						else if(entityType == ENTITY_METALLIC_BULB){
							var toto = getMySimplifiedPotentialDmgInOneAttack(weapon, leek) * getDamagePercentage(i, getCell(leek), weaponArea)/100 * coefEnmyBulbMetal;
							debugE("CoefBulbMetal:" + coefEnmyBulbMetal);
							debugE("result:" + toto);
							arrayResult[i] += toto;
						}
						else if(entityType == ENTITY_PUNY_BULB)
							arrayResult[i] += getMySimplifiedPotentialDmgInOneAttack(weapon, leek) * getDamagePercentage(i, getCell(leek), weaponArea)/100 * coefEnmyPunyBulb;
						else 
							arrayResult[i] += getMySimplifiedPotentialDmgInOneAttack(weapon, leek) * getDamagePercentage(i, getCell(leek), weaponArea)/100 * coefEnmyBulb;
					}else 
						arrayResult[i] += getMySimplifiedPotentialDmgInOneAttack(weapon, leek) * getDamagePercentage(i, getCell(leek), weaponArea)/100 * coefEnmyLeek;
				}
			}
		}
	}
	
	arrayResult = arrayFilter(arrayResult, function(val){
		if(val>0) return true;
	});
	arrayResult = arraySort(arrayResult, function(val1, val2){
		if(val1 < val2) return 1;
		else if(val1 == val2) return 0;
		else return -1;
	});

	return arrayResult;
}

// TODO manage inline
function getBiggestArea(enemy){
	var area = 0;
	for(var w in getWeapons(enemy)){
		if(getWeaponArea(w) == AREA_CIRCLE_3) return AREA_CIRCLE_3;
		else if(getWeaponArea(w) == AREA_CIRCLE_2) area = 2;
		else if(getWeaponArea(w) == AREA_CIRCLE_1 && area < 1) area = 1;
	}
	for(var c in getChips(enemy)){
		if(getChipArea(c) == AREA_CIRCLE_3) return AREA_CIRCLE_3;
		else if(getChipArea(c) == AREA_CIRCLE_2) area = 2;
		else if(getChipArea(c) == AREA_CIRCLE_1 && area < 1) area = 1;
	}
	if(area==2) return AREA_CIRCLE_2;
	if(area==1) return AREA_CIRCLE_1;
	return AREA_POINT;
}

// TODO manage chip
function getBiggestRange(enemy){
	var range = 0, tmp;
	for(var w in getWeapons(enemy)){
		tmp = getWeaponMaxScope(w);
		if(tmp > range) range = tmp;
	}
	if(range == 0) range = 8;
	return range;
}

function getMLazerDmg(enemy){
	var str = getStrength(enemy);
	var dmgStr = 120;
	var nbAttack = 2;
	var enemyPotentialDmg= (1+(str/100))*dmgStr;// dmg per attack
	enemyPotentialDmg=((enemyPotentialDmg*(1-(getRelativeShield()/100)))-getAbsoluteShield())*nbAttack;
	return enemyPotentialDmg;
}

function isGazor(enemy){
	if(getMagic(enemy) < 200) return false;
	for(var w in getWeapons(enemy)) if(w==WEAPON_GAZOR) return true;
	return false;
}

function canLiberate(leek){
	for(var c in getChips(leek))
		if(c==CHIP_LIBERATION && getCooldown(c, leek)==0) return true;
	return false;
}

// TODO manage chip+weapon los specifics.
// environ 11120k op en 1v6 avec 3mp partout.
// environ ??k op vs 3leek avec 16, 15 et 12 MP; => à tester.
function getCellzQualityToHide(){
	var op = getOperations(); // TODO remove
	var enemies = getAliveEnemies();
	var myCellToIgnore = getCell();
	var cellToIgnore = [myCellToIgnore];
	var leekToIgnore = [getLeek()]; // m'ignorer moi car je vais bouger, et je ne compte pas me cacher derrière moi même.
	var leekToIgnoreLazer = getAliveAllies();
	pushAll(leekToIgnoreLazer, getAliveEnemies());
	var cellzDanger = [];
	for(var i = 0; i <= 612; i++) cellzDanger[i] = 0;
	var cellzTmpDanger = [], isLazer = [], dist, los;
	var isSolo = getFightType()==FIGHT_TYPE_SOLO;
	
	var potDmgUnshielded, dangerLiberate;
	for(var enemy in enemies){
		var eType = getEntityType(enemy);
		if(eType == ENTITY_PUNY_BULB 
		|| eType == ENTITY_HEALER_BULB 
		|| eType == ENTITY_METALLIC_BULB
		|| (getStrength(enemy) <= 100 && getMagic(enemy) <= 100)) continue;
		
		if(isSolo) dangerLiberate = canLiberate(enemy) && getAbsoluteShield()>76 && getMagic(enemy)==0;
		var gazor = isGazor(enemy);
		var area = getBiggestArea(enemy);
		var range = 8;
		if(!gazor) range = getBiggestRange(enemy);
		var Mlazer = 0;
		if(range == 12 && getStrength(enemy) > 299){
			Mlazer = getMLazerDmg(enemy);
			range = 8;
		}
		
		//var inline = IsInLine(enemy);
		var enemyCell = getCell(enemy);
		var eMp = getMP(enemy);
		var listLeekWhoPlayBefore = getListOfLeekWhoPlayBefore(enemy);
		var listCellLeekPlayBefore = [];
		for(var leek in listLeekWhoPlayBefore) push(listCellLeekPlayBefore, getCell(leek));
		push(leekToIgnore, enemy); // s'ignorer soit mm pour les tests de ligne de vue après move.
		pushAll(leekToIgnore, listLeekWhoPlayBefore);
		pushAll(cellToIgnore, listCellLeekPlayBefore);
		var moveCellz = @newReachableCells([getCell(enemy):0], eMp, cellToIgnore);
		var potDmg = @getSimplfiedPotentialDmg(enemy, 100);
		if(isSolo && dangerLiberate) potDmgUnshielded = @getSimplfiedPotentialDmgUnshielded(enemy, 100);
		if(potDmg < 0) potDmg = 0;
		for(var i = 0; i <= 612; i++){
			cellzTmpDanger[i]=0;
			isLazer[i]=false;
			if(!isObstacle(i) && (isEmptyCell(i) || i == myCellToIgnore)){
				for(var mCell: var mpused in moveCellz){
					// IF SOLO I PLAY AROUND LIBERATE. TODO test in team for operation.
					dist = @getCellDistance(mCell, i);
					los = @lineOfSight(mCell, i, leekToIgnore);
					if(gazor){
						if(isOnSameLine(mCell, i) && dist >=3 && dist <= 7 && los){
							cellzTmpDanger[i] = @potDmg;
							break;
						}
					}else if(isSolo && dangerLiberate && dist <= 5 && los){
						cellzTmpDanger[i] = @potDmgUnshielded;
						break;
					}else if(Mlazer>0 && isOnSameLine(mCell,i) && dist >= 4 && dist <= 12 && lineOfSight(mCell, i, leekToIgnoreLazer)){
						cellzTmpDanger[i] = @Mlazer;
						if(dist > 9) isLazer[i]=true;
						break;
					}else if(getCellDistance(mCell, i) <= range && lineOfSight(mCell, i, leekToIgnore)){
						cellzTmpDanger[i] = @potDmg;
						if(!isSolo || (!dangerLiberate && Mlazer == 0)) break;
					}
				}
			}
		}
		removeElement(leekToIgnore, enemy); // on le retire pour rajouter le suivant
		for(var leek in listLeekWhoPlayBefore) removeElement(leekToIgnore, leek);
		for(var cell in listCellLeekPlayBefore) removeElement(cellToIgnore, cell);
		// traitement des aoe puis add dans le cellzDanger de retour.
		for(var i: var v in cellzTmpDanger){
			if(v==0){ // case non toucher directement, possibilité d'aoe
				var nearCells = @getCellArea(i, area);
				for(var ncell in nearCells){
					if(isLazer[ncell]==true)break;
					if(cellzTmpDanger[ncell] > 0){
						cellzDanger[i] += @getSimplfiedPotentialDmg(enemy, getDamagePercentage(i, ncell, area));
						break;//normalement je fais les cases dans l'ordre donc jpeux break
					}
				}
			}else{
				cellzDanger[i] += @v;
			}
		}
	}
	
	cellzDanger = arrayFilter(cellzDanger, function(key, val){
		if(!isObstacle(key) && (isEmptyCell(key) || key == myCellToIgnore)) return true;
		return false;
	});
	
	debugW("OP_cell_to_hide:"+(getOperations()-op));
	return @cellzDanger;
}

function getCellzToUseGazorOnCell(c){
	var selfCell = getCell();
	var cellDirA = [c-18*4, c-18*5, c-18*6, c-18*7];
	var cellDirB = [c+18*4, c+18*5, c+18*6, c+18*7];
	var cellDirC = [c+17*4, c+17*5, c+17*6, c+17*7];
	var cellDirD = [c-17*4, c-17*5, c-17*6, c-17*7];
		
	var retour = [];
	for(var cell in cellDirA){
		if(cell>=0 && cell<=612 && (isEmptyCell(cell)||cell==selfCell) && getCellDistance(cell, c)<8 && lineOfSight(cell, c))
			push(retour, cell);
	}
	for(var cell in cellDirB){
		if(cell>=0 && cell<=612 && (isEmptyCell(cell)||cell==selfCell) && getCellDistance(cell, c)<8 && lineOfSight(cell, c))
			push(retour, cell);
	}
	for(var cell in cellDirC){
		if(cell>=0 && cell<=612 && (isEmptyCell(cell)||cell==selfCell) && getCellDistance(cell, c)<8 && lineOfSight(cell, c))
			push(retour, cell);
	}
	for(var cell in cellDirD){
		if(cell>=0 && cell<=612 && (isEmptyCell(cell)||cell==selfCell) && getCellDistance(cell, c)<8 && lineOfSight(cell, c))
			push(retour, cell);
	}
	return retour;
}

function getCellzToUseLiberationOnCell(c){
	var result = [];
	var selfCell = getCell();
	for(var i = 0; i <= 612; i++){
		var dist = getCellDistance(c, i);
		if((isEmptyCell(i)||i==selfCell) && dist <= 5 && dist >=2 && lineOfSight(i, c)) push(result, i);
	}
	return result;
}

function findMoveLiberate(cellzToHide, weapon){
	if(getCooldown(CHIP_LIBERATION)!=0) return null;
	var interestingTarget = [];
	for(var e in getAliveEnemies()){
		var potDmg = getMySimplifiedPotentialDmgInOneAttack(weapon, e);
		if(!isAlreadyOnEffect(e, WEAPON_GAZOR) && potDmg <= 60){
			push(interestingTarget, e);
		}
	}
	if(isEmpty(interestingTarget)) return null;
	else{
		var arrayAttack = [];
		for(var e in interestingTarget){
			arrayAttack[getCell(e)] = getSimplifiedWeaponInfos(weapon)['avg']*(1+getStrength()/100);
		}
		var bestMove = findBestMove(cellzToHide, arrayAttack, CHIP_LIBERATION);
		debugE("libe bestmv:"+bestMove);
		
		if(bestMove != null && bestMove["danger"] < getLife()/1.5 && bestMove["score"] > 99) return bestMove;
	}
	return null;
}

function getDistanceToClosestHealer(cell, healerCells){
	if(isEmpty(healerCells)) return null;
	var dist = null, tmpdist;
	for(var c in healerCells){
		tmpdist = getCellDistance(cell, c);
		if(dist == null || tmpdist < dist) dist = tmpdist;
	}
	return dist*2;
}

function findBestMove(cellzToHide, cellzToAttack, weaponOrChip){
	var self = getLeek();
	var selfMP = getMP();
	var selfCell = getCell();
	var psnDmg = getPsnDmg(self)["turn"];
	var moveCellz = @newReachableCells([selfCell:0], selfMP, []);
	if(count(moveCellz)<9) return null; // sécurité anti-block CHEAP
	var selfLife = getLife();
	var selfTotalLife = getTotalLife();
	var ratioDmg = 100;
	var ratioDanger = 200;
	var bonusSafe = 50;
	var malusDanger = 150;
	var danger_min=null, danger_max=null, damage_max=null;
	
	var distToMid=null, distToNearEnemy=null;
	var healerCells = getHealerCells();
	// key: cell, value: targetCell
	var assocCellToBestTarget = [];
	var assocCellToDamage = [];
	var solutions = [];
	var mpMove1 = null, mpMove2 = null;
	
	
	for(var targetCell: var damage in cellzToAttack){
		if(damage_max == null || damage > damage_max) damage_max = damage;
		var cellzAttack;
		if(weaponOrChip == WEAPON_GAZOR) cellzAttack = getCellzToUseGazorOnCell(targetCell);
		else if(weaponOrChip == CHIP_LIBERATION) cellzAttack = getCellzToUseLiberationOnCell(targetCell);
		else if(isWeapon(weaponOrChip)) cellzAttack = getCellsToUseWeaponOnCell(weaponOrChip, targetCell, [selfCell]);
		else cellzAttack = getCellsToUseChipOnCell(weaponOrChip, targetCell, [selfCell]);
		for(var cell in cellzAttack){
			if(!assocCellToBestTarget[cell] || assocCellToDamage[cell] < damage){
				assocCellToBestTarget[cell] = targetCell;
				assocCellToDamage[cell] = damage;
			}
		}
	}
	
	for(var sCell: var damage in cellzToHide){
		if(danger_max == null || danger_max < damage) danger_max = damage;
		if(danger_min == null || danger_min > damage) danger_min = damage;
	}
	//showScoreGreenWithMax(assocCellToDangerScore, danger_max);
	var brk = false;
	var best = null;
	debug("min_danger:"+danger_min+" max_danger:"+danger_max);
	for(var aCell: var target in assocCellToBestTarget){
		mpMove1 = moveCellz[aCell];
		var mpLeft = selfMP - mpMove1;
		if(mpMove1 != null && mpLeft >= 0){
			var reachable = @newReachableCells([aCell:0], mpLeft, [selfCell]);
			for(var sCell:var mpused in reachable){
				// FORMULE DU SCORE:
				var score = cellzToAttack[target]/damage_max*ratioDmg;
				if(cellzToHide[sCell] < (selfLife-psnDmg)/2) score *= 3;
				score += ratioDanger - (cellzToHide[sCell]/(danger_max+1)*ratioDanger);
				if(cellzToHide[sCell] < danger_min+selfLife/5) score += bonusSafe;
				if(cellzToHide[sCell] > selfLife) score -= malusDanger;
				//modulo distance de l'enemie et de la case 306
				distToMid = getCellDistance(sCell, 306);
				distToNearEnemy = getCellDistance(sCell, getCell(getNearestEnemy()));

				if(selfLife-psnDmg < selfTotalLife-200 && !isEmpty(healerCells)) score -= getDistanceToClosestHealer(sCell, healerCells);
				score -= distToMid;
				score += distToNearEnemy;
				// FIN FORMULE DU SCORE
				var s = ["aCell": aCell, "target": target, "sCell": sCell, "damage":round(cellzToAttack[target]), "danger": cellzToHide[sCell], "score": round(score)];
				//push(solutions, s);
				if(best==null || best["score"] < s["score"]) best = s;
				if(getOperations()> OPERATIONS_LIMIT-800000){
					brk=true;
					break;
				}
			}
		}
		if(brk) break;
	}
	if(brk) debugE("BREAKED§§§§§§§");
	
	return best;	
}
