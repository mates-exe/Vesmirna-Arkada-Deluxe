class EffectsManager {
    constructor(game) {
        this.game = game;
        this.particles = [];
        this.starfield = [];
        this.notifications = [];
        
        // Initialize starfield
        this.initializeStarfield();
    }
    
    initializeStarfield() {
        const { canvas } = this.game;
        // Create stars of different sizes and speeds
        for (let i = 0; i < 100; i++) {
            this.starfield.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 1
            });
        }
    }
    
    update() {
        this.updateParticles();
        this.updateStarfield();
        this.updateNotifications();
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            // Apply fade out
            if (particle.life < 30) {
                particle.alpha = particle.life / 30;
            }
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateStarfield() {
        const { canvas } = this.game;
        for (const star of this.starfield) {
            star.y += star.speed;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        }
    }
    
    updateNotifications() {
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            notification.life--;
            
            if (notification.life <= 0) {
                this.notifications.splice(i, 1);
            }
        }
    }
    
    createExplosionEffect(x, y, size = 'medium') {
        const count = size === 'small' ? 15 : size === 'medium' ? 30 : 45;
        const maxSpeed = size === 'small' ? 2 : size === 'medium' ? 3 : 4;
        const life = size === 'small' ? 30 : size === 'medium' ? 45 : 60;
        const colors = ['#ff0000', '#ff5500', '#ffcc00', '#ffffff'];
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * maxSpeed + 1;
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 3 + 1,
                life: Math.random() * life + 20,
                alpha: 1
            });
        }
    }
    
    createDashEffect(x, y) {
        const count = 20;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                color: '#5ff',
                size: Math.random() * 3 + 1,
                life: Math.random() * 30 + 10,
                alpha: 1
            });
        }
    }
    
    createUltimateEffect(x, y) {
        const count = 60;
        const colors = ['#5ff', '#50f', '#f0f'];
        
        // Circular wave
        for (let angle = 0; angle < 360; angle += 5) {
            const rad = angle * (Math.PI / 180);
            this.particles.push({
                x,
                y,
                vx: Math.cos(rad) * 5,
                vy: Math.sin(rad) * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 4 + 2,
                life: Math.random() * 60 + 30,
                alpha: 1
            });
        }
        
        // Extra particles
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 30 + 10;
            
            this.particles.push({
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 5 + 2,
                life: Math.random() * 30 + 60,
                alpha: 1
            });
        }
    }
    
    createPowerupEffect(x, y, color) {
        const count = 15;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 1;
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                size: Math.random() * 3 + 1,
                life: Math.random() * 40 + 20,
                alpha: 1
            });
        }
    }
    
    createNotification(text, x, y) {
        this.notifications.push({
            text,
            x,
            y,
            life: 120, // 2 seconds at 60fps
            alpha: 1
        });
    }
    
    createHealEffect(x, y, size = 'medium') {
        const count = size === 'small' ? 10 : 20;
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 1;
            const distance = Math.random() * 20 + 5;
            
            this.particles.push({
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                vx: Math.cos(angle) * speed * 0.5,
                vy: Math.sin(angle) * speed * 0.5 - 1, // Slightly upward bias
                color: '#33ff66',
                size: Math.random() * 3 + 2,
                life: Math.random() * 40 + 20,
                alpha: 1
            });
        }
        
        // Add cross symbol in the middle
        this.particles.push({
            x: x - 5,
            y: y - 10,
            vx: 0,
            vy: -1,
            color: '#ffffff',
            size: 10,
            shape: 'plus',
            life: 30,
            alpha: 1
        });
    }
    
    draw(ctx) {
        // Draw starfield
        ctx.fillStyle = 'white';
        for (const star of this.starfield) {
            ctx.fillRect(star.x, star.y, star.size, star.size);
        }
        
        // Draw particles
        for (const particle of this.particles) {
            ctx.globalAlpha = particle.alpha;
            
            if (particle.shape === 'plus') {
                // Draw plus/cross shape for heal effect
                ctx.fillStyle = particle.color;
                ctx.fillRect(particle.x, particle.y, particle.size, particle.size / 2);
                ctx.fillRect(particle.x + particle.size / 4, particle.y - particle.size / 4, particle.size / 2, particle.size);
            } else {
                // Normal particle
                ctx.fillStyle = particle.color;
                ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            }
        }
        
        // Draw notifications
        ctx.globalAlpha = 1;
        for (const notification of this.notifications) {
            ctx.fillStyle = `rgba(255, 255, 255, ${notification.life / 120})`;
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(notification.text, notification.x, notification.y);
        }
    }
}
