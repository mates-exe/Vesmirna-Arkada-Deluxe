class Game {
    constructor() {
        try {
            // Setup canvas
            this.canvas = document.getElementById('game-canvas');
            if (!this.canvas) {
                throw new Error("Canvas element not found! Make sure the HTML contains a canvas with id 'game-canvas'");
            }
            
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            
            // Game state
            this.gameRunning = false;
            this.score = 0;
            this.isPaused = false;
            
            // Initialize game systems
            console.log("Initializing sound manager...");
            this.soundManager = new SoundManager();
            
            console.log("Initializing input handler...");
            this.input = new InputHandler();
            
            console.log("Initializing skin shop...");
            this.skinShop = new SkinShop(this);
            
            console.log("Initializing UI...");
            this.ui = new UI(this);
            
            // Set up resize event listener
            window.addEventListener('resize', () => this.resizeCanvas());
            
            // Set up pause functionality
            this.input.onKeyReleased('KeyP', () => {
                if (this.gameRunning) {
                    this.togglePause();
                }
            });
            
            console.log("Game initialization complete!");
        } catch (error) {
            console.error("Error during game initialization:", error);
            this.showErrorMessage("Chyba při inicializaci hry: " + error.message);
        }
    }
    
    showErrorMessage(message) {
        // Vytvořit elementu pro zobrazení chyby, i když HTML/CSS nefunguje
        const errorBox = document.createElement('div');
        errorBox.style.position = 'absolute';
        errorBox.style.top = '50%';
        errorBox.style.left = '50%';
        errorBox.style.transform = 'translate(-50%, -50%)';
        errorBox.style.background = 'rgba(0, 0, 0, 0.8)';
        errorBox.style.color = '#ff3333';
        errorBox.style.padding = '20px';
        errorBox.style.borderRadius = '10px';
        errorBox.style.border = '2px solid #ff3333';
        errorBox.style.fontFamily = 'Arial, sans-serif';
        errorBox.style.zIndex = '9999';
        errorBox.style.maxWidth = '80%';
        
        errorBox.innerHTML = `
            <h3 style="color: #ff5555; margin-top: 0;">Chyba při spuštění hry</h3>
            <p>${message}</p>
            <p>Zkontrolujte konzoli prohlížeče (F12) pro více detailů.</p>
        `;
        
        document.body.appendChild(errorBox);
    }
    
    resizeCanvas() {
        // Use a fixed game size with aspect ratio
        const gameWidth = 600;
        const gameHeight = 800;
        
        // Scale to fit window while maintaining aspect ratio
        const scale = Math.min(
            window.innerWidth / gameWidth,
            window.innerHeight / gameHeight
        ) * 0.95; // 95% of max possible size
        
        this.canvas.width = gameWidth;
        this.canvas.height = gameHeight;
        
        // Apply scale transform to canvas element
        this.canvas.style.width = `${gameWidth * scale}px`;
        this.canvas.style.height = `${gameHeight * scale}px`;
    }
    
    startGame() {
        try {
            console.log("Starting game...");
            // Reset game state
            this.score = 0;
            this.gameRunning = true;
            this.isPaused = false;
            
            // Debug mode
            this.debug = false;
            this.fpsCounter = document.createElement('div');
            this.setupDebugTools();
            
            // Postupné vytváření herních objektů s ošetřením chyb
            this.initializeGameObjects()
                .then(() => {
                    // Úspěšné vytvoření - spustit herní smyčku
                    console.log("All game objects initialized successfully!");
                    
                    // Create initial controls hint
                    this.effects.createNotification(
                        "H: Použít lékárničku", 
                        this.canvas.width / 2, 
                        this.canvas.height - 50
                    );
                    
                    // Start music (volitelně - chytej chyby, aby hra fungovala i bez zvuků)
                    try {
                        this.soundManager.playSound('music');
                    } catch (e) {
                        console.warn("Could not play music, but the game will continue:", e);
                    }
                    
                    // Show game UI
                    this.ui.showMenu('gameUI');
                    
                    // Start game loop
                    console.log("Starting game loop");
                    this.lastTime = 0;
                    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
                })
                .catch(error => {
                    console.error("Error initializing game objects:", error);
                    this.showErrorMessage("Chyba při inicializaci herních objektů: " + error.message);
                });
        } catch (error) {
            console.error("Error starting game:", error);
            this.showErrorMessage("Chyba při spuštění hry: " + error.message);
        }
    }
    
    async initializeGameObjects() {
        try {
            // Postupná inicializace objektů s kontrolami
            console.log("Creating player...");
            this.player = new Player(this, this.canvas.width / 2 - 20, this.canvas.height - 100);
            if (!this.player) throw new Error("Player initialization failed");
            
            console.log("Setting up effects...");
            this.effects = new EffectsManager(this);
            if (!this.effects) throw new Error("Effects initialization failed");
            
            console.log("Setting up weapons...");
            // Kontrola, že player má vlastnost weapons
            if (!this.player.weapons) {
                throw new Error("Player weapons not initialized");
            }
            this.weapons = this.player.weapons;
            
            console.log("Setting up powerups...");
            this.powerups = new PowerupManager(this);
            if (!this.powerups) throw new Error("Powerups initialization failed");
            
            console.log("Setting up enemies...");
            this.enemies = new EnemyManager(this);
            if (!this.enemies) throw new Error("Enemies initialization failed");
            
            return Promise.resolve(); // Vše úspěšné
        } catch (error) {
            return Promise.reject(error); // Propaguj chybu nahoru
        }
    }
    
    setupDebugTools() {
        // Add FPS counter for debugging
        this.fpsCounter.style.position = 'absolute';
        this.fpsCounter.style.top = '10px';
        this.fpsCounter.style.left = '10px';
        this.fpsCounter.style.color = 'lime';
        this.fpsCounter.style.fontFamily = 'monospace';
        this.fpsCounter.style.zIndex = '9999';
        this.fpsCounter.style.display = 'none';
        document.body.appendChild(this.fpsCounter);
        
        // Debug mode toggle
        window.addEventListener('keydown', (e) => {
            if (e.code === 'F10') { // F10 key toggles debug mode
                this.debug = !this.debug;
                this.fpsCounter.style.display = this.debug ? 'block' : 'none';
                console.log("Debug mode:", this.debug ? "ON" : "OFF");
                
                if (this.debug) {
                    // Dump game state for debugging
                    console.log("Game state:", {
                        player: this.player,
                        enemies: this.enemies,
                        weapons: this.weapons,
                        powerups: this.powerups,
                        effects: this.effects
                    });
                }
            }
        });
    }
    
    gameLoop(timestamp) {
        try {
            // Calculate delta time
            const deltaTime = timestamp - (this.lastTime || timestamp);
            this.lastTime = timestamp;
            
            // Calculate FPS
            if (this.debug) {
                const fps = Math.round(1000 / deltaTime);
                this.fpsCounter.textContent = `FPS: ${fps}`;
            }
            
            // Check if game is paused
            if (!this.isPaused) {
                // Update game state
                this.update(deltaTime);
            }
            
            // Render game
            this.render();
            
            // Continue game loop if game is running
            if (this.gameRunning) {
                requestAnimationFrame((ts) => this.gameLoop(ts));
            }
        } catch (error) {
            console.error("Error in game loop:", error);
            this.gameRunning = false;
            this.showErrorMessage("Chyba v herním cyklu: " + error.message);
            
            // Detailnější informace pro debugging
            if (error.stack) {
                console.error("Stack trace:", error.stack);
            }
        }
    }
    
    update(deltaTime) {
        try {
            // Update game systems with error handling for each component
            if (this.player) this.player.update(deltaTime);
            if (this.weapons) this.weapons.update(deltaTime);
            if (this.powerups) this.powerups.update(deltaTime);
            if (this.enemies) this.enemies.update(deltaTime);
            if (this.effects) this.effects.update(deltaTime);
            if (this.ui) this.ui.update(deltaTime);
            
            // Reset input state for next frame
            this.input.resetKeys();
        } catch (error) {
            throw new Error(`Update cycle error: ${error.message}`);
        }
    }
    
    render() {
        try {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw background effects
            if (this.effects) this.effects.draw(this.ctx);
            
            // Draw game objects
            if (this.powerups) this.powerups.draw(this.ctx);
            if (this.enemies) this.enemies.draw(this.ctx);
            if (this.player) this.player.draw(this.ctx);
            if (this.weapons) this.weapons.draw(this.ctx);
            
            // Debug rendering
            if (this.debug) {
                this.renderDebugInfo();
            }
        } catch (error) {
            throw new Error(`Render error: ${error.message}`);
        }
    }
    
    renderDebugInfo() {
        // Debug overlay
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(0, 0, 200, 120);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Enemies: ${this.enemies ? this.enemies.enemies.length : 'N/A'}`, 10, 20);
        this.ctx.fillText(`Wave: ${this.enemies ? this.enemies.currentWave : 'N/A'}`, 10, 40);
        this.ctx.fillText(`Player Health: ${this.player ? this.player.health : 'N/A'}`, 10, 60);
        this.ctx.fillText(`Bullets: ${this.weapons ? this.weapons.bullets.length : 'N/A'}`, 10, 80);
        this.ctx.fillText(`Enemy Bullets: ${this.weapons ? this.weapons.enemyBullets.length : 'N/A'}`, 10, 100);
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            // Show pause notification
            this.effects.createNotification("PAUSE", this.canvas.width / 2, this.canvas.height / 2);
            this.soundManager.stopSound('music');
        } else {
            this.soundManager.playSound('music');
        }
    }
    
    gameOver() {
        // Stop game loop
        this.gameRunning = false;
        
        // Play game over sound
        this.soundManager.stopSound('music');
        this.soundManager.playSound('gameOver');
        
        // Show game over screen
        this.ui.showGameOver();
        
        // Add points for progress
        if (this.skinShop) {
            // Base points for the game
            const basePoints = this.score / 10;
            
            // Bonus for highest wave
            const bonusPoints = this.skinShop.updateHighestWave(this.enemies.currentWave);
            
            this.skinShop.addPoints(Math.floor(basePoints));
            
            if (bonusPoints > 0) {
                // Create notification for new record
                const element = document.createElement('p');
                element.className = 'wave-bonus';
                element.textContent = `Nový rekord! +${bonusPoints} bodů`;
                document.getElementById('game-over').appendChild(element);
            }
        }
    }
}
