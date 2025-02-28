class UI {
    constructor(game) {
        this.game = game;
        this.elements = {
            mainMenu: document.getElementById('main-menu'),
            controlsMenu: document.getElementById('controls-menu'),
            gameOver: document.getElementById('game-over'),
            gameUI: document.getElementById('game-ui'),
            scoreDisplay: document.getElementById('score-display'),
            livesDisplay: document.getElementById('lives-display'),
            waveDisplay: document.getElementById('wave-display'),
            ultimateMeter: document.getElementById('ultimate-meter'),
            activePowerups: document.getElementById('active-powerups'),
            finalScore: document.getElementById('final-score'),
            finalWave: document.getElementById('final-wave'),
            
            // Add health bar element
            healthBar: document.createElement('div'),
            healthBarInner: document.createElement('div'),
            healItems: document.createElement('div')
        };
        
        this.buttons = {
            startGame: document.getElementById('start-game'),
            showControls: document.getElementById('show-controls'),
            backButton: document.getElementById('back-button'),
            restartButton: document.getElementById('restart-button'),
            menuButton: document.getElementById('menu-button')
        };
        
        this.setupEventListeners();
        
        // Create and add health bar to UI
        this.elements.healthBar.className = 'health-bar';
        this.elements.healthBarInner.className = 'health-bar-inner';
        this.elements.healthBar.appendChild(this.elements.healthBarInner);
        
        this.elements.healItems.className = 'heal-items';
        
        document.getElementById('game-ui').appendChild(this.elements.healthBar);
        document.getElementById('game-ui').appendChild(this.elements.healItems);
    }
    
    setupEventListeners() {
        this.buttons.startGame.addEventListener('click', () => {
            this.game.startGame();
        });
        
        this.buttons.showControls.addEventListener('click', () => {
            this.showMenu('controlsMenu');
        });
        
        this.buttons.backButton.addEventListener('click', () => {
            this.showMenu('mainMenu');
        });
        
        this.buttons.restartButton.addEventListener('click', () => {
            this.game.startGame();
        });
        
        this.buttons.menuButton.addEventListener('click', () => {
            this.showMenu('mainMenu');
        });
    }
    
    showMenu(menuName) {
        // Hide all menus
        this.elements.mainMenu.classList.add('hidden');
        this.elements.controlsMenu.classList.add('hidden');
        this.elements.gameOver.classList.add('hidden');
        this.elements.gameUI.classList.add('hidden');
        
        // Show the requested menu
        if (menuName === 'mainMenu') {
            this.elements.mainMenu.classList.remove('hidden');
        } else if (menuName === 'controlsMenu') {
            this.elements.controlsMenu.classList.remove('hidden');
        } else if (menuName === 'gameOver') {
            this.elements.gameOver.classList.remove('hidden');
        } else if (menuName === 'gameUI') {
            this.elements.gameUI.classList.remove('hidden');
        }
    }
    
    update() {
        const { player, enemies, score } = this.game;
        
        // Update score
        this.elements.scoreDisplay.textContent = `Skóre: ${score}`;
        
        // Update health percentage instead of lives
        const healthPercentage = Math.floor((player.health / player.maxHealth) * 100);
        this.elements.livesDisplay.textContent = `Zdraví: ${healthPercentage}%`;
        
        // Update wave
        const currentWave = this.game.enemies.currentWave;
        this.elements.waveDisplay.textContent = `Vlna: ${currentWave}`;
        
        // Update ultimate meter
        const ultimatePercentage = Math.floor((player.ultimateCharge / player.maxUltimateCharge) * 100);
        this.elements.ultimateMeter.textContent = `Ultimátka: ${ultimatePercentage}%`;
        this.elements.ultimateMeter.style.setProperty('--percentage', `${ultimatePercentage}%`);
        
        // Update active powerups
        this.updatePowerupIndicators();
        
        // Update health bar
        const healthBarPercentage = player.health / player.maxHealth * 100;
        this.elements.healthBarInner.style.width = `${healthBarPercentage}%`;
        
        if (healthBarPercentage > 60) {
            this.elements.healthBarInner.style.backgroundColor = '#33cc33';
        } else if (healthBarPercentage > 30) {
            this.elements.healthBarInner.style.backgroundColor = '#ffcc00';
        } else {
            this.elements.healthBarInner.style.backgroundColor = '#ff3333';
        }
        
        // Update heal items display
        this.updateHealItemsDisplay();
    }
    
    updatePowerupIndicators() {
        const { shield, boost } = this.game.player.powerups;
        this.elements.activePowerups.innerHTML = '';
        
        if (shield > 0) {
            this.createPowerupIndicator('S', '#3399ff');
        }
        
        if (boost > 0) {
            this.createPowerupIndicator('B', '#ff9900');
        }
        
        // Display weapon type
        const weaponType = this.game.player.weaponType;
        const weaponLevel = this.game.player.weaponLevel;
        
        let weaponSymbol = 'W';
        let weaponColor = '#ffcc00';
        
        if (weaponType === 'laser') {
            weaponSymbol = 'L';
            weaponColor = '#cc33ff';
        } else if (weaponType === 'spread') {
            weaponSymbol = 'M';
            weaponColor = '#00ffcc';
        }
        
        this.createPowerupIndicator(weaponSymbol + weaponLevel, weaponColor);
    }
    
    createPowerupIndicator(symbol, color) {
        const indicator = document.createElement('div');
        indicator.className = 'power-up-indicator';
        indicator.style.backgroundColor = color;
        indicator.textContent = symbol;
        this.elements.activePowerups.appendChild(indicator);
    }
    
    updateHealItemsDisplay() {
        if (!this.game.player) return;
        
        this.elements.healItems.innerHTML = '';
        for (let i = 0; i < this.game.player.storedHealItems; i++) {
            const healIcon = document.createElement('div');
            healIcon.className = 'heal-icon';
            healIcon.innerHTML = '+';
            this.elements.healItems.appendChild(healIcon);
        }
        
        // Show empty slots
        for (let i = this.game.player.storedHealItems; i < this.game.player.maxStoredHealItems; i++) {
            const emptyIcon = document.createElement('div');
            emptyIcon.className = 'heal-icon empty';
            this.elements.healItems.appendChild(emptyIcon);
        }
    }
    
    showGameOver() {
        this.elements.finalScore.textContent = `Skóre: ${this.game.score}`;
        this.elements.finalWave.textContent = `Vlna: ${this.game.enemies.currentWave}`;
        this.showMenu('gameOver');
    }
}