// DOM要素
const gameBoard = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const movesElement = document.getElementById("moves");
const newGameButton = document.getElementById("new-game");

// 動物の名前マッピング
const animalNames = {
    2: "うさぎ",
    4: "ねこ",
    8: "いぬ",
    16: "きつね",
    32: "おおかみ",
    64: "ライオン",
    128: "ぞう",
    256: "きりん",
    512: "さい",
    1024: "ドラゴン",
    2048: "ユニコーン",
    4096: "フェニックス"
};

// ゲーム変数
let board = [];
let score = 0;
let movesLeft = 100;
let gameOver = false;

// ゲームを初期化する関数
function initGame() {
    // ボードをクリア
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    
    // 変数をリセット
    score = 0;
    movesLeft = 100;
    gameOver = false;
    
    // UI要素をリセット
    scoreElement.textContent = "0";
    movesElement.textContent = "100";
    gameBoard.innerHTML = "";
    
    // ゲームボードを作成
    createBoard();
    
    // 初期タイルを2つ追加
    addRandomTile();
    addRandomTile();
    
    // キーボードイベントを設定
    document.removeEventListener("keydown", handleKeyPress);
    document.addEventListener("keydown", handleKeyPress);
}

// ゲームボードを作成する関数
function createBoard() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = document.createElement("div");
            tile.classList.add("tile", "empty");
            tile.setAttribute("data-row", i);
            tile.setAttribute("data-col", j);
            tile.id = `tile-${i}-${j}`;
            gameBoard.appendChild(tile);
        }
    }
}

// ランダムな位置に新しいタイルを追加する関数
function addRandomTile() {
    // 空いているセルを探す
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }
    
    // 空いているセルがなければ何もしない
    if (emptyCells.length === 0) return;
    
    // ランダムな空セルを選択
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    // 90%の確率で2、10%の確率で4を配置
    const value = Math.random() < 0.9 ? 2 : 4;
    board[randomCell.row][randomCell.col] = value;
    
    // UIを更新
    updateTile(randomCell.row, randomCell.col, true);
}

// タイルのUIを更新する関数
function updateTile(row, col, isNew = false) {
    const tile = document.getElementById(`tile-${row}-${col}`);
    const value = board[row][col];
    
    // クラスをリセット
    tile.className = "tile";
    
    if (value === 0) {
        tile.classList.add("empty");
        tile.textContent = "";
        tile.title = "";
    } else {
        tile.classList.add(`tile-${value}`);
        if (value > 2048) {
            tile.classList.add("tile-super");
        }
        
        // タイルに動物の名前を設定（ツールチップ用）
        const animalName = animalNames[value] || "伝説の生き物";
        tile.title = `${animalName} (${value})`;
        
        // 数値を表示する
        tile.textContent = value;
        
        if (isNew) {
            tile.classList.add("new-tile");
            setTimeout(() => {
                tile.classList.remove("new-tile");
            }, 300);
        }
    }
}

// ボード全体のUIを更新する関数
function updateBoard() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            updateTile(i, j);
        }
    }
}

// キー入力を処理する関数
function handleKeyPress(event) {
    if (gameOver) return;
    
    let moved = false;
    
    // 移動中はキー入力を無視
    if (document.querySelector(".slide-up, .slide-down, .slide-left, .slide-right, .merge")) {
        return;
    }
    
    switch (event.key) {
        case "ArrowUp":
            moved = moveUp();
            break;
        case "ArrowDown":
            moved = moveDown();
            break;
        case "ArrowLeft":
            moved = moveLeft();
            break;
        case "ArrowRight":
            moved = moveRight();
            break;
        default:
            return; // 他のキーは無視
    }
    
    if (moved) {
        // 移動が行われた場合
        movesLeft--;
        movesElement.textContent = movesLeft;
        
        // 少し遅延させてから新しいタイルを追加
        setTimeout(() => {
            addRandomTile();
            
            // ゲーム終了条件をチェック
            if (movesLeft <= 0 || !canMove()) {
                calculateFinalScore();
            }
        }, 250);
    }
}

// 上方向への移動
function moveUp() {
    let moved = false;
    let merged = []; // 合体したタイルを記録
    
    for (let col = 0; col < 4; col++) {
        // 各列を上から下に処理
        for (let row = 1; row < 4; row++) {
            if (board[row][col] !== 0) {
                let currentRow = row;
                
                // タイルを可能な限り上に移動
                while (currentRow > 0) {
                    if (board[currentRow - 1][col] === 0) {
                        // 上のセルが空いている場合
                        board[currentRow - 1][col] = board[currentRow][col];
                        board[currentRow][col] = 0;
                        currentRow--;
                        moved = true;
                        
                        // アニメーション用のクラスを追加
                        const tile = document.getElementById(`tile-${currentRow}-${col}`);
                        tile.classList.add("slide-up");
                        setTimeout(() => {
                            tile.classList.remove("slide-up");
                        }, 200);
                        
                    } else if (board[currentRow - 1][col] === board[currentRow][col] && !merged.includes(`${currentRow-1},${col}`)) {
                        // 上のセルが同じ値の場合（合体）
                        board[currentRow - 1][col] *= 2;
                        score += board[currentRow - 1][col];
                        board[currentRow][col] = 0;
                        moved = true;
                        merged.push(`${currentRow-1},${col}`); // 合体したタイルを記録
                        
                        // 合体アニメーション用のクラスを追加
                        const tile = document.getElementById(`tile-${currentRow-1}-${col}`);
                        tile.classList.add("merge");
                        setTimeout(() => {
                            tile.classList.remove("merge");
                        }, 300);
                        
                        break;
                    } else {
                        // 上のセルが異なる値の場合
                        break;
                    }
                }
            }
        }
    }
    
    if (moved) {
        updateBoard();
        scoreElement.textContent = score;
    }
    
    return moved;
}

// 下方向への移動
function moveDown() {
    let moved = false;
    let merged = []; // 合体したタイルを記録
    
    for (let col = 0; col < 4; col++) {
        // 各列を下から上に処理
        for (let row = 2; row >= 0; row--) {
            if (board[row][col] !== 0) {
                let currentRow = row;
                
                // タイルを可能な限り下に移動
                while (currentRow < 3) {
                    if (board[currentRow + 1][col] === 0) {
                        // 下のセルが空いている場合
                        board[currentRow + 1][col] = board[currentRow][col];
                        board[currentRow][col] = 0;
                        currentRow++;
                        moved = true;
                        
                        // アニメーション用のクラスを追加
                        const tile = document.getElementById(`tile-${currentRow}-${col}`);
                        tile.classList.add("slide-down");
                        setTimeout(() => {
                            tile.classList.remove("slide-down");
                        }, 200);
                        
                    } else if (board[currentRow + 1][col] === board[currentRow][col] && !merged.includes(`${currentRow+1},${col}`)) {
                        // 下のセルが同じ値の場合（合体）
                        board[currentRow + 1][col] *= 2;
                        score += board[currentRow + 1][col];
                        board[currentRow][col] = 0;
                        moved = true;
                        merged.push(`${currentRow+1},${col}`); // 合体したタイルを記録
                        
                        // 合体アニメーション用のクラスを追加
                        const tile = document.getElementById(`tile-${currentRow+1}-${col}`);
                        tile.classList.add("merge");
                        setTimeout(() => {
                            tile.classList.remove("merge");
                        }, 300);
                        
                        break;
                    } else {
                        // 下のセルが異なる値の場合
                        break;
                    }
                }
            }
        }
    }
    
    if (moved) {
        updateBoard();
        scoreElement.textContent = score;
    }
    
    return moved;
}

// 左方向への移動
function moveLeft() {
    let moved = false;
    let merged = []; // 合体したタイルを記録
    
    for (let row = 0; row < 4; row++) {
        // 各行を左から右に処理
        for (let col = 1; col < 4; col++) {
            if (board[row][col] !== 0) {
                let currentCol = col;
                
                // タイルを可能な限り左に移動
                while (currentCol > 0) {
                    if (board[row][currentCol - 1] === 0) {
                        // 左のセルが空いている場合
                        board[row][currentCol - 1] = board[row][currentCol];
                        board[row][currentCol] = 0;
                        currentCol--;
                        moved = true;
                        
                        // アニメーション用のクラスを追加
                        const tile = document.getElementById(`tile-${row}-${currentCol}`);
                        tile.classList.add("slide-left");
                        setTimeout(() => {
                            tile.classList.remove("slide-left");
                        }, 200);
                        
                    } else if (board[row][currentCol - 1] === board[row][currentCol] && !merged.includes(`${row},${currentCol-1}`)) {
                        // 左のセルが同じ値の場合（合体）
                        board[row][currentCol - 1] *= 2;
                        score += board[row][currentCol - 1];
                        board[row][currentCol] = 0;
                        moved = true;
                        merged.push(`${row},${currentCol-1}`); // 合体したタイルを記録
                        
                        // 合体アニメーション用のクラスを追加
                        const tile = document.getElementById(`tile-${row}-${currentCol-1}`);
                        tile.classList.add("merge");
                        setTimeout(() => {
                            tile.classList.remove("merge");
                        }, 300);
                        
                        break;
                    } else {
                        // 左のセルが異なる値の場合
                        break;
                    }
                }
            }
        }
    }
    
    if (moved) {
        updateBoard();
        scoreElement.textContent = score;
    }
    
    return moved;
}

// 右方向への移動
function moveRight() {
    let moved = false;
    let merged = []; // 合体したタイルを記録
    
    for (let row = 0; row < 4; row++) {
        // 各行を右から左に処理
        for (let col = 2; col >= 0; col--) {
            if (board[row][col] !== 0) {
                let currentCol = col;
                
                // タイルを可能な限り右に移動
                while (currentCol < 3) {
                    if (board[row][currentCol + 1] === 0) {
                        // 右のセルが空いている場合
                        board[row][currentCol + 1] = board[row][currentCol];
                        board[row][currentCol] = 0;
                        currentCol++;
                        moved = true;
                        
                        // アニメーション用のクラスを追加
                        const tile = document.getElementById(`tile-${row}-${currentCol}`);
                        tile.classList.add("slide-right");
                        setTimeout(() => {
                            tile.classList.remove("slide-right");
                        }, 200);
                        
                    } else if (board[row][currentCol + 1] === board[row][currentCol] && !merged.includes(`${row},${currentCol+1}`)) {
                        // 右のセルが同じ値の場合（合体）
                        board[row][currentCol + 1] *= 2;
                        score += board[row][currentCol + 1];
                        board[row][currentCol] = 0;
                        moved = true;
                        merged.push(`${row},${currentCol+1}`); // 合体したタイルを記録
                        
                        // 合体アニメーション用のクラスを追加
                        const tile = document.getElementById(`tile-${row}-${currentCol+1}`);
                        tile.classList.add("merge");
                        setTimeout(() => {
                            tile.classList.remove("merge");
                        }, 300);
                        
                        break;
                    } else {
                        // 右のセルが異なる値の場合
                        break;
                    }
                }
            }
        }
    }
    
    if (moved) {
        updateBoard();
        scoreElement.textContent = score;
    }
    
    return moved;
}

// 移動可能かどうかをチェックする関数
function canMove() {
    // 空のセルがあれば移動可能
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                return true;
            }
        }
    }
    
    // 隣接するセルに同じ値があれば移動可能
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            // 右のセルをチェック
            if (j < 3 && board[i][j] === board[i][j + 1]) {
                return true;
            }
            // 下のセルをチェック
            if (i < 3 && board[i][j] === board[i + 1][j]) {
                return true;
            }
        }
    }
    
    // 移動不可能
    return false;
}

// 最終スコアを計算する関数
function calculateFinalScore() {
    gameOver = true;
    
    // 最終スコアを計算（タイルの合計値）
    let finalScore = 0;
    let highestValue = 0;
    let highestAnimal = "";
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            finalScore += board[i][j];
            if (board[i][j] > highestValue) {
                highestValue = board[i][j];
                highestAnimal = animalNames[highestValue] || "伝説の生き物";
            }
        }
    }
    
    // スコアを表示
    score = finalScore;
    scoreElement.textContent = score;
    
    // キーボードイベントを削除
    document.removeEventListener("keydown", handleKeyPress);
    
    // アラートで結果を表示
    setTimeout(() => {
        alert(`ゲーム終了！\n最終スコア: ${score}\n最高の動物: ${highestAnimal} (${highestValue})`);
        // 自動的に新しいゲームを開始
        initGame();
    }, 500);
}

// イベントリスナー
newGameButton.addEventListener("click", initGame);

// タッチスクリーンのサポートを追加
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, false);

function handleSwipe() {
    const xDiff = touchEndX - touchStartX;
    const yDiff = touchEndY - touchStartY;
    
    // 水平方向のスワイプが垂直方向より大きい場合
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            // 右スワイプ
            const event = { key: "ArrowRight" };
            handleKeyPress(event);
        } else {
            // 左スワイプ
            const event = { key: "ArrowLeft" };
            handleKeyPress(event);
        }
    } else {
        if (yDiff > 0) {
            // 下スワイプ
            const event = { key: "ArrowDown" };
            handleKeyPress(event);
        } else {
            // 上スワイプ
            const event = { key: "ArrowUp" };
            handleKeyPress(event);
        }
    }
}

// ゲームを初期化
window.onload = initGame;
