class Utils {
    // Detekce kolize dvou objektů (používá se např. pro detekci kolize střely a nepřítele)
    static collides(obj1, obj2) {
        return (
            obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y
        );
    }
    
    // Normalizace vektoru (používá se pro diagonální pohyb)
    static normalize(x, y) {
        const length = Math.sqrt(x * x + y * y);
        return {
            x: x / length,
            y: y / length
        };
    }
    
    // Výpočet vzdálenosti mezi dvěma body
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Úhel mezi dvěma body (používá se pro zaměřování střel)
    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    // Převod úhlu na směrový vektor
    static angleToVector(angle, speed = 1) {
        return {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
    }
    
    // Vytvoření náhodného ID
    static generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    // Omezení hodnoty do rozmezí (min, max)
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    // Lineární interpolace
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    // Převod stupňů na radiány
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Převod radiánů na stupně
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
}
