class EnemyManager {
    constructor(game) {
        this.game = game;
        this.enemies = [];
        this.enemyTypes = [
            {
                type: 1, // Basic enemy
                color: '#ff0000',
                lives: 1,
                width: 30,
                height: 30,
                shape: 'rectangle',
                speed: 2.5, // Increased speed
                scoreValue: 100,
                shootChance: 0.003 // Increased shoot chance
            },
            {
                type: 2, // Advanced enemy
                color: '#9900cc',
                lives: 3, // Increased health
                width: 35,
                height: 35,
                shape: 'triangle',
                speed: 2, // Increased speed
                scoreValue: 200,
                shootChance: 0.008 // Increased shoot chance
            },
            {
                type: 3, // Boss
                color: '#ff3300',
                lives: 35, // Increased health
                width: 80,
                height: 80,
                shape: 'hexagon',
                speed: 1.2, // Increased speed
                scoreValue: 1500,
                shootChance: 0.015, // Increased shoot chance
                isBoss: true
            },
            {
                type: 4, // Miniboss
                color: '#ff9933',
                lives: 8, // Increased health
                width: 50,
                height: 50,
                shape: 'diamond',
                speed: 1.5, // Increased speed
                scoreValue: 700,
                shootChance: 0.012, // Increased shoot chance
                isBoss: false
            },
            {
                type: 5, // Fast enemy
                color: '#ff9900',
                lives: 1,
                width: 25,
                height: 25,
                shape: 'diamond',
                speed: 4.5, // Increased speed significantly
                scoreValue: 300,
                shootChance: 0.005 // Increased shoot chance
            }
        ];
        
        this.movementPatterns = ['straight', 'zigzag', 'sine', 'boss'];
        this.currentWave = 0;
        this.waveSize = 12; // Increased initial wave size
        this.bossFrequency = 4; // Boss more frequently - every 4 waves instead of 5
        this.waveDelay = 180; // 3 seconds at 60fps
        this.waveTimer = 0;
        this.waveActive = false;
        this.difficulty = 1; // Starting difficulty multiplier
    }
    
    startNextWave() {
        this.currentWave++;
        this.waveActive = true;
        this.waveTimer = 0;
        
        // Adjust difficulty - increased difficulty scaling
        this.difficulty = 1 + (this.currentWave * 0.15);
        
        // Create notification
        this.game.effects.createNotification(`Wave ${this.currentWave}`, 
            this.game.canvas.width / 2, this.game.canvas.height / 2);
        
        // Spawn boss wave
        if (this.currentWave % this.bossFrequency === 0) {
            this.spawnBossWave();
            this.game.soundManager.playSound('boss');
        } else {
            this.spawnWave();
        }
    }
    
    spawnWave() {
        const { canvas } = this.game;
        // More enemies per wave - increased scaling
        const waveSize = this.waveSize + Math.floor(this.currentWave * 0.7);
        
        for (let i = 0; i < waveSize; i++) {
            // Distribute enemies across the screen
            const x = 50 + Math.random() * (canvas.width - 100);
            const y = -50 - (i * 40); // Stagger spawning
            
            // Basic enemies are most common, rarer types have lower probability
            const enemyType = this.getRandomEnemyType();
            const enemyData = this.enemyTypes[enemyType - 1];
            
            // More difficult patterns in later waves
            const movementPattern = this.getRandomMovementPattern();
            
            // Apply difficulty scaling
            const lives = Math.ceil(enemyData.lives * this.difficulty);
            const speed = enemyData.speed * (1 + (this.currentWave * 0.05));
            
            this.spawnEnemy(x, y, enemyType, movementPattern, lives, speed);
        }
        
        // Add occasional special enemy formations in higher waves
        if (this.currentWave > 5 && Math.random() < 0.3) {
            this.spawnFormation();
        }
    }
    
    // New method for special enemy formations
    spawnFormation() {
        const { canvas } = this.game;
        const formationType = Math.floor(Math.random() * 3);
        
        switch (formationType) {
            case 0: // V formation
                const vCenterX = canvas.width / 2;
                for (let i = 0; i < 5; i++) {
                    const offsetX = (i - 2) * 40;
                    const offsetY = Math.abs(offsetX) / 2;
                    this.spawnEnemy(
                        vCenterX + offsetX, 
                        -100 - offsetY,
                        2, // Type 2 enemies
                        'straight',
                        Math.ceil(2 * this.difficulty),
                        2 + (this.currentWave * 0.03)
                    );
                }
                break;
                
            case 1: // Line formation
                const lineY = -100;
                for (let i = 0; i < 4; i++) {
                    this.spawnEnemy(
                        100 + (i * 120),
                        lineY,
                        i === 1 || i === 2 ? 4 : 2, // Center enemies are minibosses
                        'zigzag',
                        Math.ceil(i === 1 || i === 2 ? 6 * this.difficulty : 2 * this.difficulty),
                        1.8 + (this.currentWave * 0.02)
                    );
                }
                break;
                
            case 2: // Circle of fast enemies
                const centerX = canvas.width / 2;
                const centerY = -150;
                const radius = 80;
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI * 2 / 6) * i;
                    this.spawnEnemy(
                        centerX + Math.cos(angle) * radius,
                        centerY + Math.sin(angle) * radius,
                        5, // Fast enemy type
                        'sine',
                        1,
                        4 + (this.currentWave * 0.08)
                    );
                }
                break;
        }
    }
    
    spawnBossWave() {
        const { canvas } = this.game;
        
        // Spawn boss in the middle
        const bossX = (canvas.width / 2) - 40;
        const bossY = -100;
        
        // Boss gets stronger every wave
        const bossLives = 20 + (this.currentWave * 6); // Increased health scaling
        this.spawnEnemy(bossX, bossY, 3, 'boss', bossLives, 1 + (this.currentWave * 0.02));
        
        // Spawn more minions around the boss in higher waves
        const minionCount = 4 + Math.floor(this.currentWave / 5); // More minions in higher waves
        for (let i = 0; i < minionCount; i++) {
            const x = 50 + Math.random() * (canvas.width - 100);
            const y = -150 - (i * 30);
            
            // Add some fast enemies as escorts
            if (i % 2 === 0 && this.currentWave > 8) {
                this.spawnEnemy(x, y, 5, 'sine', 1, 3.5);
            } else {
                this.spawnEnemy(x, y, 2, 'zigzag', 2 * this.difficulty, 1.5);
            }
        }
    }
    
    spawnEnemy(x, y, type, movementPattern, lives, speed) {
        const enemyData = this.enemyTypes[type - 1];
        
        const enemy = {
            x,
            y,
            type,
            movementPattern,
            width: enemyData.width,
            height: enemyData.height,
            color: enemyData.color,
            shape: enemyData.shape,
            lives,
            maxLives: lives,
            speed,
            shootChance: enemyData.shootChance * this.difficulty,
            scoreValue: enemyData.scoreValue,
            isBoss: enemyData.isBoss || false,
            
            // Movement pattern variables
            movementTimer: 0,
            direction: 1,
            amplitude: 50,
            frequency: 0.02
        };
        
        this.enemies.push(enemy);
    }
    
    getRandomEnemyType() {
        // Weighted probability - basic enemies are more common
        const rand = Math.random();
        
        // In higher waves, increase chance of stronger enemies
        const waveBonus = this.currentWave * 0.01;
        
        if (rand < 0.05 + waveBonus && this.currentWave > 3) {
            return 5; // Fast enemy (type 5)
        } else if (rand < 0.1 + waveBonus && this.currentWave > 2) {
            return 4; // Miniboss (type 4)
        } else if (rand < 0.3 + waveBonus) {
            return 2; // Advanced enemy (type 2)
        } else {
            return 1; // Basic enemy (type 1)
        }
    }
    
    getRandomMovementPattern() {
        const rand = Math.random();
        if (rand < 0.6) {
            return 'straight';
        } else if (rand < 0.8) {
            return 'zigzag';
        } else {
            return 'sine';
        }
    }
    
    update() {
        const { player } = this.game;
        
        // Check if the wave is cleared
        if (this.waveActive && this.enemies.length === 0) {
            this.waveActive = false;
            this.waveTimer = this.waveDelay;
            
            // Regenerate player health between waves
            player.regenerateHealthBetweenWaves();
            
            // Notify player about health regeneration
            this.game.effects.createNotification(
                `Vlna vyčištěna! +${player.healthRegenRate} zdraví`, 
                this.game.canvas.width / 2, 
                this.game.canvas.height / 2 + 30
            );
        }
        
        // If between waves, decrement timer and start new wave when ready
        if (!this.waveActive) {
            if (this.waveTimer > 0) {
                this.waveTimer--;
            } else {
                this.startNextWave();
            }
        }
        
        // Update all enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Apply movement pattern
            this.moveEnemy(enemy);
            
            // Check if enemy should shoot
            if (Math.random() < enemy.shootChance) {
                if (enemy.type === 3) { // Boss has special attack patterns
                    const pattern = ['standard', 'triple', 'aimed', 'circular'][Math.floor(Math.random() * 4)];
                    this.game.weapons.fireEnemyBullet(enemy, pattern);
                } else if (enemy.type === 4) { // Miniboss shoots triple
                    this.game.weapons.fireEnemyBullet(enemy, 'triple');
                } else {
                    this.game.weapons.fireEnemyBullet(enemy);
                }
            }
            
            // Check collision with player
            if (Utils.collides(player, enemy) && !player.invincible) {
                player.takeDamage();
            }
            
            // Check collision with player bullets
            const bullets = this.game.weapons.bullets;
            for (let j = bullets.length - 1; j >= 0; j--) {
                const bullet = bullets[j];
                if (Utils.collides(bullet, enemy)) {
                    // Apply damage and remove bullet
                    enemy.lives -= bullet.power;
                    bullets.splice(j, 1);
                    
                    // If enemy is destroyed
                    if (enemy.lives <= 0) {
                        this.destroyEnemy(enemy, i);
                        break;
                    }
                }
            }
            
            // Remove enemies that go off screen
            if (enemy.y > this.game.canvas.height + 50) {
                this.enemies.splice(i, 1);
            }
        }
    }
    
    moveEnemy(enemy) {
        enemy.movementTimer++;
        
        switch(enemy.movementPattern) {
            case 'straight':
                enemy.y += enemy.speed;
                break;
                
            case 'zigzag':
                enemy.y += enemy.speed;
                
                if (enemy.movementTimer % 60 === 0) {
                    enemy.direction *= -1;
                }
                
                enemy.x += enemy.direction * enemy.speed;
                
                // Keep within bounds
                if (enemy.x < 0 || enemy.x > this.game.canvas.width - enemy.width) {
                    enemy.direction *= -1;
                }
                break;
                
            case 'sine':
                enemy.y += enemy.speed;
                enemy.x = enemy.x + Math.sin(enemy.movementTimer * enemy.frequency) * 2;
                break;
                
            case 'boss':
                // Boss first moves down, then side to side
                if (enemy.y < 100) {
                    enemy.y += enemy.speed;
                } else {
                    if (enemy.movementTimer % 120 === 0) {
                        enemy.direction *= -1;
                    }
                    
                    enemy.x += enemy.direction * (enemy.speed * 0.8);
                    
                    // Keep within bounds
                    if (enemy.x < 0 || enemy.x > this.game.canvas.width - enemy.width) {
                        enemy.direction *= -1;
                    }
                }
                break;
        }
    }
    
    // Enhanced method to spawn powerups with better chances in higher waves
    destroyEnemy(enemy, index) {
        // Add score
        this.game.score += enemy.scoreValue;
        
        // Create explosion effect based on enemy size
        const size = enemy.isBoss ? 'large' : (enemy.type === 2 || enemy.type === 4) ? 'medium' : 'small';
        this.game.effects.createExplosionEffect(
            enemy.x + enemy.width / 2, 
            enemy.y + enemy.height / 2,
            size
        );
        
        // Play sound
        this.game.soundManager.playSound(enemy.isBoss ? 'bossExplode' : 'explode');
        
        // OPRAVA: Výrazně zvýšená šance dropnutí předmětů a lepší škálování s vlnami
        const powerupBaseChance = enemy.isBoss ? 1.0 : // Bossové vždy dropnou předmět
                                  enemy.type === 4 ? 0.75 : // Miniboss 75% šance
                                  enemy.type === 2 ? 0.45 : // Pokročilý enemy 45% šance
                                  enemy.type === 5 ? 0.35 : // Rychlý enemy 35% šance
                                  0.25; // Základní enemy 25% šance
        
        // Wave bonus increases chances in later waves
        const waveBonus = Math.min(0.5, this.currentWave * 0.02); // Max +50% z vln
        
        // Calculate final chance - vyšší šance
        const finalChance = Math.min(0.95, powerupBaseChance + waveBonus); // Max 95%
        
        // Try to spawn powerup
        const centerX = enemy.x + enemy.width / 2 - 12.5;
        const centerY = enemy.y + enemy.height / 2 - 12.5;
        
        // Debug log pro lepší diagnostiku
        console.log(`Pokus o drop: Vlna ${this.currentWave}, Typ nepřítele: ${enemy.type}, Šance: ${finalChance.toFixed(2)}`);
        
        if (Math.random() < finalChance) {
            // Přímo zavoláme metodu pro vytvoření power-upu bez další kontroly pravděpodobnosti
            this.game.powerups.spawnPowerupFromEnemy(centerX, centerY, this.currentWave);
        }
        
        // Add ultimate charge for player - more for bigger enemies
        const chargeAmount = enemy.isBoss ? 25 : 
                            enemy.type === 4 ? 12 : 
                            enemy.type === 2 ? 8 : 5;
        this.game.player.addUltimateCharge(chargeAmount);
        
        // Remove enemy from array
        this.enemies.splice(index, 1);
    }
    
    draw(ctx) {
        for (const enemy of this.enemies) {
            // Draw health bar for enemies with multiple lives
            this.drawEnemyHealthBar(ctx, enemy);
            
            // Draw enemy based on its type
            switch(enemy.type) {
                case 1: // Basic enemy
                    this.drawBasicEnemy(ctx, enemy);
                    break;
                case 2: // Advanced enemy
                    this.drawAdvancedEnemy(ctx, enemy);
                    break;
                case 3: // Boss
                    this.drawBossEnemy(ctx, enemy);
                    break;
                case 4: // Miniboss
                    this.drawMinibossEnemy(ctx, enemy);
                    break;
                case 5: // Fast enemy
                    this.drawFastEnemy(ctx, enemy);
                    break;
            }
        }
    }
    
    drawEnemyHealthBar(ctx, enemy) {
        if (enemy.lives <= 1) return;
        
        const healthPercentage = enemy.lives / enemy.maxLives;
        const healthBarWidth = enemy.width;
        const actualWidth = healthBarWidth * healthPercentage;
        const healthBarHeight = 8;
        const yOffset = 12;
        
        // Draw background with shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 3;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(enemy.x, enemy.y - yOffset, healthBarWidth, healthBarHeight);
        
        // Draw border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(enemy.x, enemy.y - yOffset, healthBarWidth, healthBarHeight);
        
        // Draw health
        let healthColor;
        if (healthPercentage > 0.6) {
            healthColor = '#00ff00'; // Green
        } else if (healthPercentage > 0.3) {
            healthColor = '#ffff00'; // Yellow
        } else {
            healthColor = '#ff0000'; // Red
        }
        
        // For boss, use different color scheme
        if (enemy.isBoss) {
            healthColor = `rgb(${255 * (1 - healthPercentage)}, ${100 * healthPercentage}, ${255 * healthPercentage})`;
        }
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(enemy.x + 1, enemy.y - yOffset + 1, actualWidth - 2, healthBarHeight - 2);
        
        // Draw percentage text for bosses or bigger enemies
        if (enemy.isBoss || enemy.type === 4) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                `${Math.floor(healthPercentage * 100)}%`, 
                enemy.x + healthBarWidth / 2, 
                enemy.y - yOffset + healthBarHeight - 1
            );
        }
        
        ctx.restore();
    }
    
    drawBasicEnemy(ctx, enemy) {
        ctx.save();
        
        // Create a metallic-looking gradient
        const gradient = ctx.createLinearGradient(
            enemy.x, enemy.y, 
            enemy.x + enemy.width, enemy.y + enemy.height
        );
        gradient.addColorStop(0, '#ff6666');
        gradient.addColorStop(0.5, enemy.color);
        gradient.addColorStop(1, '#990000');
        
        // Add a slight glow effect
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 5;
        
        // Main body - a rounded rectangle
        ctx.fillStyle = gradient;
        this.roundRect(ctx, enemy.x, enemy.y, enemy.width, enemy.height, 5);
        
        // Add design details - eye/sensor
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(
            enemy.x + enemy.width/2,
            enemy.y + enemy.height/3,
            enemy.width/6,
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Add thruster flames
        const flameHeight = 8 + Math.sin(Date.now() / 150) * 3;
        
        // Thruster gradient
        const thrusterGradient = ctx.createLinearGradient(
            enemy.x + enemy.width/2,
            enemy.y + enemy.height,
            enemy.x + enemy.width/2,
            enemy.y + enemy.height - flameHeight
        );
        thrusterGradient.addColorStop(0, 'rgba(255, 50, 0, 0)');
        thrusterGradient.addColorStop(0.6, 'rgba(255, 100, 0, 0.8)');
        thrusterGradient.addColorStop(1, 'rgba(255, 200, 0, 1)');
        
        ctx.fillStyle = thrusterGradient;
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width * 0.3, enemy.y + enemy.height);
        ctx.lineTo(enemy.x + enemy.width * 0.5, enemy.y + enemy.height - flameHeight);
        ctx.lineTo(enemy.x + enemy.width * 0.7, enemy.y + enemy.height);
        ctx.closePath();
        ctx.fill();
        
        // Add panel lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(enemy.x + 5, enemy.y + 5);
        ctx.lineTo(enemy.x + enemy.width - 5, enemy.y + 5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width/2, enemy.y + enemy.height * 0.4);
        ctx.lineTo(enemy.x + enemy.width/2, enemy.y + enemy.height * 0.8);
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawAdvancedEnemy(ctx, enemy) {
        ctx.save();
        
        // Center coordinates
        const centerX = enemy.x + enemy.width/2;
        const centerY = enemy.y + enemy.height/2;
        
        // Create an advanced looking gradient
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, enemy.width/2
        );
        gradient.addColorStop(0, '#cc66ff');
        gradient.addColorStop(0.6, enemy.color);
        gradient.addColorStop(1, '#330066');
        
        // Add a glow effect
        ctx.shadowColor = '#cc33ff';
        ctx.shadowBlur = 10;
        
        // Draw the main body - an advanced triangle
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(centerX, enemy.y); // Top point
        
        // Right side with curve
        ctx.quadraticCurveTo(
            enemy.x + enemy.width * 1.1, enemy.y + enemy.height/2,
            enemy.x + enemy.width, enemy.y + enemy.height
        );
        
        // Bottom with curve
        ctx.quadraticCurveTo(
            centerX, enemy.y + enemy.height * 1.1,
            enemy.x, enemy.y + enemy.height
        );
        
        // Left side with curve
        ctx.quadraticCurveTo(
            enemy.x - enemy.width * 0.1, enemy.y + enemy.height/2,
            centerX, enemy.y
        );
        
        ctx.closePath();
        ctx.fill();
        
        // Add energy core
        const coreGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, enemy.width/4
        );
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.4, '#cc99ff');
        coreGradient.addColorStop(1, '#6600cc');
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, enemy.width/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Add energy rings - animated
        const time = Date.now() / 1000;
        ctx.strokeStyle = 'rgba(204, 153, 255, 0.7)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 2; i++) {
            const pulseSize = Math.sin(time * (i + 1) * 2) * 3;
            ctx.beginPath();
            ctx.arc(
                centerX, 
                centerY, 
                (enemy.width/4) + 5 + (i * 5) + pulseSize, 
                0, Math.PI * 2
            );
            ctx.stroke();
        }
        
        // Add power conduits
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        
        // Top conduit
        ctx.beginPath();
        ctx.moveTo(centerX, enemy.y + 5);
        ctx.lineTo(centerX, centerY - enemy.height/5);
        ctx.stroke();
        
        // Left conduit
        ctx.beginPath();
        ctx.moveTo(enemy.x + 5, enemy.y + enemy.height - 5);
        ctx.lineTo(centerX - enemy.width/5, centerY);
        ctx.stroke();
        
        // Right conduit
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width - 5, enemy.y + enemy.height - 5);
        ctx.lineTo(centerX + enemy.width/5, centerY);
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawBossEnemy(ctx, enemy) {
        ctx.save();
        
        // Center coordinates
        const centerX = enemy.x + enemy.width/2;
        const centerY = enemy.y + enemy.height/2;
        const radius = enemy.width/2;
        
        // Create a menacing gradient
        const gradient = ctx.createRadialGradient(
            centerX, centerY, radius * 0.3,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, '#ff6666');
        gradient.addColorStop(0.4, enemy.color);
        gradient.addColorStop(1, '#660000');
        
        // Add a strong glow effect
        ctx.shadowColor = '#ff3333';
        ctx.shadowBlur = 20;
        
        // Draw the main body - hexagon with details
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Create hexagon vertices with slight variations for a more organic, imposing look
        const vertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const variation = Math.sin(Date.now() / 1000 + i) * 5; // Slight pulsating effect
            const x = centerX + (radius + variation) * Math.cos(angle);
            const y = centerY + (radius + variation) * Math.sin(angle);
            vertices.push({ x, y });
        }
        
        // Draw the hexagon
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Add armor plates/panels
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        
        for (let i = 0; i < vertices.length; i++) {
            const nextI = (i + 1) % vertices.length;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(vertices[i].x, vertices[i].y);
            ctx.lineTo(vertices[nextI].x, vertices[nextI].y);
            ctx.closePath();
            ctx.fill();
        }
        
        // Add central core - large energy source
        const coreGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius * 0.4
        );
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.3, '#ffcc00');
        coreGradient.addColorStop(0.7, '#ff6600');
        coreGradient.addColorStop(1, '#cc0000');
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Add spinning attack indicators
        const time = Date.now() / 1000;
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.lineWidth = 3;
        
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(
                centerX, 
                centerY, 
                radius * (0.5 + i * 0.15), 
                time % (Math.PI * 2), 
                (time % (Math.PI * 2)) + Math.PI
            );
            ctx.stroke();
        }
        
        // Add evil "eyes"
        const eyeDistance = radius * 0.25;
        const eyeSize = radius * 0.1;
        
        // Left eye
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(centerX - eyeDistance, centerY - eyeDistance/2, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(centerX + eyeDistance, centerY - eyeDistance/2, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Add "mouth" - looks like a weapon array
        ctx.fillStyle = '#330000';
        ctx.beginPath();
        ctx.rect(centerX - radius * 0.3, centerY + eyeDistance/2, radius * 0.6, radius * 0.2);
        ctx.fill();
        
        // Add cannon details
        ctx.fillStyle = '#ff3300';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.rect(
                centerX - radius * 0.25 + i * radius * 0.25, 
                centerY + eyeDistance/2 + radius * 0.05,
                radius * 0.08,
                radius * 0.1
            );
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawMinibossEnemy(ctx, enemy) {
        ctx.save();
        
        // Center coordinates
        const centerX = enemy.x + enemy.width/2;
        const centerY = enemy.y + enemy.height/2;
        
        // Create a powerful orange/gold gradient
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, enemy.width/2
        );
        gradient.addColorStop(0, '#ffcc66');
        gradient.addColorStop(0.6, enemy.color);
        gradient.addColorStop(1, '#993300');
        
        // Add a medium glow effect
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 15;
        
        // Draw the main body - a diamond with details
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Top point with slight animation
        const topOffset = Math.sin(Date.now() / 800) * 3;
        ctx.moveTo(centerX, enemy.y + topOffset);
        
        // Right point with slight animation
        const rightOffset = Math.sin(Date.now() / 700) * 3;
        ctx.lineTo(enemy.x + enemy.width + rightOffset, centerY);
        
        // Bottom point with slight animation
        const bottomOffset = Math.sin(Date.now() / 600) * 3;
        ctx.lineTo(centerX, enemy.y + enemy.height + bottomOffset);
        
        // Left point with slight animation
        const leftOffset = Math.sin(Date.now() / 500) * 3;
        ctx.lineTo(enemy.x + leftOffset, centerY);
        
        ctx.closePath();
        ctx.fill();
        
        // Add cross-shaped power core
        const coreSize = enemy.width * 0.3;
        const coreGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, coreSize
        );
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.4, '#ffcc00');
        coreGradient.addColorStop(1, '#ff6600');
        
        // Horizontal bar
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.rect(
            centerX - coreSize, 
            centerY - coreSize/4,
            coreSize * 2,
            coreSize/2
        );
        ctx.fill();
        
        // Vertical bar
        ctx.beginPath();
        ctx.rect(
            centerX - coreSize/4,
            centerY - coreSize,
            coreSize/2,
            coreSize * 2
        );
        ctx.fill();
        
        // Add energy discharges - lightning-like
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        
        // Draw 4 lightning bolts from center to points
        const time = Date.now() / 500;
        const directions = [
            { x: centerX, y: enemy.y },
            { x: enemy.x + enemy.width, y: centerY },
            { x: centerX, y: enemy.y + enemy.height },
            { x: enemy.x, y: centerY }
        ];
        
        directions.forEach((dir, index) => {
            if (Math.sin(time + index) > 0) {  // Only draw some of the bolts at any time
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                
                // Create a jagged lightning path
                let currentX = centerX;
                let currentY = centerY;
                const targetX = dir.x;
                const targetY = dir.y;
                
                const segments = 3;
                for (let i = 0; i < segments; i++) {
                    // Calculate the next position
                    const nextX = currentX + (targetX - currentX) / (segments - i);
                    const nextY = currentY + (targetY - currentY) / (segments - i);
                    
                    // Add some randomness
                    const offsetX = (Math.random() - 0.5) * 15;
                    const offsetY = (Math.random() - 0.5) * 15;
                    
                    ctx.lineTo(nextX + offsetX, nextY + offsetY);
                    currentX = nextX;
                    currentY = nextY;
                }
                
                ctx.lineTo(targetX, targetY);
                ctx.stroke();
            }
        });
        
        ctx.restore();
    }
    
    drawFastEnemy(ctx, enemy) {
        ctx.save();
        
        // Center coordinates
        const centerX = enemy.x + enemy.width/2;
        const centerY = enemy.y + enemy.height/2;
        
        // Create a speed-focused gradient
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, enemy.width/2
        );
        gradient.addColorStop(0, '#ffcc66');
        gradient.addColorStop(0.4, enemy.color);
        gradient.addColorStop(1, '#cc6600');
        
        // Add a motion blur effect
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 10; // Creates a motion streak behind
        
        // Draw the main body - a aerodynamic diamond
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Top point - extra sharp
        ctx.moveTo(centerX, enemy.y - enemy.height * 0.1);
        
        // Right point
        ctx.lineTo(enemy.x + enemy.width, centerY);
        
        // Bottom point
        ctx.lineTo(centerX, enemy.y + enemy.height);
        
        // Left point
        ctx.lineTo(enemy.x, centerY);
        
        ctx.closePath();
        ctx.fill();
        
        // Add speed lines/afterimages
        ctx.strokeStyle = 'rgba(255, 204, 0, 0.7)';
        ctx.lineWidth = 1.5;
        
        // Draw several afterimages
        const time = Date.now() / 100;
        for (let i = 1; i <= 3; i++) {
            const offset = i * 5 + Math.sin(time) * 2;
            
            ctx.beginPath();
            ctx.moveTo(centerX, enemy.y - enemy.height * 0.1 + offset);
            ctx.lineTo(enemy.x + enemy.width, centerY + offset);
            ctx.lineTo(centerX, enemy.y + enemy.height + offset);
            ctx.lineTo(enemy.x, centerY + offset);
            ctx.closePath();
            ctx.stroke();
        }
        
        // Add central thruster effect
        const thrusterGradient = ctx.createLinearGradient(
            centerX, enemy.y + enemy.height,
            centerX, enemy.y + enemy.height + 20
        );
        thrusterGradient.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
        thrusterGradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.6)');
        thrusterGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = thrusterGradient;
        
        // Animated flame effect
        const flameWidth = 10 + Math.sin(time * 0.8) * 3;
        const flameHeight = 15 + Math.sin(time * 0.5) * 5;
        
        ctx.beginPath();
        ctx.moveTo(centerX - flameWidth/2, enemy.y + enemy.height);
        ctx.quadraticCurveTo(
            centerX, enemy.y + enemy.height + flameHeight * 1.5,
            centerX + flameWidth/2, enemy.y + enemy.height
        );
        ctx.closePath();
        ctx.fill();
        
        // Add highlight/reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(centerX, enemy.y);
        ctx.lineTo(centerX + enemy.width * 0.2, enemy.y + enemy.height * 0.3);
        ctx.lineTo(centerX, enemy.y + enemy.height * 0.5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    // Helper function for rounded rectangles
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
}
