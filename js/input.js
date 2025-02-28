class InputHandler {
    constructor() {
        this.keys = {};
        this.keysPressed = {};
        this.keyReleasedCallbacks = {};
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.keysPressed[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            
            if (this.keyReleasedCallbacks[e.code]) {
                this.keyReleasedCallbacks[e.code]();
            }
        });
    }
    
    isKeyDown(keyCode) {
        return this.keys[keyCode] === true;
    }
    
    wasKeyPressed(keyCode) {
        if (this.keysPressed[keyCode]) {
            this.keysPressed[keyCode] = false;
            return true;
        }
        return false;
    }
    
    onKeyReleased(keyCode, callback) {
        this.keyReleasedCallbacks[keyCode] = callback;
    }
    
    resetKeys() {
        this.keysPressed = {};
    }
    
    // Movement direction helpers
    getHorizontalMovement() {
        const left = this.isKeyDown('ArrowLeft') || this.isKeyDown('KeyA') ? -1 : 0;
        const right = this.isKeyDown('ArrowRight') || this.isKeyDown('KeyD') ? 1 : 0;
        return left + right;
    }
    
    getVerticalMovement() {
        const up = this.isKeyDown('ArrowUp') || this.isKeyDown('KeyW') ? -1 : 0;
        const down = this.isKeyDown('ArrowDown') || this.isKeyDown('KeyS') ? 1 : 0;
        return up + down;
    }
    
    isShiftDown() {
        return this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight');
    }
    
    isCtrlDown() {
        return this.isKeyDown('ControlLeft') || this.isKeyDown('ControlRight');
    }
}
