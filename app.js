// JavaScript for the Snake Game
        document.addEventListener('DOMContentLoaded', () => {
            // Game settings
            const gameBoard = document.getElementById('game-board');
            const scoreValue = document.getElementById('score-value');
            const highScoreValue = document.getElementById('high-score-value');
            const finalScoreValue = document.getElementById('final-score-value');
            const finalHighScoreValue = document.getElementById('final-high-score-value');
            const gameOverScreen = document.getElementById('game-over-screen');
            const restartBtn = document.getElementById('restart-btn');
            const pauseBtn = document.getElementById('pause-btn');
            const playAgainBtn = document.getElementById('play-again-btn');
            const themeToggle = document.getElementById('theme-toggle');
            const difficultyBtns = document.querySelectorAll('.difficulty-btn');
            
            // Mobile controls
            const upBtn = document.getElementById('up-btn');
            const downBtn = document.getElementById('down-btn');
            const leftBtn = document.getElementById('left-btn');
            const rightBtn = document.getElementById('right-btn');
            
            let gridSize = 30; // Number of cells in each row/column
            let cellSize;
            let snake = [];
            let aiSnake = [];
            let food = {};
            let direction = 'right';
            let nextDirection = 'right';
            let aiDirection = 'right';
            let gameSpeed = 150; // milliseconds
            let gameInterval;
            let score = 0;
            let highScore = localStorage.getItem('snakeHighScore') || 0;
            let isPaused = false;
            let isGameOver = false;
            let difficulty = 'easy';
            let aiMode = false;
            let wallsEnabled = false;
            let touchStartX = 0;
            let touchStartY = 0;
            
            // Initialize game
            function initGame() {
                // Reset game state
                snake = [];
                aiSnake = [];
                direction = 'right';
                nextDirection = 'right';
                aiDirection = 'right';
                score = 0;
                isPaused = false;
                isGameOver = false;
                scoreValue.textContent = '0';
                highScoreValue.textContent = highScore;
                
                // Set game speed based on difficulty
                switch(difficulty) {
                    case 'easy':
                        gameSpeed = 150;
                        wallsEnabled = false;
                        aiMode = false;
                        break;
                    case 'medium':
                        gameSpeed = 100;
                        wallsEnabled = true;
                        aiMode = false;
                        break;
                    case 'hard':
                        gameSpeed = 80;
                        wallsEnabled = true;
                        aiMode = false;
                        break;
                    case 'ai':
                        gameSpeed = 150;
                        wallsEnabled = false;
                        aiMode = true;
                        break;
                }
                
                // Clear game board
                while (gameBoard.firstChild) {
                    if (gameBoard.lastChild === gameOverScreen) {
                        break;
                    }
                    gameBoard.removeChild(gameBoard.lastChild);
                }
                
                // Calculate cell size based on game board dimensions
                const boardSize = Math.min(gameBoard.offsetWidth, gameBoard.offsetHeight);
                cellSize = boardSize / gridSize;
                
                // Create initial snake
                const startX = Math.floor(gridSize / 4);
                const startY = Math.floor(gridSize / 2);
                
                // Create head and two segments          
                snake.push({ x: startX + 2, y: startY });
                snake.push({ x: startX + 1, y: startY });
                snake.push({ x: startX, y: startY });     
                
                // Create AI snake if in AI mode
                if (aiMode) {
                    const aiStartX = Math.floor(gridSize / 4 * 3);
                    const aiStartY = Math.floor(gridSize / 2);
                    
                    aiSnake.push({ x: aiStartX - 2, y: aiStartY });
                    aiSnake.push({ x: aiStartX - 1, y: aiStartY });
                    aiSnake.push({ x: aiStartX, y: aiStartY });
                }
                
                // Render initial snakes
                renderSnakes();
                
                createFood();
                
                if (gameInterval) {
                    clearInterval(gameInterval);
                }
                
                gameInterval = setInterval(gameLoop, gameSpeed);
                
                // Hide game over screen
                gameOverScreen.style.display = 'none';
                pauseBtn.textContent = 'Pause';
            }
            
            // Main game loop
            function gameLoop() {
                if (isPaused || isGameOver) return;
                
                moveSnake();
                if (aiMode) {
                    moveAISnake();
                }
            }
            
            // Create food at random position
            function createFood() {
                let foodX, foodY;
                let validPosition = false;
                
                while (!validPosition) {
                    foodX = Math.floor(Math.random() * gridSize);
                    foodY = Math.floor(Math.random() * gridSize);
                    
                    // Check if position is not on snake or AI snake
                    validPosition = true;
                    for (let segment of snake) {
                        if (segment.x === foodX && segment.y === foodY) {
                            validPosition = false;
                            break;
                        }
                    }
                    
                    if (validPosition && aiMode) {
                        for (let segment of aiSnake) {
                            if (segment.x === foodX && segment.y === foodY) {
                                validPosition = false;
                                break;
                            }
                        }
                    }
                }
                
                food = { x: foodX, y: foodY };
                
                const foodElement = document.createElement('div');
                foodElement.classList.add('food');
                foodElement.style.width = `${cellSize}px`;
                foodElement.style.height = `${cellSize}px`;
                foodElement.style.left = `${food.x * cellSize}px`;
                foodElement.style.top = `${food.y * cellSize}px`;
                
                gameBoard.appendChild(foodElement);
            }
            
            // Move snake
            function moveSnake() {
                // Update direction
                direction = nextDirection;
                
                // Calculate new head position
                const head = { ...snake[0] };
                
                switch (direction) {
                    case 'up':
                        head.y -= 1;
                        break;
                    case 'down':
                        head.y += 1;
                        break;
                    case 'left':
                        head.x -= 1;
                        break;
                    case 'right':
                        head.x += 1;
                        break;
                }
                
                // Check collision with walls if enabled
                if (wallsEnabled && (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize)) {
                    gameOver();
                    return;
                }
                
                // Wrap around if walls are disabled
                if (!wallsEnabled) {
                    if (head.x < 0) head.x = gridSize - 1;
                    if (head.x >= gridSize) head.x = 0;
                    if (head.y < 0) head.y = gridSize - 1;
                    if (head.y >= gridSize) head.y = 0;
                }
                
                // Check collision with self
                for (let i = 0; i < snake.length; i++) {
                    if (head.x === snake[i].x && head.y === snake[i].y) {
                        gameOver();
                        return;
                    }
                }
                
                // Check collision with AI snake
                if (aiMode) {
                    for (let i = 0; i < aiSnake.length; i++) {
                        if (head.x === aiSnake[i].x && head.y === aiSnake[i].y) {
                            gameOver();
                            return;
                        }
                    }
                }
                
                // Check if food eaten
                const ateFood = head.x === food.x && head.y === food.y;
                
                // Add new head
                snake.unshift(head);
                
                // Remove food if eaten
                if (ateFood) {
                    // Remove food element
                    const foodElements = document.getElementsByClassName('food');
                    if (foodElements.length > 0) {
                        gameBoard.removeChild(foodElements[0]);
                    }
                    
                    // Update score
                    score += 10;
                    scoreValue.textContent = score;
                    
                    // Check and update high score
                    if (score > highScore) {
                        highScore = score;
                        highScoreValue.textContent = highScore;
                        localStorage.setItem('snakeHighScore', highScore);
                        
                        // Haptic feedback on mobile if available
                        if (navigator.vibrate) {
                            navigator.vibrate([100, 50, 100]);
                        }
                    }
                    
                    // Create new food
                    createFood();
                    
                    // Increase speed slightly (except in AI demo mode)
                    if (!aiMode && gameSpeed > 70) {
                        gameSpeed -= 2;
                        clearInterval(gameInterval);
                        gameInterval = setInterval(gameLoop, gameSpeed);
                    }
                } else {
                    // Remove tail
                    snake.pop();
                }
                
                // Render snake
                renderSnakes();
            }
            
            // Move AI snake
            function moveAISnake() {
                // Simple AI: move toward food
                const head = { ...aiSnake[0] };
                const dx = food.x - head.x;
                const dy = food.y - head.y;
                
                // Decide direction based on food position
                if (Math.abs(dx) > Math.abs(dy)) {
                    aiDirection = dx > 0 ? 'right' : 'left';
                } else {
                    aiDirection = dy > 0 ? 'down' : 'up';
                }
                
                // Avoid walls and self
                const nextPos = { ...head };
                switch (aiDirection) {
                    case 'up':
                        nextPos.y -= 1;
                        break;
                    case 'down':
                        nextPos.y += 1;
                        break;
                    case 'left':
                        nextPos.x -= 1;
                        break;
                    case 'right':
                        nextPos.x += 1;
                        break;
                }
                
                // Check if next position would cause collision
                let collision = false;
                
                // With walls
                if (nextPos.x < 0 || nextPos.x >= gridSize || nextPos.y < 0 || nextPos.y >= gridSize) {
                    collision = true;
                }
                
                // With self
                for (let i = 0; i < aiSnake.length; i++) {
                    if (nextPos.x === aiSnake[i].x && nextPos.y === aiSnake[i].y) {
                        collision = true;
                        break;
                    }
                }
                
                // With player snake
                for (let i = 0; i < snake.length; i++) {
                    if (nextPos.x === snake[i].x && nextPos.y === snake[i].y) {
                        collision = true;
                        break;
                    }
                }
                
                // If collision would happen, choose another direction
                if (collision) {
                    const directions = ['up', 'down', 'left', 'right'];
                    const safeDirections = directions.filter(dir => {
                        if (dir === aiDirection) return false;
                        
                        const testPos = { ...head };
                        switch (dir) {
                            case 'up':
                                testPos.y -= 1;
                                break;
                            case 'down':
                                testPos.y += 1;
                                break;
                            case 'left':
                                testPos.x -= 1;
                                break;
                            case 'right':
                                testPos.x += 1;
                                break;
                        }
                        
                        // Check walls
                        if (testPos.x < 0 || testPos.x >= gridSize || testPos.y < 0 || testPos.y >= gridSize) {
                            return false;
                        }
                        
                        // Check self
                        for (let i = 0; i < aiSnake.length; i++) {
                            if (testPos.x === aiSnake[i].x && testPos.y === aiSnake[i].y) {
                                return false;
                            }
                        }
                        
                        // Check player snake
                        for (let i = 0; i < snake.length; i++) {
                            if (testPos.x === snake[i].x && testPos.y === snake[i].y) {
                                return false;
                            }
                        }
                        
                        return true;
                    });
                    
                    if (safeDirections.length > 0) {
                        aiDirection = safeDirections[Math.floor(Math.random() * safeDirections.length)];
                    }
                }
                
                // Calculate new head position based on final direction
                const newHead = { ...head };
                switch (aiDirection) {
                    case 'up':
                        newHead.y -= 1;
                        break;
                    case 'down':
                        newHead.y += 1;
                        break;
                    case 'left':
                        newHead.x -= 1;
                        break;
                    case 'right':
                        newHead.x += 1;
                        break;
                }
                
                // Wrap around if needed
                if (newHead.x < 0) newHead.x = gridSize - 1;
                if (newHead.x >= gridSize) newHead.x = 0;
                if (newHead.y < 0) newHead.y = gridSize - 1;
                if (newHead.y >= gridSize) newHead.y = 0;
                z
                // Check if food eaten
                const ateFood = newHead.x === food.x && newHead.y === food.y;
                
                // Add new head
                aiSnake.unshift(newHead);
                
                // Remove food if eaten and create new
                if (ateFood) {
                    // Remove food element
                    const foodElements = document.getElementsByClassName('food');
                    if (foodElements.length > 0) {
                        gameBoard.removeChild(foodElements[0]);
                    }
                    
                    // Create new food
                    createFood();
                } else {
                    // Remove tail
                    aiSnake.pop();
                }
                
                // Render snakes
                renderSnakes();
            }
            
            // Render both snakes
            function renderSnakes() {
                // Remove all existing snake elements
                const snakeElements = document.querySelectorAll('.snake, .ai-snake');
                snakeElements.forEach(el => el.remove());
                
                // Create new player snake elements
                snake.forEach((segment, index) => {
                    const snakeElement = document.createElement('div');
                    snakeElement.style.width = `${cellSize}px`;
                    snakeElement.style.height = `${cellSize}px`;
                    snakeElement.style.left = `${segment.x * cellSize}px`;
                    snakeElement.style.top = `${segment.y * cellSize}px`;
                    snakeElement.classList.add('snake');
                    
                    if (index === 0) {
                        snakeElement.classList.add('snake-head');
                    }
                    
                    gameBoard.appendChild(snakeElement);
                });
                
                // Create new AI snake elements if in AI mode
                if (aiMode) {
                    aiSnake.forEach((segment, index) => {
                        const snakeElement = document.createElement('div');
                        snakeElement.style.width = `${cellSize}px`;
                        snakeElement.style.height = `${cellSize}px`;
                        snakeElement.style.left = `${segment.x * cellSize}px`;
                        snakeElement.style.top = `${segment.y * cellSize}px`;
                        snakeElement.classList.add('ai-snake');
                        
                        if (index === 0) {
                            snakeElement.classList.add('ai-snake-head');
                        }
                        
                        gameBoard.appendChild(snakeElement);
                    });
                }
            }
            
            // Game over
            function gameOver() {
                isGameOver = true;
                clearInterval(gameInterval);
                
                // Update final scores
                finalScoreValue.textContent = score;
                finalHighScoreValue.textContent = highScore;
                
                // Haptic feedback on mobile if available
                if (navigator.vibrate) {
                    navigator.vibrate(200);
                }
                
                // Show game over screen
                gameOverScreen.style.display = 'flex';
            }
            
            // Handle keyboard input
            document.addEventListener('keydown', (event) => {
                if (isGameOver && event.key === ' ') {
                    initGame();
                    return;
                }
                
                switch (event.key) {
                    case 'ArrowUp':
                    case 'w':
                    case 'W':
                        if (direction !== 'down') {
                            nextDirection = 'up';
                        }
                        break;
                    case 'ArrowDown':
                    case 's':
                    case 'S':
                        if (direction !== 'up') {
                            nextDirection = 'down';
                        }
                        break;
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        if (direction !== 'right') {
                            nextDirection = 'left';
                        }
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        if (direction !== 'left') {
                            nextDirection = 'right';
                        }
                        break;
                    case ' ':
                        togglePause();
                        break;
                    case 'p':
                    case 'P':
                        togglePause();
                        break;
                    case 'r':
                    case 'R':
                        initGame();
                        break;
                }
            });
            
            // Mobile touch controls
            gameBoard.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }, { passive: true });
            
            gameBoard.addEventListener('touchend', (e) => {
                if (!touchStartX || !touchStartY) return;
                
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                
                const dx = touchEndX - touchStartX;
                const dy = touchEndY - touchStartY;
                
                // Determine primary direction
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal swipe
                    if (dx > 0 && direction !== 'left') {
                        nextDirection = 'right';
                    } else if (dx < 0 && direction !== 'right') {
                        nextDirection = 'left';
                    }
                } else {
                    // Vertical swipe
                    if (dy > 0 && direction !== 'up') {
                        nextDirection = 'down';
                    } else if (dy < 0 && direction !== 'down') {
                        nextDirection = 'up';
                    }
                }
                
                touchStartX = 0;
                touchStartY = 0;
            }, { passive: true });
            
            // Mobile controls
            upBtn.addEventListener('click', () => {
                if (direction !== 'down') {
                    nextDirection = 'up';
                }
            });
            
            downBtn.addEventListener('click', () => {
                if (direction !== 'up') {
                    nextDirection = 'down';
                }
            });
            
            leftBtn.addEventListener('click', () => {
                if (direction !== 'right') {
                    nextDirection = 'left';
                }
            });
            
            rightBtn.addEventListener('click', () => {
                if (direction !== 'left') {
                    nextDirection = 'right';
                }
            });
            
            // Restart button
            restartBtn.addEventListener('click', initGame);
            
            // Play again button
            playAgainBtn.addEventListener('click', initGame);
            
            // Pause button
            pauseBtn.addEventListener('click', togglePause);
            
            // Theme toggle
            themeToggle.addEventListener('click', toggleTheme);
            
            // Difficulty buttons
            difficultyBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    difficultyBtns.forEach(b => b.classList.remove('active-difficulty'));
                    btn.classList.add('active-difficulty');
                    difficulty = btn.dataset.difficulty;
                    initGame();
                });
            });
            
            // Toggle pause state
            function togglePause() {
                if (isGameOver) return;
                
                isPaused = !isPaused;
                pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
                
                // Haptic feedback on mobile if available
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
            }
            
            // Toggle theme
            function toggleTheme() {
                const html = document.documentElement;
                if (html.getAttribute('data-theme') === 'light') {
                    html.setAttribute('data-theme', 'dark');
                    themeToggle.textContent = '🌓';
                } else {
                    html.setAttribute('data-theme', 'light');
                    themeToggle.textContent = '🌒';
                }
            }
            
            // Handle window resize
            window.addEventListener('resize', () => {
                clearInterval(gameInterval);
                initGame();
            });
            
            // Handle orientation change
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    clearInterval(gameInterval);
                    initGame();
                }, 100);
            });
            
            // Start the game
            initGame();
        });