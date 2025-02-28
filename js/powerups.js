class PowerupManager {
    constructor(game) {
        this.game = game;
        this.powerups = [];
        this.powerupChance = 0.1; // Base chance for enemy to drop powerup
        this.types = [
            { 
                type: 'weapon', 
                symbol: 'W', 
                color: '#ffcc00', 
                description: 'Vylepšení zbraně',
                rarity: 'common'
            },
            { 
                type: 'shield', 
                symbol: 'S', 
                color: '#3399ff', 
                description: 'Štít',
                rarity: 'uncommon'
            },
            { 
                type: 'boost', 
                symbol: 'B', 
                color: '#ff9900', 
                description: 'Zrychlení',
                rarity: 'uncommon'
            },
            { 
                type: 'laser', 
                symbol: 'L', 
                color: '#cc33ff', 
                description: 'Laserová zbraň',
                rarity: 'rare'
            },
            { 
                type: 'spread', 
                symbol: 'M', 
                color: '#00ffcc', 
                description: 'Rozptylová zbraň',
                rarity: 'rare'
            },
            { 
                type: 'heal', 
                symbol: 'H', 
                color: '#ff5566', 
                description: 'Lékárnička',
                rarity: 'rare'
            }
        ];
    }
    
    update() {
        const { player } = this.game;
        
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            powerup.y += powerup.speed;
            
            // Check for powerup collection
            if (Utils.collides(player, powerup)) {
                player.addPowerup(powerup.type);
                this.game.effects.createPowerupEffect(
                    player.x + player.width / 2,
                    player.y + player.height / 2,
                    powerup.color
                );
                
                // Show description
                this.game.effects.createNotification(
                    this.getPowerupDescription(powerup.type), 
                    this.game.canvas.width / 2, 
                    this.game.canvas.height - 100
                );
                
                this.powerups.splice(i, 1);
                continue;
            }
            
            // Remove powerups that go off screen
            if (powerup.y > this.game.canvas.height) {
                this.powerups.splice(i, 1);
            }
        }
    }
    
    getPowerupDescription(type) {
        switch(type) {
            case 'weapon': return 'Vylepšení zbraně!';
            case 'shield': return 'Štít aktivován!';
            case 'boost': return 'Zrychlení aktivováno!';
            case 'laser': return 'Získána laserová zbraň!';
            case 'spread': return 'Získána rozptylová zbraň!';
            case 'heal': return 'Získána lékárnička!';
            default: return 'Získán power-up!';
        }
    }
    
    spawnPowerupFromEnemy(x, y, wave) {
        // DŮLEŽITÁ OPRAVA - odstraněna dvojitá kontrola pravděpodobnosti
        // Pravděpodobnost už byla zkontrolována v destroyEnemy, takže zde
        // rovnou vytvoříme power-up bez další kontroly

        // Logika pro výběr typu power-upu
        let typeIndex;
        
        // Vyšší šance na lékárničky ve vyšších vlnách
        const healChance = 0.15 + (wave * 0.01);
        
        if (Math.random() < healChance) {
            // Najdi index typu "heal"
            typeIndex = this.types.findIndex(t => t.type === 'heal');
        } else {
            // Zjednodušená logika výběru typu podle rarity
            const rand = Math.random();
            
            // Vytvoření seznamů power-upů podle rarity
            const commonTypes = this.types.filter(t => t.rarity === 'common');
            const uncommonTypes = this.types.filter(t => t.rarity === 'uncommon');
            const rareTypes = this.types.filter(t => t.rarity === 'rare' && t.type !== 'heal');
            
            // Výběr typu podle pravděpodobnosti
            if (rand < 0.6) { // 60% common
                typeIndex = this.getRandomTypeIndex(commonTypes, uncommonTypes, rareTypes);
            } else if (rand < 0.9) { // 30% uncommon
                typeIndex = this.getRandomTypeIndex(uncommonTypes, commonTypes, rareTypes);
            } else { // 10% rare
                typeIndex = this.getRandomTypeIndex(rareTypes, uncommonTypes, commonTypes);
            }
        }
        
        // Pokud jsme nenašli platný index, použijeme náhodný
        if (typeIndex === undefined || typeIndex === -1) {
            typeIndex = Math.floor(Math.random() * this.types.length);
            console.log("Použit náhodný power-up, index:", typeIndex);
        }
        
        const powerupType = this.types[typeIndex];
        
        // Debug log pro sledování vytvořených power-upů
        console.log("Vytvořen power-up:", powerupType.type, "na pozici:", x, y);
        
        // Vytvoření power-upu
        this.powerups.push({
            x,
            y,
            width: 25,
            height: 25,
            speed: 2,
            type: powerupType.type,
            symbol: powerupType.symbol,
            color: powerupType.color,
            rotation: 0
        });
    }
    
    // Pomocná metoda pro výběr typu power-upu s preferencemi
    getRandomTypeIndex(primaryTypes, secondaryTypes, tertiaryTypes) {
        if (primaryTypes.length > 0) {
            const randomType = primaryTypes[Math.floor(Math.random() * primaryTypes.length)];
            return this.types.findIndex(t => t.type === randomType.type);
        } else if (secondaryTypes.length > 0) {
            const randomType = secondaryTypes[Math.floor(Math.random() * secondaryTypes.length)];
            return this.types.findIndex(t => t.type === randomType.type);
        } else if (tertiaryTypes.length > 0) {
            const randomType = tertiaryTypes[Math.floor(Math.random() * tertiaryTypes.length)];
            return this.types.findIndex(t => t.type === randomType.type);
        }
        return 0; // Default to the first type if nothing else is available
    }
    
    draw(ctx) {
        for (const powerup of this.powerups) {
            // Update rotation animation
            powerup.rotation += 0.05;
            
            // Draw powerup background
            ctx.save();
            ctx.translate(powerup.x + powerup.width/2, powerup.y + powerup.height/2);
            ctx.rotate(powerup.rotation);
            
            ctx.fillStyle = powerup.color;
            ctx.beginPath();
            ctx.arc(0, 0, powerup.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw outer glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = powerup.color;
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, powerup.width/2 + 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            
            // Draw symbol
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(powerup.symbol, 0, 0);
            
            ctx.restore();
        }
    }
}
