var varGroup = {
	startButton : null,
	changeButton : null,
	difficultyButton : null,
	difficultyDegree : 20,
	recoverButton : null,
	blank : {row: 4, col: 4},
	index : 0,
	time : 0,
	timer : null,
	timeDiv : null,
	stack : [],
	map : new Array,
	isPlaying : false,
	isRecover : false,
	stepNum : 0,
	stepDiv : null,
	charArr : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'],
}


window.onload = function() {
	init();
	varGroup.changeButton.onclick = function() { changeImage(); };
	varGroup.startButton.onclick = function() { startGame(); };
	varGroup.difficultyButton.onclick = function() { changeDifficulty(); };
	varGroup.recoverButton.onclick = function() { recover(); };
}

function init() {
	gameDiv = document.getElementById('game-div');
	varGroup.changeButton = document.getElementById('change');
	varGroup.startButton = document.getElementById('start');
	varGroup.timeDiv = document.getElementById('time-div');
	varGroup.difficultyButton = document.getElementById('difficulty');
	varGroup.stepDiv = document.getElementById('step-div');
	varGroup.recoverButton = document.getElementById('recover');
	changeImage();
}

function changeImage() {
	if (varGroup.isRecover == true)
		return;
	varGroup.stack = [];
	varGroup.isPlaying = false; 	//还原游戏状态
	gameDiv.innerHTML = ""; 		//清空拼图板块
	varGroup.blank.row = 4; 		//还原空白板块位置
	varGroup.blank.col = 4;			
	clearInterval(varGroup.timer);  //清除时间
	varGroup.time = 0;
	varGroup.stepNum = 0;
	varGroup.timeDiv.innerHTML = "0";
	varGroup.stepDiv.innerHTML = "0";
	for (var i = 0; i < 4; ++i)		//清除map的数据
		varGroup.map[i] = [];

	var frag = document.createDocumentFragment(); //往拼图板块中加图
	if (varGroup.index >= 7)
		varGroup.index = 0;
	for (var i = 0; i < 4; ++i) {
		var rowArr = [];
		for (var j = 0; j < 4; ++j) {
			var imgDiv = document.createElement('div');
			imgDiv.className = "row-" + (i + 1) + " col-" + (j + 1) + " pic" + " b" + (varGroup.index + 1);
			imgDiv.id = "pic" + (i + 1) + "-" + (j + 1);
			imgDiv.value = varGroup.charArr[i*4 + j];
			imgDiv.onclick = (function(i) {
				return function () {
					move(this, getPos(this));    //添加点击函数
				}
			})(i);
			rowArr[j] = imgDiv;					//把imgDiv放到map中，map是二维数组，直接存储对象，位置从0开始
			frag.appendChild(imgDiv);
		}
		varGroup.map[i] = rowArr;
	}
	gameDiv.appendChild(frag);
	varGroup.index++; 							//背景图片翻页
}

//根据ClassName获取位置，返回的位置从1开始。
function getPos (id) {
	var name = id.className;
	var row = name[name.indexOf("row-") + 4];
	var col = name[name.indexOf("col-") + 4];
	return {
		row: parseInt(row),
		col: parseInt(col)
	}
}


function move(id, pos) {
	if (varGroup.isPlaying == false)
		return;
	if ((pos.row + 1 == varGroup.blank.row || pos.row - 1 == varGroup.blank.row ) && pos.col == varGroup.blank.col) {
		swapClassName(id, varGroup.map[varGroup.blank.row - 1][varGroup.blank.col - 1]);
		swapPosInArr(pos, varGroup.blank);
		pushStack();
		varGroup.blank.row = pos.row;
		varGroup.blank.col = pos.col;
		varGroup.stepNum++;
		varGroup.stepDiv.innerHTML = varGroup.stepNum;
	} else if (pos.row == varGroup.blank.row && (pos.col + 1 == varGroup.blank.col || pos.col - 1 == varGroup.blank.col)) {
		swapClassName(id, varGroup.map[varGroup.blank.row - 1][varGroup.blank.col - 1]);
		swapPosInArr(pos, varGroup.blank);
		pushStack();
		varGroup.blank.row = pos.row;
		varGroup.blank.col = pos.col;
		varGroup.stepNum++;
		varGroup.stepDiv.innerHTML = varGroup.stepNum;
	} else {
		return;
	}

	if (check()) {
		alert("You Win!\nThe time you cost is : " + varGroup.time + "\nThe setps you cost is : " + varGroup.stepNum);
		varGroup.isPlaying = false;
		varGroup.time = 0;
		varGroup.stepNum = 0;
		clearInterval(varGroup.timer); //清除时间循环
	}
}

function pushStack () {
	var mapString = "";
	for (var i = 0; i < 4; ++i)
	for (var j = 0; j < 4; ++j) {
		mapString = mapString + varGroup.map[i][j].value;
	}
	var a = {row: varGroup.blank.row, col: varGroup.blank.col};
	var temp = {
		string : mapString,
		next : a,
	};
	// var k;
	// for (k = varGroup.stack.length - 1; k >= 0; --k) {
	// 	if (varGroup.stack[k].string == temp.string) {
	// 		var l = varGroup.stack.length - 1 - k;
	// 		for (var t = 0; t < l; ++t)
	// 			varGroup.stack.pop();
	// 	}
	// }
	// if (k < 0)
	varGroup.stack.push(temp);
}

function startGame() {
	with (varGroup) {
		if (isRecover == true)
			return;
		clearInterval(timer); //清除时间循环
		time = 0;
		stepNum = 0;
		timeDiv.innerHTML = "0";
		stepDiv.innerHTML = "0";
		recoverButton.className = "green-button button";
		isPlaying = true;     //把游戏状态改成开始
		timer = setInterval(function () {
			time++;
			timeDiv.innerHTML= time;
		}, 1000);
	}
	random();      //随机打乱拼图
}

function random() {
	with (varGroup) {
		var dirRow = [0, -1, 0, 1];
		var dirCol = [1, 0, -1, 0];
		for (var k = 0; k < difficultyDegree; ++k) { //执行100次有效的移动
			while (true) {
				var randomDir = Math.floor(Math.random() * 4);
				var NextRow = blank.row + dirRow[randomDir] - 1;    //NextRow从0开始
				var NextCol = blank.col + dirCol[randomDir] - 1;	 //NextCol从0开始
				if (NextRow > 3 || NextRow < 0 || NextCol > 3 || NextCol < 0) {   //如果超出格子则继续
					continue;
				} else {
					var target = {row : NextRow, col : NextCol}
					//作死代码区-----------------------------
					var mapString = "";
					for (var i = 0; i < 4; ++i)
					for (var j = 0; j < 4; ++j) {
						mapString = mapString + map[i][j].value;
					}
					var a = {row: blank.row, col: blank.col};
					var temp = {
						string : mapString,
						next : a,
					};
					var x;
					for (x = stack.length - 1; x >= 0; --x) {
						if (stack[x].string == temp.string) {
							var l = stack.length - 1 - x;
							for (var t = 0; t < l; ++t)
								stack.pop();
						}
					}
					if (x < 0)
					stack.push(temp);
					//作死代码区-----------------------------
					swap(target);
					break;
				}
			}
		}
		for (var i = 0; i < 4; ++i)
		for (var j = 0; j < 4; ++j) {
			map[i][j].className = "row-" + (i + 1) + " col-" + (j + 1) + " pic" + " b" + index;
		}
	}
}

function swap(target) {
	var temp = varGroup.map[target.row][target.col];
	varGroup.map[target.row][target.col] = varGroup.map[varGroup.blank.row - 1][varGroup.blank.col - 1];
	varGroup.map[varGroup.blank.row - 1][varGroup.blank.col - 1] = temp;
	varGroup.blank.row = target.row + 1;
	varGroup.blank.col = target.col + 1;
}

function swapClassName(a, b) {
	var temp = a.className;
	a.className = b.className;
	b.className = temp;
}

function swapPosInArr(a, b) {
	var temp = varGroup.map[a.row - 1][a.col - 1];
	varGroup.map[a.row - 1][a.col - 1] = varGroup.map[b.row - 1][b.col - 1];
	varGroup.map[b.row - 1][b.col - 1] = temp;
}

function swapPos(a, b) {
	var tempRow = a.row, tempCol = a.col;
	a.row = b.row;
	a.col = b.col;
	b.row = tempRow;
	b.col = tempCol;
}

function check() {
	for (var i = 0; i < 4; ++i)
	for (var j = 0; j < 4; ++j) {
		if (varGroup.map[i][j].id != ("pic" + (i + 1) + "-" + (j + 1)))
			return false;
	}
	return true;
}

function changeDifficulty () {
	if (varGroup.difficultyDegree == 20) {
		varGroup.difficultyDegree = 100;
		varGroup.difficultyButton.innerHTML = "Difficult";
		varGroup.difficultyButton.className = "red-button button";
	} else {
		varGroup.difficultyDegree = 20;
		varGroup.difficultyButton.innerHTML = "Easy";
		varGroup.difficultyButton.className = "green-button button";
	}
}

function recover() {
	with (varGroup) {
		if (varGroup.isPlaying == false) {
			return;
		}
		varGroup.isRecover = true;
		clearInterval(varGroup.timer);  //清除时间
		varGroup.time = 0;
		varGroup.stepNum = 0;
		varGroup.timeDiv.innerHTML = "0";
		varGroup.stepDiv.innerHTML = "0";
		varGroup.isPlaying = false;
		var i = varGroup.stack.length - 1;
		var timer2 = setInterval(function() {
			if (i < 0) {
				clearInterval(timer2);
				varGroup.isRecover = false;
				recoverButton.className = "gray-button button";
				return;
			}
			var id = varGroup.map[varGroup.stack[i].next.row - 1][varGroup.stack[i].next.col - 1];
			swapClassName(id, varGroup.map[varGroup.blank.row - 1][varGroup.blank.col - 1]);
			swapPosInArr(varGroup.stack[i].next, varGroup.blank);
			varGroup.blank.row = varGroup.stack[i].next.row;
			varGroup.blank.col = varGroup.stack[i].next.col;
			i--;
		}, 100);
	}
	
}