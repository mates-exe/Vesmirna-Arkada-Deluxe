class WeaponManager {
    constructor(player) {
        this.player = player;
        this.game = player.game;
        this.bullets = [];
        this.enemyBullets = [];
    }
    
    fire() {
        const { x, y, width, weaponType, weaponLevel } = this.player;
        const centerX = x + width / 2;
        
        switch(weaponType) {
            case 'standard':
                this.fireStandard(centerX, y, weaponLevel);
                break;
            case 'laser':
                this.fireLaser(centerX, y, weaponLevel);
                break;
            case 'spread':
                this.fireSpread(centerX, y, weaponLevel);
                break;
        }
    }
    
    fireStandard(centerX, y, level) {
        switch(level) {
            case 1:
                this.createBullet(centerX - 2, y, 0, -10, 'player');
                break;
            case 2:
                this.createBullet(centerX - 10, y + 5, 0, -10, 'player');
                this.createBullet(centerX + 6, y + 5, 0, -10, 'player');
                break;
            case 3:
                this.createBullet(centerX - 2, y, 0, -10, 'player');
                this.createBullet(centerX - 12, y + 10, -0.3, -9.5, 'player');
                this.createBullet(centerX + 8, y + 10, 0.3, -9.5, 'player');
                break;
        }
    }
    
    fireLaser(centerX, y, level) {
        const power = level * 2;
        this.createBullet(centerX - 2, y, 0, -12, 'player', 'laser', power);
    }
    
    fireSpread(centerX, y, level) {
        const angles = [-30, -15, 0, 15, 30];
        const count = Math.min(level + 2, angles.length);
        const startIndex = Math.floor((angles.length - count) / 2);
        
        for (let i = 0; i < count; i++) {
            const angle = angles[startIndex + i] * (Math.PI / 180);
            const vx = Math.sin(angle) * 10;
            const vy = -Math.cos(angle) * 10;
            this.createBullet(centerX - 2, y, vx, vy, 'player');
        }
    }
    
    fireUltimate() {
        const { x, y, width, height } = this.player;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        for (let angle = 0; angle < 360; angle += 15) {
            const rad = angle * (Math.PI / 180);
            const vx = Math.cos(rad) * 8;
            const vy = Math.sin(rad) * 8;
            this.createBullet(centerX, centerY, vx, vy, 'player', 'ultimate', 3);
        }
    }
    
    fireEnemyBullet(enemy, pattern = 'standard') {
        const { x, y, width, height } = enemy;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const playerX = this.player.x + this.player.width / 2;
        const playerY = this.player.y + this.player.height / 2;
        
        switch(pattern) {
            case 'standard':
                this.createBullet(centerX, centerY + 10, 0, 5, 'enemy');
                break;
            case 'triple':
                this.createBullet(centerX, centerY + 10, 0, 5, 'enemy');
                this.createBullet(centerX - 10, centerY + 5, -1, 5, 'enemy');
                this.createBullet(centerX + 10, centerY + 5, 1, 5, 'enemy');
                break;
            case 'aimed':
                const angle = Math.atan2(playerY - centerY, playerX - centerX);
                const vx = Math.cos(angle) * 6;
                const vy = Math.sin(angle) * 6;
                this.createBullet(centerX, centerY, vx, vy, 'enemy');
                break;
            case 'circular':
                for (let angle = 0; angle < 360; angle += 45) {
                    const rad = angle * (Math.PI / 180);
                    const vx = Math.cos(rad) * 4;
                    const vy = Math.sin(rad) * 4;
                    this.createBullet(centerX, centerY, vx, vy, 'enemy');
                }
                break;
        }
    }
    
    createBullet(x, y, vx, vy, type, bulletType = 'standard', power = 1) {
        const bullet = {
            x,
            y,
            vx,
            vy,
            type,
            bulletType,
            power,
            width: bulletType === 'laser' ? 4 : 6,
            height: bulletType === 'laser' ? 15 : 10,
            active: true
        };
        
        if (type === 'player') {
            this.bullets.push(bullet);
        } else {
            this.enemyBullets.push(bullet);
        }
    }
    
    update() {
        this.updateBullets();
        this.updateEnemyBullets();
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y += bullet.vy;
            bullet.x += bullet.vx;
            
            // Remove bullets that go off screen
            if (bullet.y < -bullet.height || 
                bullet.y > this.game.canvas.height ||
                bullet.x < -bullet.width ||
                bullet.x > this.game.canvas.width) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    updateEnemyBullets() {
        const { player } = this.game;
        
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            bullet.y += bullet.vy;
            bullet.x += bullet.vx;
            
            // Check collision with player
            if (Utils.collides(bullet, player) && !player.invincible) {
                player.takeDamage();
                this.enemyBullets.splice(i, 1);
                continue;
            }
            
            // Remove bullets that go off screen
            if (bullet.y > this.game.canvas.height || 
                bullet.y < -bullet.height ||
                bullet.x < -bullet.width ||
                bullet.x > this.game.canvas.width) {
                this.enemyBullets.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        // Draw player bullets
        for (const bullet of this.bullets) {
            if (bullet.bulletType === 'laser') {
                ctx.fillStyle = '#ff00ff';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Add glow effect for laser
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ff00ff';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                ctx.shadowBlur = 0;
            } else if (bullet.bulletType === 'ultimate') {
                ctx.fillStyle = '#5ff';
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Add glow for ultimate bullets
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#5ff';
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            }
        }
        
        // Draw enemy bullets with improved visibility
        for (const bullet of this.enemyBullets) {
            // Make bullets bigger
            const bulletSize = bullet.width * 1.5;
            
            // Draw bullet trail/tail
            ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
            ctx.beginPath();
            ctx.moveTo(bullet.x + bulletSize/2, bullet.y + bulletSize/2);
            ctx.lineTo(bullet.x + bulletSize/2 - bullet.vx*3, bullet.y + bulletSize/2 - bullet.vy*3);
            ctx.lineTo(bullet.x + bulletSize/2 - bullet.vx*2 + bullet.vy/2, bullet.y + bulletSize/2 - bullet.vy*2 - bullet.vx/2);
            ctx.lineTo(bullet.x + bulletSize/2 - bullet.vx*2 - bullet.vy/2, bullet.y + bulletSize/2 - bullet.vy*2 + bullet.vx/2);
            ctx.closePath();
            ctx.fill();
            
            // Draw bullet with glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff3333';
            ctx.fillStyle = '#ff3333';
            ctx.beginPath();
            ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bulletSize/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw bright core
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffaaaa';
            ctx.beginPath();
            ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bulletSize/4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}