class SkinShop {
    constructor(game) {
        this.game = game;
        this.availableSkins = [
            {
                id: 'default',
                name: 'Základní',
                description: 'Standardní loď vesmírné flotily. Vyvážená pro začátečníky.',
                price: 0,
                unlocked: true,
                colors: {
                    primary: '#5ff',
                    thruster: '#f70'
                },
                health: 100,
                healthRegen: 5,
                shootCooldown: 15,
                ultimateCharge: 1.0,
                weaponPower: 1.0,
                dashDuration: 20,
                specialShape: null,
                effectDescription: 'Vyvážená ve všech ohledech'
            },
            {
                id: 'redFury',
                name: 'Rudá Fúrie',
                description: 'Útočná loď s vysokým poškozením, ale nižší výdrží.',
                price: 1000,
                unlocked: false,
                colors: {
                    primary: '#f55',
                    thruster: '#ff0'
                },
                health: 75, // Lower health
                healthRegen: 3, // Lower regen
                shootCooldown: 12, // Faster shooting
                ultimateCharge: 1.1, // Faster ultimate charge
                weaponPower: 1.2, // Higher damage
                dashDuration: 18,
                specialShape: null,
                effectDescription: 'Rychlá střelba, nižší zdraví'
            },
            {
                id: 'ghostRider',
                name: 'Přízračný Jezdec',
                description: 'Rychlá a agilní loď specializovaná na úhyby.',
                price: 2000,
                unlocked: false,
                colors: {
                    primary: '#aaf',
                    thruster: '#50f'
                },
                health: 85,
                healthRegen: 4,
                shootCooldown: 16,
                ultimateCharge: 0.9,
                weaponPower: 0.9,
                dashDuration: 30, // Much longer dash
                specialShape: null,
                effectDescription: '+50% k trvání úhybu, nižší poškození'
            },
            {
                id: 'emeraldWing',
                name: 'Smaragdové Křídlo',
                description: 'Obranná loď s vysokou odolností a lepší regenerací.',
                price: 3000,
                unlocked: false,
                colors: {
                    primary: '#5f5',
                    thruster: '#0f5'
                },
                health: 150, // Higher health
                healthRegen: 8, // Higher regen
                shootCooldown: 18, // Slower shooting
                ultimateCharge: 0.8, // Slower ultimate
                weaponPower: 0.8, // Lower damage
                dashDuration: 20,
                damageReduction: 0.2, // 20% damage reduction
                specialShape: null,
                effectDescription: '+50% zdraví, 20% redukce poškození'
            },
            {
                id: 'goldenPhoenix',
                name: 'Zlatý Fénix',
                description: 'Legendární loď s unikátním designem a silnou ultimátní schopností.',
                price: 5000,
                unlocked: false,
                colors: {
                    primary: '#fd5',
                    thruster: '#f55'
                },
                health: 110,
                healthRegen: 5,
                shootCooldown: 14,
                ultimateCharge: 1.3, // Much faster ultimate
                weaponPower: 1.1,
                dashDuration: 22,
                specialShape: 'phoenix',
                effectDescription: '+30% rychlost nabíjení ultimátky'
            },
            {
                id: 'darkMatter',
                name: 'Temná Hmota',
                description: 'Experimentální loď s vysokým poškozením a ultimátní zničující silou.',
                price: 10000,
                unlocked: false,
                colors: {
                    primary: '#63c',
                    thruster: '#a0f'
                },
                health: 90,
                healthRegen: 4,
                shootCooldown: 14,
                ultimateCharge: 1.0,
                weaponPower: 1.5, // Much higher damage
                dashDuration: 18,
                specialShape: 'blade',
                effectDescription: '+50% k síle zbraní, nižší zdraví'
            }
        ];
        
        // Current selected skin
        this.currentSkinId = 'default';
        
        // Load saved data
        this.loadSavedData();
        
        // Create UI elements
        this.createShopUI();
    }
    
    loadSavedData() {
        try {
            const savedData = localStorage.getItem('spaceArcadeData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.points = data.points || 0;
                this.highestWave = data.highestWave || 0;
                
                // Unlock purchased skins
                if (data.unlockedSkins) {
                    data.unlockedSkins.forEach(skinId => {
                        const skin = this.availableSkins.find(s => s.id === skinId);
                        if (skin) skin.unlocked = true;
                    });
                }
                
                // Set current skin
                if (data.currentSkin) {
                    this.currentSkinId = data.currentSkin;
                }
            } else {
                this.points = 0;
                this.highestWave = 0;
            }
        } catch (e) {
            console.error("Error loading saved data:", e);
            this.points = 0;
            this.highestWave = 0;
        }
    }
    
    saveData() {
        try {
            const unlockedSkins = this.availableSkins
                .filter(skin => skin.unlocked)
                .map(skin => skin.id);
            
            const data = {
                points: this.points,
                highestWave: this.highestWave,
                unlockedSkins,
                currentSkin: this.currentSkinId
            };
            
            localStorage.setItem('spaceArcadeData', JSON.stringify(data));
        } catch (e) {
            console.error("Error saving data:", e);
        }
    }
    
    createShopUI() {
        // Create shop container
        const shopContainer = document.createElement('div');
        shopContainer.id = 'skin-shop';
        shopContainer.className = 'menu hidden';
        
        // Create header section
        const headerSection = document.createElement('div');
        headerSection.className = 'shop-header';
        
        const header = document.createElement('h2');
        header.className = 'shop-title';
        header.textContent = 'Obchod se Skiny';
        
        // Points display
        const pointsDisplay = document.createElement('div');
        pointsDisplay.id = 'shop-points';
        pointsDisplay.className = 'shop-points';
        pointsDisplay.innerHTML = `<span class="coin-icon"></span> <span class="price-amount">${this.points}</span>`;
        
        // Přidat tlačítko "Zpět" i do horní části
        const topBackButton = document.createElement('button');
        topBackButton.className = 'button-back top-back-button';
        topBackButton.textContent = 'Zpět do Menu';
        topBackButton.addEventListener('click', () => {
            document.getElementById('skin-shop').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
        });
        
        headerSection.appendChild(header);
        headerSection.appendChild(pointsDisplay);
        headerSection.appendChild(topBackButton); // Přidání horního tlačítka zpět
        
        // Create skins container
        const skinsContainer = document.createElement('div');
        skinsContainer.className = 'skins-container';
        
        // Create footer section
        const footerSection = document.createElement('div');
        footerSection.className = 'shop-footer';
        
        // Create back button
        const backButton = document.createElement('button');
        backButton.className = 'button-back';
        backButton.textContent = 'Zpět do Menu';
        backButton.addEventListener('click', () => {
            document.getElementById('skin-shop').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
        });
        
        footerSection.appendChild(backButton);
        
        // Add everything to shop container
        shopContainer.appendChild(headerSection);
        shopContainer.appendChild(skinsContainer);
        shopContainer.appendChild(footerSection);
        
        // Add shop container to the page
        document.getElementById('game-container').appendChild(shopContainer);
        
        // Populate with skins
        this.updateShopUI();
        
        // Add shop button to main menu
        const mainMenu = document.getElementById('main-menu');
        const shopButton = document.createElement('button');
        shopButton.id = 'shop-button';
        shopButton.textContent = 'Obchod se Skiny';
        shopButton.addEventListener('click', () => {
            mainMenu.classList.add('hidden');
            shopContainer.classList.remove('hidden');
            this.updateShopUI(); // Make sure the data is fresh
        });
        
        mainMenu.appendChild(shopButton);
    }
    
    updateShopUI() {
        const skinsContainer = document.querySelector('.skins-container');
        skinsContainer.innerHTML = ''; // Clear existing content
        
        // Update points display
        const pointsDisplay = document.querySelector('#shop-points .price-amount');
        pointsDisplay.textContent = this.points;
        
        // Add each skin to the container
        this.availableSkins.forEach(skin => {
            const skinElement = document.createElement('div');
            skinElement.className = `skin-item ${skin.unlocked ? 'unlocked' : 'locked'} ${this.currentSkinId === skin.id ? 'selected' : ''}`;
            skinElement.dataset.skinId = skin.id;
            
            // Create status badge
            let statusBadge = '';
            if (this.currentSkinId === skin.id) {
                statusBadge = `<div class="skin-status-badge badge-equipped">Vybráno</div>`;
            } else if (!skin.unlocked) {
                statusBadge = `<div class="skin-status-badge badge-locked">Zamčeno</div>`;
            }
            
            // Create preview section
            const preview = document.createElement('div');
            preview.className = 'skin-preview';
            
            // Add animated stars background
            const starsBackground = document.createElement('div');
            starsBackground.className = 'preview-background';
            
            // Create 20 random stars
            for (let i = 0; i < 20; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = `${Math.random() * 100}%`;
                star.style.top = `${Math.random() * 100}%`;
                star.style.opacity = `${Math.random() * 0.7 + 0.3}`;
                starsBackground.appendChild(star);
            }
            
            // Create enhanced ship preview with SVG
            const shipPreview = document.createElement('div');
            shipPreview.className = 'ship-preview-container';
            
            // Create SVG ship model based on skin type
            const shipSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            shipSvg.setAttribute('width', '100');
            shipSvg.setAttribute('height', '100');
            shipSvg.setAttribute('viewBox', '0 0 100 100');
            shipSvg.classList.add('ship-model-svg');
            
            // Different ship shapes based on special shape
            if (skin.specialShape === 'phoenix') {
                // Phoenix shape
                const shipPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                shipPath.setAttribute('d', 'M50,20 C60,30 80,50 70,75 Q60,85 50,80 Q40,85 30,75 C20,50 40,30 50,20 Z');
                shipPath.setAttribute('fill', skin.colors.primary);
                shipSvg.appendChild(shipPath);
                
                // Eye/core
                const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                core.setAttribute('cx', '50');
                core.setAttribute('cy', '40');
                core.setAttribute('r', '8');
                core.setAttribute('fill', skin.colors.thruster);
                shipSvg.appendChild(core);
                
                // Wing details
                const wingDetails = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                wingDetails.setAttribute('d', 'M50,40 C60,45 70,60 60,70 M50,40 C40,45 30,60 40,70');
                wingDetails.setAttribute('stroke', 'rgba(255,255,255,0.6)');
                wingDetails.setAttribute('fill', 'none');
                wingDetails.setAttribute('stroke-width', '1');
                shipSvg.appendChild(wingDetails);
            } else if (skin.specialShape === 'blade') {
                // Blade shape
                const shipPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                shipPath.setAttribute('d', 'M50,20 C60,30 70,40 65,60 L55,80 L50,75 L45,80 L35,60 C30,40 40,30 50,20 Z');
                shipPath.setAttribute('fill', skin.colors.primary);
                shipSvg.appendChild(shipPath);
                
                // Energy core
                const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
                gradient.id = `core-gradient-${skin.id}`;
                
                const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop1.setAttribute('offset', '0%');
                stop1.setAttribute('stop-color', 'white');
                
                const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop2.setAttribute('offset', '40%');
                stop2.setAttribute('stop-color', skin.colors.thruster);
                
                const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop3.setAttribute('offset', '100%');
                stop3.setAttribute('stop-color', 'rgba(100,0,200,0.5)');
                
                gradient.appendChild(stop1);
                gradient.appendChild(stop2);
                gradient.appendChild(stop3);
                
                const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                defs.appendChild(gradient);
                shipSvg.appendChild(defs);
                
                const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                core.setAttribute('cx', '50');
                core.setAttribute('cy', '45');
                core.setAttribute('r', '10');
                core.setAttribute('fill', `url(#core-gradient-${skin.id})`);
                shipSvg.appendChild(core);
                
                // Energy lines
                const energyLines = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                energyLines.setAttribute('d', 'M50,30 L65,50 M50,30 L35,50');
                energyLines.setAttribute('stroke', skin.colors.thruster);
                energyLines.setAttribute('stroke-width', '2');
                shipSvg.appendChild(energyLines);
            } else {
                // Default fighter shape
                const shipPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                shipPath.setAttribute('d', 'M50,20 C65,40 75,60 60,80 L40,80 C25,60 35,40 50,20 Z');
                shipPath.setAttribute('fill', skin.colors.primary);
                shipSvg.appendChild(shipPath);
                
                // Cockpit
                const cockpit = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                cockpit.setAttribute('cx', '50');
                cockpit.setAttribute('cy', '35');
                cockpit.setAttribute('rx', '8');
                cockpit.setAttribute('ry', '8');
                cockpit.setAttribute('fill', 'rgba(150, 230, 240, 0.8)');
                shipSvg.appendChild(cockpit);
                
                // Wings
                const leftWing = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                leftWing.setAttribute('d', 'M40,50 L25,60 L35,70 L40,65 Z');
                leftWing.setAttribute('fill', skin.colors.primary);
                shipSvg.appendChild(leftWing);
                
                const rightWing = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                rightWing.setAttribute('d', 'M60,50 L75,60 L65,70 L60,65 Z');
                rightWing.setAttribute('fill', skin.colors.primary);
                shipSvg.appendChild(rightWing);
                
                // Details
                const details = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                details.setAttribute('x1', '50');
                details.setAttribute('y1', '45');
                details.setAttribute('x2', '50');
                details.setAttribute('y2', '70');
                details.setAttribute('stroke', 'rgba(255,255,255,0.5)');
                details.setAttribute('stroke-width', '1');
                shipSvg.appendChild(details);
            }
            
            // Add thrusters
            const thruster = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            thruster.setAttribute('d', 'M40,80 L50,95 L60,80 Z');
            thruster.setAttribute('fill', skin.colors.thruster);
            thruster.classList.add('thruster-animation');
            shipSvg.appendChild(thruster);
            
            shipPreview.appendChild(shipSvg);
            preview.appendChild(starsBackground);
            preview.appendChild(shipPreview);
            preview.innerHTML += statusBadge;
            
            // Create info section with statistics display - opravené zobrazení statistik
            let effectHtml = '';
            if (skin.effectDescription) {
                // Výpočet procentuálních hodnot pro vizualizaci statistik
                const baseValues = {
                    health: 100,       // Základní hodnota zdraví (default skin)
                    weaponPower: 1.0,  // Základní hodnota útoku
                    shootCooldown: 15  // Základní hodnota rychlosti střelby
                };
                
                // Vypočítej procentuální hodnoty vztažené k základním hodnotám
                const healthPercent = Math.min(Math.round((skin.health / baseValues.health) * 100), 200);
                const attackPercent = Math.min(Math.round((skin.weaponPower / baseValues.weaponPower) * 100), 200);
                const speedPercent = Math.min(Math.round((baseValues.shootCooldown / skin.shootCooldown) * 100), 200);
                
                effectHtml = `
                <div class="skin-effect">${skin.effectDescription}</div>
                <div class="skin-stats">
                    <div class="stat-item">
                        <span class="stat-label">Zdraví:</span>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${healthPercent}%; background-color: #33cc33;"></div>
                        </div>
                        <span class="stat-value">${skin.health}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Útok:</span>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${attackPercent}%; background-color: #ff3333;"></div>
                        </div>
                        <span class="stat-value">x${skin.weaponPower.toFixed(1)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Rychlost:</span>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${speedPercent}%; background-color: #3399ff;"></div>
                        </div>
                        <span class="stat-value">${Math.round((baseValues.shootCooldown / skin.shootCooldown) * 100)}%</span>
                    </div>
                </div>`;
            }
            
            const actionsHtml = this.createActionsHtml(skin);
            
            // Combine all elements
            skinElement.innerHTML = `
                ${preview.outerHTML}
                <div class="skin-info">
                    <h3>${skin.name}</h3>
                    <div class="skin-description">${skin.description}</div>
                    ${effectHtml}
                    ${actionsHtml}
                </div>
            `;
            
            skinsContainer.appendChild(skinElement);
            
            // Add event listeners after adding to DOM
            if (skin.unlocked) {
                if (this.currentSkinId !== skin.id) {
                    const selectBtn = skinElement.querySelector('.button-select');
                    if (selectBtn) {
                        selectBtn.addEventListener('click', () => this.selectSkin(skin.id));
                    }
                }
            } else {
                const buyBtn = skinElement.querySelector('.button-buy');
                if (buyBtn) {
                    buyBtn.addEventListener('click', () => this.buySkin(skin.id));
                }
            }
        });
        
        // Add animations and hover effects for ships in the shop
        document.querySelectorAll('.ship-model-svg').forEach(model => {
            const parent = model.closest('.skin-item');
            
            // Add pulsing animation to thrusters
            const thruster = model.querySelector('.thruster-animation');
            if (thruster) {
                // Use CSS animation instead of manual animation
                thruster.style.animation = 'thrusterPulse 1.5s infinite';
            }
            
            // Add hover effect
            parent.addEventListener('mouseenter', () => {
                model.style.transform = 'translateY(-5px)';
                model.style.filter = 'drop-shadow(0 0 8px ' + (model.querySelector('path').getAttribute('fill')) + ')';
            });
            
            parent.addEventListener('mouseleave', () => {
                model.style.transform = 'translateY(0)';
                model.style.filter = 'none';
            });
        });
    }
    
    createActionsHtml(skin) {
        if (skin.unlocked) {
            if (this.currentSkinId === skin.id) {
                return '<div class="skin-actions"><div class="selection-indicator">✓ Aktivní</div></div>';
            } else {
                return '<div class="skin-actions"><button class="button-action button-select">Vybrat</button></div>';
            }
        } else {
            const canAfford = this.points >= skin.price;
            return `
                <div class="skin-actions">
                    <div class="skin-price">
                        <div class="coin-icon"></div>
                        <div class="price-amount ${canAfford ? 'can-afford' : 'cannot-afford'}">${skin.price}</div>
                    </div>
                    <button class="button-action button-buy" ${canAfford ? '' : 'disabled'}>Koupit</button>
                </div>
            `;
        }
    }
    
    buySkin(skinId) {
        const skin = this.availableSkins.find(s => s.id === skinId);
        if (!skin || skin.unlocked || this.points < skin.price) return;
        
        // Purchase the skin
        this.points -= skin.price;
        skin.unlocked = true;
        this.currentSkinId = skinId; // Automatically select the new skin
        
        // Show purchase animation
        this.showPurchaseAnimation(skinId);
        
        // Save and update UI
        this.saveData();
        
        // Delay UI update for animation
        setTimeout(() => {
            this.updateShopUI();
        }, 1000);
    }
    
    showPurchaseAnimation(skinId) {
        const skinElement = document.querySelector(`.skin-item[data-skin-id="${skinId}"]`);
        if (!skinElement) return;
        
        // Create a flash overlay
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'white';
        flash.style.opacity = '0';
        flash.style.zIndex = '10';
        flash.style.pointerEvents = 'none';
        flash.style.transition = 'opacity 0.3s ease-in-out';
        
        skinElement.style.position = 'relative';
        skinElement.appendChild(flash);
        
        // Animate flash
        setTimeout(() => {
            flash.style.opacity = '0.8';
            setTimeout(() => {
                flash.style.opacity = '0';
                setTimeout(() => {
                    flash.remove();
                }, 300);
            }, 300);
        }, 10);
        
        // Create unlocked text
        const unlockedText = document.createElement('div');
        unlockedText.style.position = 'absolute';
        unlockedText.style.top = '50%';
        unlockedText.style.left = '50%';
        unlockedText.style.transform = 'translate(-50%, -50%) scale(0)';
        unlockedText.style.color = '#5ff';
        unlockedText.style.fontSize = '24px';
        unlockedText.style.fontWeight = 'bold';
        unlockedText.style.textShadow = '0 0 10px #5ff';
        unlockedText.style.zIndex = '11';
        unlockedText.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        unlockedText.textContent = 'Odemčeno!';
        
        skinElement.appendChild(unlockedText);
        
        // Animate text
        setTimeout(() => {
            unlockedText.style.transform = 'translate(-50%, -50%) scale(1.2)';
            setTimeout(() => {
                unlockedText.style.transform = 'translate(-50%, -50%) scale(1)';
                setTimeout(() => {
                    unlockedText.style.opacity = '0';
                    setTimeout(() => {
                        unlockedText.remove();
                    }, 500);
                }, 800);
            }, 200);
        }, 300);
    }
    
    selectSkin(skinId) {
        const skin = this.availableSkins.find(s => s.id === skinId);
        if (!skin || !skin.unlocked) return;
        
        this.currentSkinId = skinId;
        
        // Save and update UI
        this.saveData();
        this.updateShopUI();
    }
    
    getCurrentSkin() {
        return this.availableSkins.find(s => s.id === this.currentSkinId);
    }
    
    addPoints(amount) {
        this.points += amount;
        this.saveData();
    }
    
    updateHighestWave(wave) {
        if (wave > this.highestWave) {
            // Award bonus points for reaching new highest wave
            const bonusPoints = (wave - this.highestWave) * 100;
            this.addPoints(bonusPoints);
            this.highestWave = wave;
            this.saveData();
            return bonusPoints;
        }
        return 0;
    }
}
