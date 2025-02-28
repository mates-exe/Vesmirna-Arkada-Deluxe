class Player {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 5;
        
        // Get current skin (need to do this first to get health stats)
        this.applySkin();
        
        // Health system
        this.health = this.maxHealth; // Health is now set by skin
        this.healthRegenRate = this.baseHealthRegenRate; // Regeneration rate is now set by skin
        this.storedHealItems = 0;
        this.maxStoredHealItems = 3;
        this.healItemAmount = 30;
        
        this.invincible = false;
        this.invincibilityTime = 0;
        this.maxInvincibilityTime = 120; // 2 seconds at 60fps
        this.blinkInterval = 15; // blink every 15 frames
        this.ultimateMode = false; // Flag to track if ultimate ability is active
        
        // Weapon properties
        this.weaponType = 'standard';
        this.weaponLevel = 1;
        this.shootDelay = 0;
        this.shootCooldown = this.baseShootCooldown;
        this.autoShoot = false;
        
        // Special abilities
        this.dashActive = false;
        this.dashCooldown = 0;
        this.maxDashCooldown = 180;
        this.dashDuration = 0;
        this.maxDashDuration = this.baseMaxDashDuration;
        this.dashSpeed = 15;
        
        // Ultimate ability
        this.ultimateCharge = 0;
        this.maxUltimateCharge = 100;
        this.ultimateActive = false;
        this.ultimateDuration = 0;
        this.maxUltimateDuration = 300;
        
        // Power-ups
        this.powerups = {
            shield: 0,
            boost: 0
        };
        
        // Initialize weapons manager
        this.weapons = new WeaponManager(this);
    }
    
    applySkin() {
        // Default/base values
        this.baseMaxHealth = 100;
        this.baseHealthRegenRate = 5;
        this.baseShootCooldown = 15;
        this.baseMaxDashDuration = 20;
        this.ultimateChargeMultiplier = 1;
        this.weaponPowerMultiplier = 1;
        this.damageReduction = 0; // New property - % of damage reduced
        this.color = '#5ff';
        this.thrusterColor = '#f70';
        this.specialShape = null;
        
        // Get current skin if skin shop exists
        if (this.game.skinShop) {
            const skin = this.game.skinShop.getCurrentSkin();
            if (skin) {
                this.color = skin.colors.primary;
                this.thrusterColor = skin.colors.thruster;
                this.specialShape = skin.specialShape;
                
                // Apply special effects based on skin properties
                this.baseMaxHealth = skin.health || this.baseMaxHealth;
                this.baseHealthRegenRate = skin.healthRegen || this.baseHealthRegenRate;
                this.baseShootCooldown = skin.shootCooldown || this.baseShootCooldown;
                this.baseMaxDashDuration = skin.dashDuration || this.baseMaxDashDuration;
                this.ultimateChargeMultiplier = skin.ultimateCharge || this.ultimateChargeMultiplier;
                this.weaponPowerMultiplier = skin.weaponPower || this.weaponPowerMultiplier;
                this.damageReduction = skin.damageReduction || 0;
            }
        }
        
        // Set derived properties
        this.maxHealth = this.baseMaxHealth;
    }
    
    update() {
        this.handleMovement();
        this.handleShooting();
        this.handleSpecialAbilities();
        this.updatePowerups();
        this.updateInvincibility();
    }
    
    handleMovement() {
        let dx = this.game.input.getHorizontalMovement();
        let dy = this.game.input.getVerticalMovement();
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            const normalized = Utils.normalize(dx, dy);
            dx = normalized.x;
            dy = normalized.y;
        }
        
        let currentSpeed = this.speed;
        
        // Apply boost if active
        if (this.powerups.boost > 0 && this.game.input.isKeyDown('Space')) {
            currentSpeed *= 1.7;
        }
        
        // Apply dash if active
        if (this.dashActive) {
            currentSpeed = this.dashSpeed;
        }
        
        // Move player
        this.x += dx * currentSpeed;
        this.y += dy * currentSpeed;
        
        // Keep player within canvas bounds
        this.x = Math.max(0, Math.min(this.x, this.game.canvas.width - this.width));
        this.y = Math.max(0, Math.min(this.y, this.game.canvas.height - this.height));
    }
    
    handleShooting() {
        // Manual shooting with spacebar
        if (this.game.input.isKeyDown('Space') && !this.game.input.isShiftDown() && this.shootDelay <= 0) {
            this.shoot();
            this.shootDelay = this.shootCooldown;
        }
        
        // Auto shooting with CTRL
        if (this.game.input.isKeyDown('ControlLeft') || this.game.input.isKeyDown('ControlRight')) {
            this.autoShoot = true;
            if (this.shootDelay <= 0) {
                this.shoot();
                this.shootDelay = this.shootCooldown;
            }
        } else {
            this.autoShoot = false;
        }
        
        // Decrement shoot delay
        if (this.shootDelay > 0) {
            this.shootDelay--;
        }
    }
    
    handleSpecialAbilities() {
        // Dash ability (SHIFT + direction)
        if (this.game.input.isShiftDown() && this.dashCooldown <= 0 && 
            (this.game.input.getHorizontalMovement() !== 0 || this.game.input.getVerticalMovement() !== 0)) {
            this.activateDash();
        }
        
        // Update dash state
        if (this.dashActive) {
            this.dashDuration++;
            if (this.dashDuration >= this.maxDashDuration) {
                this.dashActive = false;
                this.dashDuration = 0;
                this.dashCooldown = this.maxDashCooldown;
                this.invincible = false;
            }
        }
        
        // Decrement dash cooldown
        if (this.dashCooldown > 0) {
            this.dashCooldown--;
        }
        
        // Ultimate ability (Q key)
        if (this.game.input.wasKeyPressed('KeyQ') && this.ultimateCharge >= this.maxUltimateCharge) {
            this.activateUltimate();
        }
        
        // Update ultimate ability
        if (this.ultimateActive) {
            this.ultimateDuration++;
            if (this.ultimateDuration % 15 === 0) {
                this.weapons.fireUltimate();
            }
            
            if (this.ultimateDuration >= this.maxUltimateDuration) {
                this.ultimateActive = false;
                this.ultimateMode = false;
                this.ultimateDuration = 0;
                this.ultimateCharge = 0;
                this.invincible = false;
            }
        }
        
        // Use heal item with H key
        if (this.game.input.wasKeyPressed('KeyH')) {
            this.useHealItem();
        }
    }
    
    updatePowerups() {
        // Decrement shield duration
        if (this.powerups.shield > 0) {
            this.powerups.shield--;
        }
        
        // Decrement boost duration
        if (this.powerups.boost > 0) {
            this.powerups.boost--;
        }
    }
    
    updateInvincibility() {
        if (this.invincible && !this.dashActive && !this.ultimateActive) {
            this.invincibilityTime++;
            if (this.invincibilityTime >= this.maxInvincibilityTime) {
                this.invincible = false;
                this.invincibilityTime = 0;
            }
        }
    }
    
    shoot() {
        this.weapons.fire();
        this.game.soundManager.playSound('shoot');
    }
    
    activateDash() {
        this.dashActive = true;
        this.invincible = true;
        this.game.soundManager.playSound('dash');
        this.game.effects.createDashEffect(this.x + this.width/2, this.y + this.height/2);
    }
    
    activateUltimate() {
        this.ultimateActive = true;
        this.ultimateMode = true; // Flag to track ultimate mode
        this.invincible = true;
        this.game.soundManager.playSound('ultimate');
        this.game.effects.createUltimateEffect(this.x + this.width/2, this.y + this.height/2);
    }
    
    takeDamage() {
        if (this.invincible || this.powerups.shield > 0) return;
        
        // Apply damage reduction from ship property
        let damage = 20;
        if (this.damageReduction > 0) {
            damage = Math.floor(damage * (1 - this.damageReduction));
        }
        
        // Apply damage to health
        this.health -= damage;
        this.invincible = true;
        this.game.soundManager.playSound('hit');
        this.game.effects.createExplosionEffect(this.x + this.width/2, this.y + this.height/2, 'small');
        
        // Game over if health depleted
        if (this.health <= 0) {
            this.game.effects.createExplosionEffect(this.x + this.width/2, this.y + this.height/2, 'large');
            this.game.soundManager.playSound('explode');
            setTimeout(() => this.game.gameOver(), 500); // Small delay for explosion effect
        }
    }
    
    addUltimateCharge(amount) {
        // Apply skin multiplier if available
        amount = amount * (this.ultimateChargeMultiplier || 1);
        this.ultimateCharge = Math.min(this.ultimateCharge + amount, this.maxUltimateCharge);
    }
    
    upgradeWeapon() {
        if (this.weaponLevel < 3) {
            this.weaponLevel++;
        }
        this.game.soundManager.playSound('powerup');
    }
    
    setWeaponType(type) {
        this.weaponType = type;
        this.game.soundManager.playSound('powerup');
    }
    
    addPowerup(type) {
        switch(type) {
            case 'shield':
                this.powerups.shield = 600; // 10 seconds
                break;
            case 'boost':
                this.powerups.boost = 600; // 10 seconds
                break;
            case 'life':
                this.lives = Math.min(this.lives + 1, 5);
                break;
            case 'laser':
                this.setWeaponType('laser');
                break;
            case 'spread':
                this.setWeaponType('spread');
                break;
            case 'weapon':
                this.upgradeWeapon();
                break;
            case 'heal':
                if (this.addHealItem()) {
                    this.game.soundManager.playSound('powerup');
                } else if (this.health < this.maxHealth) {
                    // If can't store more heal items, use immediately
                    this.health = Math.min(this.maxHealth, this.health + this.healItemAmount);
                    this.game.effects.createHealEffect(this.x + this.width/2, this.y + this.height/2);
                    this.game.soundManager.playSound('heal');
                }
                break;
        }
        this.game.soundManager.playSound('powerup');
    }
    
    addHealItem() {
        if (this.storedHealItems < this.maxStoredHealItems) {
            this.storedHealItems++;
            this.game.ui.updateHealItemsDisplay();
            this.game.effects.createNotification("+1 Lékárnička!", 
                this.x + this.width/2, this.y - 20);
            return true;
        }
        return false;
    }
    
    useHealItem() {
        if (this.storedHealItems > 0 && this.health < this.maxHealth) {
            this.storedHealItems--;
            this.health = Math.min(this.maxHealth, this.health + this.healItemAmount);
            this.game.effects.createHealEffect(this.x + this.width/2, this.y + this.height/2);
            this.game.soundManager.playSound('heal');
            this.game.ui.updateHealItemsDisplay();
            return true;
        }
        return false;
    }
    
    regenerateHealthBetweenWaves() {
        const previousHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + this.healthRegenRate);
        
        if (this.health > previousHealth) {
            this.game.effects.createHealEffect(this.x + this.width/2, this.y + this.height/2, 'small');
        }
    }
    
    draw(ctx) {
        // Upravený efekt blikání při zásahu - loď zčervená a změní průhlednost místo zmizení
        let hitEffect = false;
        
        if (this.invincible && !this.ultimateMode && Math.floor(this.invincibilityTime / this.blinkInterval) % 2 === 0) {
            ctx.globalAlpha = 0.5;  // Průhlednost místo úplného zmizení
            hitEffect = true;  // Označit, že jsme v efektu zásahu
        }
        
        // Draw thruster flames with advanced effects
        this.drawThrusters(ctx);
        
        // Draw ship body based on special shape or default
        if (hitEffect) {
            // Použít červenou barvu při efektu zásahu
            ctx.fillStyle = '#ff3333';
        } else {
            ctx.fillStyle = this.color;
        }
        
        if (this.specialShape === 'phoenix') {
            this.drawPhoenixShip(ctx, hitEffect);
        } else if (this.specialShape === 'blade') {
            this.drawBladeShip(ctx, hitEffect);
        } else {
            this.drawDefaultShip(ctx, hitEffect);
        }
        
        // Draw effects like shields, ultimates, etc.
        this.drawEffects(ctx);
        
        // Draw health bar
        this.drawHealthBar(ctx);
        
        // Resetovat průhlednost pro zbytek vykreslování
        ctx.globalAlpha = 1.0;
    }
    
    drawDefaultShip(ctx, hitEffect) {
        // Create a fighter-like spaceship instead of a simple triangle
        ctx.save();
        
        // Shadow for depth
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        
        // Main body
        ctx.beginPath();
        // Nose of the ship
        ctx.moveTo(this.x + this.width / 2, this.y);
        // Right body curve
        ctx.bezierCurveTo(
            this.x + this.width * 0.8, this.y + this.height * 0.3,
            this.x + this.width * 0.9, this.y + this.height * 0.7,
            this.x + this.width * 0.7, this.y + this.height
        );
        // Bottom edge 
        ctx.lineTo(this.x + this.width * 0.3, this.y + this.height);
        // Left body curve
        ctx.bezierCurveTo(
            this.x + this.width * 0.1, this.y + this.height * 0.7,
            this.x + this.width * 0.2, this.y + this.height * 0.3,
            this.x + this.width / 2, this.y
        );
        ctx.closePath();
        ctx.fill();
        
        // Cockpit/Windshield - změněno na červenou při zásahu
        if (hitEffect) {
            ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        } else {
            ctx.fillStyle = 'rgba(150, 230, 240, 0.8)';
        }
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width / 2, 
            this.y + this.height * 0.3,
            this.width * 0.15,
            this.height * 0.15,
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Křídla - použít barvu trupu nebo červenou při zásahu
        if (hitEffect) {
            ctx.fillStyle = '#ff3333';
        } else {
            ctx.fillStyle = this.color;
        }
        
        // Left wing
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.3, this.y + this.height * 0.5);
        ctx.lineTo(this.x - this.width * 0.2, this.y + this.height * 0.7);
        ctx.lineTo(this.x + this.width * 0.2, this.y + this.height * 0.8);
        ctx.lineTo(this.x + this.width * 0.3, this.y + this.height * 0.7);
        ctx.closePath();
        ctx.fill();
        
        // Right wing
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.7, this.y + this.height * 0.5);
        ctx.lineTo(this.x + this.width * 1.2, this.y + this.height * 0.7);
        ctx.lineTo(this.x + this.width * 0.8, this.y + this.height * 0.8);
        ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.7);
        ctx.closePath();
        ctx.fill();
        
        // Engine glow
        const engineGlow = ctx.createLinearGradient(
            this.x + this.width / 2, this.y + this.height * 0.7,
            this.x + this.width / 2, this.y + this.height
        );
        engineGlow.addColorStop(0, 'rgba(255, 100, 0, 0.3)');
        engineGlow.addColorStop(1, 'rgba(255, 200, 0, 0)');
        
        ctx.fillStyle = engineGlow;
        ctx.beginPath();
        ctx.rect(
            this.x + this.width * 0.3, 
            this.y + this.height * 0.7,
            this.width * 0.4,
            this.height * 0.3
        );
        ctx.fill();
        
        // Details - hull lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        
        // Center line
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height * 0.4);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height * 0.9);
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawPhoenixShip(ctx, hitEffect) {
        ctx.save();
        
        // Shadow for depth
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 100, 0, 0.5)';
        
        // Phoenix body
        ctx.beginPath();
        // Main body shape - head to tail
        ctx.moveTo(this.x + this.width * 0.5, this.y); // Top/head
        
        // Right side
        ctx.bezierCurveTo(
            this.x + this.width * 0.8, this.y + this.height * 0.2,
            this.x + this.width + 10, this.y + this.height * 0.4,
            this.x + this.width * 0.9, this.y + this.height * 0.7
        );
        // Bottom/tail
        ctx.quadraticCurveTo(
            this.x + this.width * 0.75, this.y + this.height,
            this.x + this.width * 0.5, this.y + this.height * 0.85
        );
        
        // Left side
        ctx.quadraticCurveTo(
            this.x + this.width * 0.25, this.y + this.height,
            this.x + this.width * 0.1, this.y + this.height * 0.7
        );
        ctx.bezierCurveTo(
            this.x - 10, this.y + this.height * 0.4,
            this.x + this.width * 0.2, this.y + this.height * 0.2,
            this.x + this.width * 0.5, this.y
        );
        
        ctx.closePath();
        ctx.fill();
        
        // Phoenix head/face details
        const headCenter = {
            x: this.x + this.width * 0.5,
            y: this.y + this.height * 0.25
        };
        
        // Phoenix "eye"
        const eyeGradient = ctx.createRadialGradient(
            headCenter.x, headCenter.y, 1,
            headCenter.x, headCenter.y, 7
        );
        eyeGradient.addColorStop(0, 'white');
        eyeGradient.addColorStop(0.6, this.thrusterColor);
        eyeGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        
        ctx.fillStyle = eyeGradient;
        ctx.beginPath();
        ctx.arc(headCenter.x, headCenter.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Phoenix wing pattern details
        ctx.strokeStyle = 'rgba(255, 200, 100, 0.7)';
        ctx.lineWidth = 1;
        
        // Wing patterns
        // Right wing details
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.5, this.y + this.height * 0.3);
        ctx.quadraticCurveTo(
            this.x + this.width * 0.7, this.y + this.height * 0.35,
            this.x + this.width * 0.8, this.y + this.height * 0.5
        );
        ctx.stroke();
        
        // Left wing details
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.5, this.y + this.height * 0.3);
        ctx.quadraticCurveTo(
            this.x + this.width * 0.3, this.y + this.height * 0.35,
            this.x + this.width * 0.2, this.y + this.height * 0.5
        );
        ctx.stroke();
        
        // Glowing trails behind the phoenix
        const trailTime = Date.now() / 1000;
        // Create fiery trailing particles
        for (let i = 0; i < 5; i++) {
            const offset = Math.sin(trailTime + i) * 10;
            const size = 3 + Math.sin(trailTime * 2 + i) * 2;
            
            ctx.fillStyle = `rgba(255, ${100 + Math.sin(trailTime + i) * 50}, 0, ${0.7 - i * 0.1})`;
            ctx.beginPath();
            ctx.arc(
                this.x + this.width * 0.5 + offset, 
                this.y + this.height * (0.4 + i * 0.1),
                size,
                0, Math.PI * 2
            );
            ctx.fill();
        }
        
        // Při zásahu přidáme červenou záři kolem lodi
        if (hitEffect) {
            ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
            ctx.shadowBlur = 20;
        }
        
        ctx.restore();
    }
    
    drawBladeShip(ctx, hitEffect) {
        ctx.save();
        
        // Shadow for depth
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(100, 50, 200, 0.5)';
        
        // Create a sleek, sharp-looking ship
        // Main hull - dark matter blade
        const gradient = ctx.createLinearGradient(
            this.x, this.y,
            this.x + this.width, this.y + this.height
        );
        gradient.addColorStop(0, '#220033');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, '#220033');
        
        ctx.fillStyle = gradient;
        
        // Advanced blade shape
        ctx.beginPath();
        // Top point
        ctx.moveTo(this.x + this.width * 0.5, this.y);
        // Right edge - curved slightly
        ctx.bezierCurveTo(
            this.x + this.width * 0.7, this.y + this.height * 0.2,
            this.x + this.width * 0.9, this.y + this.height * 0.3,
            this.x + this.width * 0.8, this.y + this.height * 0.6
        );
        // Bottom right
        ctx.lineTo(this.x + this.width * 0.6, this.y + this.height);
        // Bottom edge with indent
        ctx.lineTo(this.x + this.width * 0.5, this.y + this.height * 0.9);
        // Bottom left
        ctx.lineTo(this.x + this.width * 0.4, this.y + this.height);
        // Left edge - curved slightly
        ctx.bezierCurveTo(
            this.x + this.width * 0.1, this.y + this.height * 0.3,
            this.x + this.width * 0.3, this.y + this.height * 0.2,
            this.x + this.width * 0.5, this.y
        );
        
        ctx.closePath();
        ctx.fill();
        
        // Energy core in center
        const coreGradient = ctx.createRadialGradient(
            this.x + this.width * 0.5, this.y + this.height * 0.4, 0,
            this.x + this.width * 0.5, this.y + this.height * 0.4, this.width * 0.25
        );
        coreGradient.addColorStop(0, 'rgba(200, 50, 255, 0.9)');
        coreGradient.addColorStop(0.7, 'rgba(100, 0, 200, 0.5)');
        coreGradient.addColorStop(1, 'rgba(50, 0, 100, 0)');
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(
            this.x + this.width * 0.5, 
            this.y + this.height * 0.4, 
            this.width * 0.15, 
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Energy blade edges - purple glow
        ctx.strokeStyle = 'rgba(200, 50, 255, 0.7)';
        ctx.lineWidth = 2;
        
        // Blade edge outline
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.5, this.y + this.height * 0.1);
        ctx.lineTo(this.x + this.width * 0.8, this.y + this.height * 0.5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.5, this.y + this.height * 0.1);
        ctx.lineTo(this.x + this.width * 0.2, this.y + this.height * 0.5);
        ctx.stroke();
        
        // Pulsing energy waves (animated)
        const pulseTime = Date.now() / 100;
        const pulseOffset = Math.sin(pulseTime) * 5;
        
        ctx.strokeStyle = 'rgba(200, 50, 255, 0.3)';
        ctx.lineWidth = 1 + Math.sin(pulseTime * 0.5) * 1;
        
        for (let i = 0; i < 3; i++) {
            const offset = i * 7 + pulseOffset;
            ctx.beginPath();
            ctx.arc(
                this.x + this.width * 0.5, 
                this.y + this.height * 0.4,
                offset + 5,
                0, Math.PI * 2
            );
            ctx.stroke();
        }
        
        // Při zásahu změníme barvu energetického jádra
        if (hitEffect) {
            // Změna barvy jádra
            const coreGradient = ctx.createRadialGradient(
                this.x + this.width * 0.5, this.y + this.height * 0.4, 0,
                this.x + this.width * 0.5, this.y + this.height * 0.4, this.width * 0.25
            );
            coreGradient.addColorStop(0, 'rgba(255, 50, 50, 0.9)');
            coreGradient.addColorStop(0.7, 'rgba(200, 0, 0, 0.5)');
            coreGradient.addColorStop(1, 'rgba(100, 0, 0, 0)');
            
            ctx.fillStyle = coreGradient;
        }
        
        ctx.restore();
    }
    
    drawEffects(ctx) {
        // Draw ultimate effect if active
        if (this.ultimateActive) {
            ctx.save();
            
            const pulseTime = Date.now() / 100;
            const pulseScale = 1 + Math.sin(pulseTime * 0.5) * 0.1;
            
            // Multiple rotating circular fields
            for (let i = 0; i < 3; i++) {
                const rotation = (pulseTime * 0.2) + (i * Math.PI / 4);
                const scale = 0.8 + (i * 0.2);
                
                ctx.strokeStyle = `rgba(85, 255, 255, ${0.7 - i * 0.2})`;
                ctx.lineWidth = 2 - i * 0.5;
                
                ctx.beginPath();
                ctx.ellipse(
                    this.x + this.width/2, 
                    this.y + this.height/2, 
                    this.width * scale * pulseScale,
                    this.height * scale * pulseScale,
                    rotation, 0, Math.PI * 2
                );
                ctx.stroke();
            }
            
            // Central energy burst
            const burstGradient = ctx.createRadialGradient(
                this.x + this.width/2, this.y + this.height/2, 0,
                this.x + this.width/2, this.y + this.height/2, this.width
            );
            burstGradient.addColorStop(0, 'rgba(85, 255, 255, 0.7)');
            burstGradient.addColorStop(0.5, 'rgba(85, 255, 255, 0.3)');
            burstGradient.addColorStop(1, 'rgba(85, 255, 255, 0)');
            
            ctx.fillStyle = burstGradient;
            ctx.beginPath();
            ctx.arc(
                this.x + this.width/2, 
                this.y + this.height/2, 
                this.width * 0.7 * pulseScale,
                0, Math.PI * 2
            );
            ctx.fill();
            
            ctx.restore();
        }
        
        // Draw shield if active
        if (this.powerups.shield > 0) {
            ctx.save();
            
            const pulseTime = Date.now() / 100;
            const opacity = 0.5 + Math.sin(pulseTime * 0.3) * 0.2;
            
            // Shield gradient
            const shieldGradient = ctx.createRadialGradient(
                this.x + this.width/2, this.y + this.height/2, this.width * 0.5,
                this.x + this.width/2, this.y + this.height/2, this.width * 0.8
            );
            shieldGradient.addColorStop(0, `rgba(50, 100, 255, 0)`);
            shieldGradient.addColorStop(0.7, `rgba(50, 150, 255, ${opacity * 0.3})`);
            shieldGradient.addColorStop(0.9, `rgba(100, 200, 255, ${opacity})`);
            shieldGradient.addColorStop(1, `rgba(150, 220, 255, 0)`);
            
            // Main shield bubble
            ctx.fillStyle = shieldGradient;
            ctx.beginPath();
            ctx.arc(
                this.x + this.width/2, 
                this.y + this.height/2, 
                this.width * 0.8,
                0, Math.PI * 2
            );
            ctx.fill();
            
            // Shield outline
            ctx.strokeStyle = `rgba(100, 200, 255, ${opacity + 0.2})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(
                this.x + this.width/2, 
                this.y + this.height/2, 
                this.width * 0.8,
                0, Math.PI * 2
            );
            ctx.stroke();
            
            // Shield hexagon pattern
            ctx.strokeStyle = `rgba(150, 220, 255, ${opacity * 0.5})`;
            ctx.lineWidth = 1;
            
            const hexSize = this.width * 0.3;
            const hexCount = 6;
            
            for (let i = 0; i < hexCount; i++) {
                const angle = (Math.PI * 2 / hexCount) * i + (pulseTime * 0.01);
                
                ctx.beginPath();
                for (let j = 0; j < 6; j++) {
                    const hexAngle = (Math.PI * 2 / 6) * j + angle;
                    const hexX = this.x + this.width/2 + Math.cos(hexAngle) * hexSize;
                    const hexY = this.y + this.height/2 + Math.sin(hexAngle) * hexSize;
                    
                    if (j === 0) {
                        ctx.moveTo(hexX, hexY);
                    } else {
                        ctx.lineTo(hexX, hexY);
                    }
                }
                ctx.closePath();
                ctx.stroke();
            }
            
            ctx.restore();
        }
        
        // Draw boost effect if active
        if (this.powerups.boost > 0 && this.game.input.isKeyDown('Space')) {
            ctx.save();
            
            const boostGradient = ctx.createRadialGradient(
                this.x + this.width/2, this.y + this.height, 0,
                this.x + this.width/2, this.y + this.height + 25, 30
            );
            boostGradient.addColorStop(0, 'rgba(255, 165, 0, 0.8)');
            boostGradient.addColorStop(0.7, 'rgba(255, 100, 0, 0.4)');
            boostGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
            
            ctx.fillStyle = boostGradient;
            
            // Draw a larger flame effect when boosting
            const flameTime = Date.now() / 50;
            const waveSize = Math.sin(flameTime) * 5;
            
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height);
            
            // Wavy flame effect
            for (let i = 0; i <= 10; i++) {
                const xPos = this.x + (this.width * i / 10);
                const yOffset = Math.sin(flameTime + i) * waveSize;
                const yPos = this.y + this.height + 25 + yOffset;
                
                ctx.lineTo(xPos, yPos);
            }
            
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    drawHealthBar(ctx) {
        const healthBarWidth = this.width * 1.2;
        const healthBarHeight = 6;
        const xPos = this.x - (healthBarWidth - this.width) / 2;
        const yPos = this.y + this.height + 15; // Moved lower to account for more detailed ship
        
        // Background with shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(xPos, yPos, healthBarWidth, healthBarHeight);
        ctx.restore();
        
        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.strokeRect(xPos, yPos, healthBarWidth, healthBarHeight);
        
        // Health
        const healthPercentage = this.health / this.maxHealth;
        
        // Create gradient based on health
        let healthGradient;
        if (healthPercentage > 0.6) {
            healthGradient = ctx.createLinearGradient(xPos, yPos, xPos + healthBarWidth * healthPercentage, yPos);
            healthGradient.addColorStop(0, '#00ff80');
            healthGradient.addColorStop(1, '#00cc00');
        } else if (healthPercentage > 0.3) {
            healthGradient = ctx.createLinearGradient(xPos, yPos, xPos + healthBarWidth * healthPercentage, yPos);
            healthGradient.addColorStop(0, '#ffff00');
            healthGradient.addColorStop(1, '#ff9900');
        } else {
            healthGradient = ctx.createLinearGradient(xPos, yPos, xPos + healthBarWidth * healthPercentage, yPos);
            healthGradient.addColorStop(0, '#ff5500');
            healthGradient.addColorStop(1, '#ff0000');
        }
        
        ctx.fillStyle = healthGradient;
        ctx.fillRect(
            xPos + 1, 
            yPos + 1, 
            (healthBarWidth - 2) * healthPercentage, 
            healthBarHeight - 2
        );
        
        // Add glowing effect on low health
        if (healthPercentage < 0.3) {
            const pulseTime = Date.now() / 200;
            const glowOpacity = 0.3 + Math.sin(pulseTime) * 0.2;
            
            ctx.save();
            ctx.fillStyle = `rgba(255, 0, 0, ${glowOpacity})`;
            ctx.filter = 'blur(5px)';
            ctx.fillRect(
                xPos, 
                yPos, 
                healthBarWidth * healthPercentage, 
                healthBarHeight
            );
            ctx.restore();
        }
    }
    
    drawThrusters(ctx) {
        // Create a dynamic thruster flame effect
        const flameHeight = 15 + Math.sin(Date.now() / 100) * 5; // Animated flame size
        
        ctx.save();
        
        // Create gradient for flames
        const gradient = ctx.createLinearGradient(
            this.x + this.width / 2, 
            this.y + this.height, 
            this.x + this.width / 2, 
            this.y + this.height + flameHeight
        );
        gradient.addColorStop(0, this.thrusterColor);
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        
        ctx.fillStyle = gradient;
        
        // Main flame
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.4, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height + flameHeight);
        ctx.lineTo(this.x + this.width * 0.6, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Side flames (smaller)
        const sideFlameHeight = flameHeight * 0.7;
        
        // Left thruster
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.25, this.y + this.height - 2);
        ctx.lineTo(this.x + this.width * 0.35, this.y + this.height - 2);
        ctx.lineTo(this.x + this.width * 0.3, this.y + this.height + sideFlameHeight);
        ctx.closePath();
        ctx.fill();
        
        // Right thruster
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.65, this.y + this.height - 2);
        ctx.lineTo(this.x + this.width * 0.75, this.y + this.height - 2);
        ctx.lineTo(this.x + this.width * 0.7, this.y + this.height + sideFlameHeight);
        ctx.closePath();
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.thrusterColor;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
