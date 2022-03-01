// Create PlayerMovement script.
const PlayerMovement = pc.createScript('PlayerMovement');

// Add attributes to the script.
PlayerMovement.attributes.add('movementSpeed', {
    type: 'number',
    default: 1
});

PlayerMovement.attributes.add('movementMultiplier', {
    type: 'number',
    default: 2.0
});

PlayerMovement.attributes.add('jumpPower', {
    type: 'number',
    default: 400.0
});

PlayerMovement.attributes.add('raycastPlayerBase', {
    type: 'entity'
});

PlayerMovement.attributes.add('cameraEntity', {
    type: 'entity'
});

// Initialisation code, runs only once.
PlayerMovement.prototype.initialize = function() {
    this.eulers = new pc.Vec3();
    this.force = new pc.Vec3();
    this.jumping = {
        state: false
    };
    this.running = {
        state: false
    };
};

// Update code, runs every frame.
PlayerMovement.prototype.update = function(dt) {
    // Get application reference.
    const app = this.app;
    
    // Get players force vector.
    const force = this.force;
    
    // Get camera direction vectors.
    const forward = this.cameraEntity.forward;
    const right = this.cameraEntity.right;
    // Movement logic. Listen for key presses and apply changes to directional vector components.
    let x = 0;
    let z = 0;
    
    if (app.keyboard.isPressed(pc.KEY_W)) {
        x += forward.x;
        z += forward.z;
    }
    
    if (app.keyboard.isPressed(pc.KEY_A)) {
        x -= right.x;
        z -= right.z;
    }
    
    if (app.keyboard.isPressed(pc.KEY_S)) {
        x -= forward.x;
        z -= forward.z;
    }

    if (app.keyboard.isPressed(pc.KEY_D)) {
        x += right.x;
        z += right.z;
    }
    
    if (app.keyboard.isPressed(pc.KEY_SHIFT)) {
        this.running.state = true;
    } else {
        this.running.state = false;
    }
    
    // Jump code, checking if the space key was pressed instead of is pressed. This is important as we don't want to call the jump code multiple times.
    // We set a jump state to ensure that we can't jump whilst already jumping.
    // The jump power is passed in from the script attributes. This should be a high number.
    if (app.keyboard.wasPressed(pc.KEY_SPACE)) {
        if (this.jumping.state === false) {
            this.entity.rigidbody.applyImpulse(0, this.jumpPower, 0);
            this.jumping.state = true;
        }
    } else if (this.jumping.state === true) {
        // If the raycast finds a collision, we assume it is an object we can land on, we therefor reset our jump state so we can jump again.
        if (this._checkBelow() !== null) {
            this.jumping.state = false;
        }
    }
    
    // Convert x and z directional vector components to a force vector, normalise and then scale to the movement speed.
    if (x !== 0 || z !== 0) {
        this._rotatePlayer();
        
        x *= dt;
        z *= dt;
        
        if (this.running.state === true) {
            force.set(x, 0, z).normalize().scale(this.movementSpeed * this.movementMultiplier);
        } else {
            force.set(x, 0, z).normalize().scale(this.movementSpeed);
        }
        
        this.entity.translate(force);
        this.entity.rigidbody.applyForce(force);
        this.entity.rigidbody.syncEntityToBody();
    }


};

// Rotate the player to face the same direction as the camera angle.
PlayerMovement.prototype._rotatePlayer = function() {
    const targetY = this.cameraEntity.script.PlayerCameraMovement.eulers.x;
    const targetAngle = new pc.Vec3(0, targetY, 0);
    
    this.entity.setEulerAngles(targetAngle);
    this.entity.rigidbody.syncEntityToBody();
};

// Raycast for checking if there is an entity below with collision and rigid body components. Returns null if no collision.
// Make sure the scene has a entity to use as a raycast point at the base of your character.
PlayerMovement.prototype._checkBelow = function() {
    return this.app.systems.rigidbody.raycastFirst(this.entity.getPosition(), this.raycastPlayerBase.getPosition());
};