document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('game-player');
    const gameBoard = document.getElementById('game-board');
    // 新增：獲取計分板元素
    const scoreDisplay = document.getElementById('game-score');

    // 如果在頁面上找不到遊戲板，就直接返回，不執行遊戲邏輯
    if (!gameBoard || !player) {
        return;
    }

    // --- 物理引擎變數 ---
    let playerY = 0;
    let velocityY = 0;
    const gravity = -1.2;
    const jumpStrength = 18;
    let jumpCount = 0;

    // --- 遊戲狀態變數 ---
    let isGameOver = true;
    let gameLoopInterval;
    let score = 0;
    let obstacleGeneratorInterval;
    let cloudGeneratorInterval;

    // --- AI 變數 ---
    const CHEAT_JUMP_DISTANCE = 80;

    function startGame() {
        isGameOver = false;
        playerY = 0;
        velocityY = 0;
        
        // 新增：重置分數和顯示
        score = 0;
        if (scoreDisplay) scoreDisplay.innerText = `score : ${score}`;

        // 清理前一局的障礙物
        document.querySelectorAll('.game-obstacle').forEach(obs => obs.remove());

        if (gameLoopInterval) clearInterval(gameLoopInterval);
        if (obstacleGeneratorInterval) clearTimeout(obstacleGeneratorInterval);
        if (cloudGeneratorInterval) clearTimeout(cloudGeneratorInterval); // 新增：清理雲朵計時器

        // 啟動遊戲循環和障礙物生成
        gameLoopInterval = setInterval(gameLoop, 20);
        generateObstacles();
        generateClouds(); // 新增：啟動雲朵生成
    }

    function generateObstacles() {
        if (isGameOver) return;
        createObstacle();
        const randomInterval = Math.random() * 1200 + 1000;
        obstacleGeneratorInterval = setTimeout(generateObstacles, randomInterval);
    }

    function createObstacle() {
        const obstacle = document.createElement('div');
        obstacle.classList.add('game-obstacle');
        obstacle.style.width = '20px'; // 簡化障礙物尺寸
        obstacle.style.height = '40px';
        gameBoard.appendChild(obstacle);
        obstacle.addEventListener('animationend', () => {
            // 新增：如果遊戲還沒結束，就加分
            if (!isGameOver && scoreDisplay) {
                score++;
                scoreDisplay.innerText = `score : ${score}`;
            }
            obstacle.remove();
        });
    }
    
    function gameOver() {
        isGameOver = true;
        clearInterval(gameLoopInterval);
        clearTimeout(obstacleGeneratorInterval);
        clearTimeout(cloudGeneratorInterval); // 新增：停止生成雲朵
        
        // 死亡後 0.5 秒自動重來
        setTimeout(startGame, 1000);
    }

    function autoJumpAI() {
        if (isGameOver) return;

        const playerRect = player.getBoundingClientRect();
        const allObstacles = document.querySelectorAll('.game-obstacle');
        
        for (let obstacle of allObstacles) {
            const obstacleRect = obstacle.getBoundingClientRect();

            if (obstacleRect.left > playerRect.right) {
                const distance = obstacleRect.left - playerRect.right;
                
                if (distance < CHEAT_JUMP_DISTANCE && playerY <= 0) {
                    velocityY = jumpStrength;
                    jumpCount = 1; // 算作第一段跳 (雖然 AI 用不太到二段)
                    break; 
                }
            }
        }
    }

    function gameLoop() {
        if (isGameOver) return;

        autoJumpAI();

        velocityY += gravity;
        playerY += velocityY;
        if (playerY <= 0) {
            playerY = 0;
            velocityY = 0;
            jumpCount = 0;
        }
        player.style.bottom = playerY + 'px';

        const playerRect = player.getBoundingClientRect();
        const allObstacles = document.querySelectorAll('.game-obstacle');

        for (let obstacle of allObstacles) {
            const obstacleRect = obstacle.getBoundingClientRect();
            if (
                playerRect.left < obstacleRect.right &&
                playerRect.right > obstacleRect.left &&
                playerRect.top < obstacleRect.bottom &&
                playerRect.bottom > obstacleRect.top
            ) {
                gameOver();
                return;
            }
        }
    }
    function generateClouds() {
        if (isGameOver) return;
        createCloud();
        // 每隔 3 到 6 秒生成一片雲
        const randomInterval = Math.random() * 3000 + 2000; 
        cloudGeneratorInterval = setTimeout(generateClouds, randomInterval);
    }

    function createCloud() {
        const cloud = document.createElement('div');
        cloud.classList.add('game-cloud');
        
        // 隨機大小
        const size = Math.random() * 80 + 20; // 20px 到 50px
        cloud.style.width = size + 'px';
        cloud.style.height = (size / 2) + 'px'; // 雲朵比較扁

        // 隨機垂直位置 (y軸)
        const cloudY = Math.random() * 80 + 80; // 距離底部 80px 到 160px
        cloud.style.bottom = cloudY + 'px';

        // 隨機透明度
        cloud.style.opacity = Math.random() * 0.4 + 0.3; // 0.3 到 0.7

        gameBoard.appendChild(cloud);

        // 動畫結束後移除雲朵
        cloud.addEventListener('animationend', () => {
            cloud.remove();
        });
    }

    // 初始啟動遊戲
    startGame();
});