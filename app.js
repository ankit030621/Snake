document.addEventListener('DOMContentLoaded', () => {
            // Game settings
            const gameBoard = document.getElementById('game-board');
            const scoreValue = document.getElementById('score-value');
            const finalScoreValue = document.getElementById('final-score-value');
            const gameOverScreen = document.getElementById('game-over-screen');
            const restartBtn = document.getElementById('restart-btn');
            const pauseBtn = document.getElementById('pause-btn');
            const playAgainBtn = document.getElementById('play-again-btn');
            
            // Mobile controls
            const upBtn = document.getElementById('up-btn');
            const downBtn = document.getElementById('down-btn');
            const leftBtn = document.getElementById('left-btn');
            const rightBtn = document.getElementById('right-btn');
            
            let gridSize = 20; // Number of cells in each row/column
            let cellSize;
            let snake = [];
            let food = {};
            let direction = 'right';
            let nextDirection = 'right';
            let gameSpeed = 150; // milliseconds
            let gameInterval;
            let score = 0;
            let isPaused = false;
            let isGameOver = false;
            
            // Initialize game
            function initGame() {
                // Reset game state
                snake = [];
                direction = 'right';
                nextDirection = 'right';
                score = 0;
                isPaused = false;
                isGameOver = false;
                scoreValue.textContent = '0';
                
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
                
                // Render initial snake
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
                
                createFood();
                
                if (gameInterval) {
                    clearInterval(gameInterval);
                }
                
                gameInterval = setInterval(moveSnake, gameSpeed);
                
                // Hide game over screen
                gameOverScreen.style.display = 'none';
                pauseBtn.textContent = 'Pause';
            }
            
            // Create food at random position
            function createFood() {
                let foodX, foodY;
                let validPosition = false;
                
                while (!validPosition) {
                    foodX = Math.floor(Math.random() * gridSize);
                    foodY = Math.floor(Math.random() * gridSize);
                    
                    // Check if position is not on snake
                    validPosition = true;
                    for (let segment of snake) {
                        if (segment.x === foodX && segment.y === foodY) {
                            validPosition = false;
                            break;
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
                if (isPaused || isGameOver) return;
                
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
                
                // Check collision with walls
                if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
                    gameOver();
                    return;
                }
                
                // Check collision with self
                for (let i = 0; i < snake.length; i++) {
                    if (head.x === snake[i].x && head.y === snake[i].y) {
                        gameOver();
                        return;
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
                    
                    // Create new food
                    createFood();
                    
                    // Increase speed slightly
                    if (gameSpeed > 70) {
                        gameSpeed -= 2;
                        clearInterval(gameInterval);
                        gameInterval = setInterval(moveSnake, gameSpeed);
                    }
                } else {
                    // Remove tail
                    snake.pop();
                }
                
                // Render snake
                updateSnakeElements();
            }
            
            // Update snake elements on the board
            function updateSnakeElements() {
                // Remove all existing snake elements
                const snakeElements = document.getElementsByClassName('snake');
                while (snakeElements.length > 0) {
                    gameBoard.removeChild(snakeElements[0]);
                }
                
                // Create new snake elements
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
            }
            
            // Game over
            function gameOver() {
                isGameOver = true;
                clearInterval(gameInterval);
                
                // Update final score
                finalScoreValue.textContent = score;
                
                // Show game over screen
                gameOverScreen.style.display = 'flex';
            }
            
            // Handle keyboard input
            document.addEventListener('keydown', (event) => {
                switch (event.key) {
                    case 'ArrowUp':
                        if (direction !== 'down') {
                            nextDirection = 'up';
                        }
                        break;
                    case 'ArrowDown':
                        if (direction !== 'up') {
                            nextDirection = 'down';
                        }
                        break;
                    case 'ArrowLeft':
                        if (direction !== 'right') {
                            nextDirection = 'left';
                        }
                        break;
                    case 'ArrowRight':
                        if (direction !== 'left') {
                            nextDirection = 'right';
                        }
                        break;
                    case ' ':
                        togglePause();
                        break;
                }
            });
            
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
            
            // Toggle pause state
            function togglePause() {
                if (isGameOver) return;
                
                isPaused = !isPaused;
                pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
            }
            
            // Handle window resize
            window.addEventListener('resize', () => {
                clearInterval(gameInterval);
                initGame();
            });
            
            // Start the game
            initGame();
        });