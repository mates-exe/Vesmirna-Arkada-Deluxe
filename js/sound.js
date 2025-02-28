class SoundManager {
    constructor() {
        this.sounds = {};
        this.musicPlaying = false;
        this.soundsLoaded = false;
        
        // Přidání zvuků do hry (předem je nahraj)
        this.loadSounds();
    }
    
    loadSounds() {
        const soundFiles = {
            'shoot': 'sounds/shoot.wav',
            'explode': 'sounds/explode.wav',
            'hit': 'sounds/hit.wav',
            'powerup': 'sounds/powerup.wav',
            'boss': 'sounds/boss.wav',
            'bossExplode': 'sounds/boss_explode.wav',
            'heal': 'sounds/heal.wav',
            'dash': 'sounds/dash.wav',
            'ultimate': 'sounds/ultimate.wav',
            'gameOver': 'sounds/game_over.wav',
            'music': 'sounds/music.mp3'
        };
        
        let loadedCount = 0;
        const totalSounds = Object.keys(soundFiles).length;
        
        // Vytvoř adresář pro zvuky, pokud neexistuje
        this.createSoundDirectory();
        
        for (const [name, file] of Object.entries(soundFiles)) {
            try {
                const audio = new Audio();
                audio.src = file;
                
                // Snížení hlasitosti pro některé zvuky
                if (name === 'music') {
                    audio.volume = 0.4;
                    audio.loop = true;
                } else if (name === 'shoot') {
                    audio.volume = 0.2;
                }
                
                audio.addEventListener('canplaythrough', () => {
                    loadedCount++;
                    if (loadedCount === totalSounds) {
                        this.soundsLoaded = true;
                        console.log('All sounds loaded successfully!');
                    }
                }, { once: true });
                
                audio.addEventListener('error', (e) => {
                    console.warn(`Failed to load sound: ${name} (${file})`, e);
                    loadedCount++; // Počítej i neúspěšné načtení, aby se hra mohla spustit
                    if (loadedCount === totalSounds) {
                        this.soundsLoaded = true;
                        console.log('Sound loading complete with some errors.');
                    }
                });
                
                this.sounds[name] = audio;
            } catch (e) {
                console.error(`Error setting up sound: ${name}`, e);
                loadedCount++;
            }
        }
    }
    
    createSoundDirectory() {
        // Pomocná metoda - zvuky budou fungovat i bez ní,
        // ale hráč může být informován, že potřebuje přidat zvukové soubory
        try {
            const soundsDir = '/c:/Users/matej/Downloads/game/sounds';
            console.log(`Info: Game will work without sounds if '${soundsDir}' directory doesn't exist.`);
        } catch (e) {
            console.log('Sound directory check failed, but game will continue.');
        }
    }
    
    playSound(name) {
        // Bezpečnostní kontrola - pokud zvuk neexistuje, nic se nestane
        if (!this.sounds[name]) {
            console.warn(`Sound "${name}" not found`);
            return;
        }
        
        try {
            // Některé zvuky potřebujeme přehrát vícekrát současně
            if (name === 'shoot' || name === 'explode' || name === 'hit') {
                const clone = this.sounds[name].cloneNode();
                clone.volume = this.sounds[name].volume;
                clone.play().catch(e => console.warn('Sound play failed:', e));
            } else {
                // Ostatní zvuky stačí přehrát jednou
                const sound = this.sounds[name];
                sound.currentTime = 0;
                sound.play().catch(e => console.warn('Sound play failed:', e));
                
                // Zaznamenej, že hudba hraje
                if (name === 'music') {
                    this.musicPlaying = true;
                }
            }
        } catch (e) {
            console.warn(`Error playing sound "${name}":`, e);
        }
    }
    
    stopSound(name) {
        if (!this.sounds[name]) return;
        
        try {
            const sound = this.sounds[name];
            sound.pause();
            sound.currentTime = 0;
            
            if (name === 'music') {
                this.musicPlaying = false;
            }
        } catch (e) {
            console.warn(`Error stopping sound "${name}":`, e);
        }
    }
    
    toggleMute() {
        const muted = !this.sounds.music.muted;
        
        // Nastav všechny zvuky jako ztlumené/zapnuté
        for (const sound of Object.values(this.sounds)) {
            sound.muted = muted;
        }
        
        return muted;
    }
}
