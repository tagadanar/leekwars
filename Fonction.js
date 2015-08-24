/* USEFULL FUNCTION */
function getArrayDistFromCenter(){
	var result = [];
	for(var i = 0; i <= 612; i++){
		// on prend la distance pure, *2 pour augmenter le rejet des 4 coins.
		result[i] = getDistance(i, 306)*2;
	}
	return result;
};

function isInArray(value, array){
	for(var v in array) if(value == v) return true;
	return false;
};

function getAllAllyBulbCell(){
	var bulbz = [];
	for(var al in getAliveAllies()) if(isSummon(al)) push(bulbz, getCell(al));
	return bulbz;
};

function getAllAllyBulb(){
	var bulbz = [];
	for(var al in getAliveAllies()) if(isSummon(al)) push(bulbz, al);
	return bulbz;
};

function getAllBulbCellToIgnore(){
	var bulbz = getAllAllyBulbCell();
	for(var en in getAliveEnemies()) if(isSummon(en)) push(bulbz, getCell(en));
	return bulbz;
};

function getEnemiesToIgnore(){
	var enemiesToIgnore = [];
	for(var en in getAliveEnemies()) push(enemiesToIgnore, en);
	for(var al in getAliveAllies()) if(isSummon(al)) push(enemiesToIgnore, al);
	return enemiesToIgnore;
};

function isAlreadyOnEffect(leek, e){
	// 	effect [type, value, caster_id, turns, critical, item_id, target_id]
	//			0	, 1	   , 2.....
	for(var effect in getEffects(leek)){
		if(effect[5] == e){
			return true;
		}
	}
	return false;
};

// renvoie le poireau sans prendre en compte les bulbes.
function getEnemyLeek(selfCell){
	var near = getNearestEnemy();
	var issum = isSummon(near);
	if(issum == false) return near;
	var dst = 30;
	var enemies = getAliveEnemies();
	for(var enemy in enemies){
		var tmp = getCellDistance(selfCell, getCell(enemy));
		if(isSummon(enemy) == false && tmp < dst){
			dst = tmp;
			near = enemy;
		}
	}
	return near;
};

var getAnotherEnemyLeek = function(selfCell, notThisEnemy){
	var near = getNearestEnemy();
	var issum = isSummon(near) || near == notThisEnemy;
	if(issum == false) return near;
	var dst = 30;
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
var getEnemyLeekByPath = function(selfCell){
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

function getAreaCell(c, area){
	var result;
	if(area == AREA_CIRCLE_1){
		result = [ c + 17, c + 18, c - 17, c - 18];
	}else if(area == AREA_CIRCLE_2){
		result = [ c + 17, c + 18, c - 17, c - 18, c + 35, c - 35, c + 1, c - 1, c + 36, c - 36, c + 34, c - 34];
	}else if(area == AREA_CIRCLE_3){
		result = [ c + 17, c + 18, c - 17, c - 18, c + 35, c - 35, c + 1, c - 1, c + 36, c - 36, c + 34, c - 34, c - 54, c - 53, c - 52, c - 51, c - 16, c + 19, c - 19, c + 16, c + 51, c + 52, c + 53, c + 54];
	}
	var tmp = result;
	for(var r in tmp) if(r < 0 || r > 612 || getCellDistance(c, r) > 5) removeElement(result, r);
	return result;
}

function getRingCellz(c){
	var result = [c+19, c-19, c+53, c-53, c-16, c+16, c+52, c-52];
	var tmp = result;
	for(var r in tmp) if(getCellDistance(c, r) > 5) removeElement(result, r);
	return result;
};

// get the list of the cell the leek can move to in 1 turn
// environ 40k opération avec 5mp
function getMoveCells(cell, mp){
	var c = cell;
	var cells = [];
	push(cells, c); // on add la cell courante pour les futurs tests de positionnement.
	for(var i=0;i<=612;i++){
		if(c != i && !isObstacle(i) && !isLeek(i) && getCellDistance(c, i) <= mp){
			var len = getPathLength(c, i);
			if(len != null && len > 0 && len <= mp) push(cells, i);
		}
	}
	return cells;
};

// get the list of the cell the leek can move to in 1 turn
function getEnemyMoveCells(cell, mp, myCellToIgnore){
	var c = cell;
	var cells = [];
	push(cells, c); // on add la cell courante pour les futurs tests de positionnement.
	for(var i=0;i<=612;i++){
		if(c != i && !isObstacle(i) && (!isLeek(i) || i == myCellToIgnore) && getCellDistance(c, i) <= mp){
			var len = getPathLength(c, i, [myCellToIgnore]);
			if(len != null && len > 0 && len <= mp) push(cells, i);
		}
	}
	return cells;
};

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
		if(!dst || dst > tmp){
			dst = tmp;
			bestCell = cell;
		}
	}
	if(bestCell && bestCell != getCell()) return bestCell;
	else return getClosestCell(cells, c);
};

function needShield(){
	var n = false;
	for(var e in getAliveEnemies()){
		if(getStrength(e) > 199){
			n = true;
		}
	}
	return n;
}

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
			for(var cc in getAreaCell(getCell(enemy), AREA_CIRCLE_2)){
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
	var cells = getAreaCell(c, AREA_CIRCLE_2);
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
			useChip(CHIP_STALACTITE, enemy);
			useChip(CHIP_ICE, enemy);
			useChip(CHIP_ICE, enemy);

			for(var ally in getAliveAllies()) if(!isSummon(ally) && !isAlreadyOnEffect(ally, CHIP_REFLEXES)) useChip(CHIP_REFLEXES, ally);
			useChip(CHIP_REFLEXES, getLeek());
		});
		break;
	}
};

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

function getSimplfiedPotentialDmg(enemy){
	var str = getStrength(enemy);
	var mgc = getMagic(enemy);
	var enemyPotentialDmg = 0;
	var nbAttack = 2;
	if(str >= mgc){
		enemyPotentialDmg= (1+(str/100))*55;// dmg per attack
		enemyPotentialDmg=((enemyPotentialDmg*(1-(getRelativeShield()/100)))-getAbsoluteShield())*nbAttack;
	}else{
		enemyPotentialDmg = (1+(mgc/100))*40 *nbAttack;
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
		for(var i: var v in array){
			var cell = i;
			var score = v;
			mark(cell, getColor(score/max*255 , 0, 0));
		}
	}else{
		debugE("NO CELLZ TO ATTACK");
	}
}

// show score on map in green if == 0 or nivelling blue if > 0, array must be sorted ascending (low to high)
function showScoreGreen(array){
	if(count(array)>0){
		//debug(array);
		var max;
		for(var v in array){ max = v; }
		for(var i: var v in array){
			var cell = i;
			var score = v;
			if(score == 0) mark(cell, getColor(0, 255, 0));
			else mark(cell, getColor(0, 255-(score/max*255), score/max*255));
		}
	}else{
		debugE("NO CELLZ TO ATTACK");
	}
}

function showScoreGreenWithMax(array, max){
	if(count(array)>0){
		//debug(array);
		for(var i: var v in array){
			var cell = i;
			var score = v;
			if(score == 0) mark(cell, getColor(0, 255, 0));
			else mark(cell, getColor(0, 255-(score/max*255), score/max*255));
		}
	}else{
		debugE("NO CELLZ TO ATTACK");
	}
}

// environ 160k opération en 1v6 avec gazor
// 120k opération en 1v6 avec grenade launcher
// 70k opération en 1v6 avec magnum
// WARNING /!\ NOT WORKING WITH LINE WEAPON § TODO spécial case. pour le moment utiliser les functions de flammerfunctions.
// todo one day: récupérer les stats en armor et science et anticiper les dégats réels, si j'achève un leek, etc... pour avoir un meilleur classement de quality.
function getCellzQualityToAttack(weapon){
	var coefAllyLeek = 4;
	var coefAllyBulb = 1;
	var coefEnmyLeek = 3;
	var coefEnmyBulb = 1;
	var self = getLeek();

	var weaponArea = getWeaponArea(weapon);
	var arrayCellToLeeks = [];

	for(var i = 0; i <= 612; i++){
		if(isObstacle(i)) arrayCellToLeeks[i] = null;
		else arrayCellToLeeks[i] = getWeaponTargets(weapon, i);
	}
	
	var arrayResult = [];
	for(var i = 0; i <= 612; i++){
		arrayResult[i] = 0;//["cell":i, "score":0];
		if(arrayCellToLeeks[i] != null){
			for(var leek in arrayCellToLeeks[i]){
				if(isAlly(leek) && leek != self){
					if(isSummon(leek))
						arrayResult[i] -= getMySimplifiedPotentialDmgInOneAttack(weapon, leek) * getDamagePercentage(i, getCell(leek), weaponArea)/100 * coefAllyBulb;
					else
						arrayResult[i] -= getMySimplifiedPotentialDmgInOneAttack(weapon, leek) * getDamagePercentage(i, getCell(leek), weaponArea)/100 * coefAllyLeek;
				}
				// possible amélioration de perf en retirant la condition superflu
				else if(isEnemy(leek)){ 
					if(isSummon(leek)) 
						arrayResult[i] += getMySimplifiedPotentialDmgInOneAttack(weapon, leek) * getDamagePercentage(i, getCell(leek), weaponArea)/100 * coefEnmyBulb;
					else 
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

// environ 1600k op en 1v6 avec 3mp partout.
// environ 4000k op vs 3leek avec 16, 15 et 12 MP; crash occasionnel avec le find best move ensuite..
function getCellzQualityToHide(){
	var op = getOperations(); // TODO remove
	var enemies = getAliveEnemies();
	var myCellToIgnore = getCell();
	var leekToIgnore = getAllAllyBulb();// ignorer les bulbs car ils bougent souvent juste après moi
	push(leekToIgnore, getLeek()); // m'ignorer moi car je vais bouger, et je ne compte pas me cacher derrière moi même.
	var cellzDistFromCenter = getArrayDistFromCenter();
	var cellzDanger = [];
	for(var i = 0; i <= 612; i++) cellzDanger[i] = 0;
	
	for(var enemy in enemies){
		var enemyCell = getCell(enemy);
		push(leekToIgnore, enemy); // s'ignorer soit mm pour les tests de ligne de vue après move.
		var moveCellz = getEnemyMoveCells(getCell(enemy), getMP(enemy), myCellToIgnore);
		var potDmg = getSimplfiedPotentialDmg(enemy);
		var range = 8; // magnum
		for(var i = 0; i <= 612; i++){
			var dist = getCellDistance(enemyCell, i);
			if(!isObstacle(i) && (isEmptyCell(i) || i == myCellToIgnore)){
				for(var mCell in moveCellz){
					if(getCellDistance(mCell, i) <= range && lineOfSight(mCell, i, leekToIgnore)){
						var tmpDmg = potDmg + cellzDistFromCenter[i] - dist;
						if(tmpDmg < 0) tmpDmg = 0;
						cellzDanger[i] += tmpDmg;
						break;
					}
				}
			}
		}
		removeElement(leekToIgnore, enemy); // on le retire pour rajouter le suivant
	}
	
	cellzDanger = arrayFilter(cellzDanger, function(key, val){
		if(!isObstacle(key) && (isEmptyCell(key) || key == myCellToIgnore)) return true;
		return false;
	});
	cellzDanger = arraySort(cellzDanger, function(val1, val2){
		if(val1 > val2) return 1;
		else if(val1 == val2) return 0;
		else return -1;
	});
	
	debugW("OP_cell_to_hide:"+(getOperations()-op));
	return cellzDanger;
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
};

// retourne le danger d'une case, le score le plus bas win.
function getDangerScore(cell, cellzToHide){
	var nearCells = getAreaCell(cell, AREA_CIRCLE_3);
	var dangerScore = cellzToHide[cell];
	for(var ncell in nearCells){
		if(cellzToHide[ncell] && getCellDistance(cell, ncell) < 2) dangerScore += cellzToHide[ncell]/8;
		else if(cellzToHide[ncell] && getCellDistance(cell, ncell) < 3) dangerScore += cellzToHide[ncell]/32;
		else if(cellzToHide[ncell]) dangerScore += cellzToHide[ncell]/128;
		// implicitement les obstacles ont un score de 0, donc gut :)
	}
	return dangerScore;
}


function findBestMove(cellzToHide, cellzToAttack, weapon){
	var moveCellz = getMoveCells(getCell(), getMP());
	if(count(moveCellz)==1) return null; // sécurité anti-block
	var selfCell = getCell();
	var selfLife = getLife();
	var selfMP = getMP();
	var ratioDmg = 100;
	var ratioDanger = 200;
	var bonusSafe = 50;
	var danger_min=null, danger_max=null, damage_max=null;
	
	// key: cell, value: targetCell
	var assocCellToBestTarget = [];
	var assocCellToDangerScore = [];
	var solutions = [];
	var pathlen = null;
	
	for(var targetCell: var damage in cellzToAttack){
		if(damage_max == null || damage > damage_max) damage_max = damage;
		var cellzAttack;
		if(weapon == WEAPON_GAZOR) cellzAttack = getCellzToUseGazorOnCell(targetCell);
		else cellzAttack = getCellsToUseWeaponOnCell(weapon, targetCell, [selfCell]);
		for(var cell in cellzAttack){
			if(!assocCellToBestTarget[cell]) assocCellToBestTarget[cell] = targetCell;
		}
	}
	
	for(var sCell: var damage in cellzToHide){
		assocCellToDangerScore[sCell] = getDangerScore(sCell, cellzToHide);
		if(danger_max == null || danger_max < assocCellToDangerScore[sCell]) danger_max = assocCellToDangerScore[sCell];
		if(danger_min == null || danger_min > assocCellToDangerScore[sCell]) danger_min = assocCellToDangerScore[sCell];
	}
	//showScoreGreenWithMax(assocCellToDangerScore, danger_max);

	for(var aCell: var target in assocCellToBestTarget){
		var mpLeft = selfMP - getPathLength(selfCell, aCell);
		for(var sCell: var damage in cellzToHide){
			if(getCellDistance(aCell, sCell) <= mpLeft){
				pathlen = getPathLength(aCell, sCell, [selfCell]);
				if(pathlen != null && pathlen <= mpLeft && selfLife > damage){
					// FORMULE DU SCORE:
					var score = cellzToAttack[target]/damage_max*ratioDmg;
					if(selfLife/2 > damage) score *= 2;
					score += ratioDanger - (assocCellToDangerScore[sCell]/(danger_max+1)*ratioDanger);
					//if(assocCellToDangerScore[sCell] <= danger_min) score += bonusSafe;
					if(damage == 0) score += bonusSafe;
					
					push(solutions, ["aCell": aCell, "target": target, "sCell": sCell, "damage":round(cellzToAttack[target]), "danger": round(assocCellToDangerScore[sCell]), "score": round(score)]);
				}
			}
		}
	}
	
	// NOW I HAVE TO CHOOSE A PLAY BETWEEN ALL.
	var best = null;
	for(var s in solutions){
		if(best==null) best = s;
		else{
			//compare best with s, keep the best.
			if(best["score"] < s["score"]) best = s;
			
			// best safe:
			//if(s["danger"] < best["danger"]) best = s;
			//else if(s["danger"] == best["danger"] && s["damage"] > best["damage"]) best = s;
		}
	}
	return best;	
}
