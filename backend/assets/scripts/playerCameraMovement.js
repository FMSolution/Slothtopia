// Create PlayerCameraMovement script.
const PlayerCameraMovement = pc.createScript('PlayerCameraMovement');

// Define script-scoped variables.
let deltaTime = 0;

// Add attributes to the script.
PlayerCameraMovement.attributes.add('mouseSensitivity', {
    type: 'number',
    default: 1.33
});

PlayerCameraMovement.attributes.add('viewEntity', {
    type: 'entity'
});

PlayerCameraMovement.attributes.add('cameraTargetEntity', {
    type: 'entity'
});

PlayerCameraMovement.attributes.add('raycastCameraClip', {
    type: 'entity'
});

// Initialisation code, runs only once.
PlayerCameraMovement.prototype.initialize = function() {
    this.eulers = new pc.Vec3();
    
    const app = this.app;
    
    app.mouse.on('mousemove', this._onMouseMove, this);
    app.mouse.on('mousedown', function() {
        app.mouse.enablePointerLock();
    }, this);
};

// Update code, runs every frame.
PlayerCameraMovement.prototype.update = function(dt) {
    // Update the script-scoped variable deltaTime with the delta time passed into the update function. This is used for the camera angle calculations.
    deltaTime = dt;
    
    const targetY = this.eulers.x + 180;
    const targetX = this.eulers.y;
    const targetAngle = new pc.Vec3(-targetX, targetY, 0);
    
    this.viewEntity.setEulerAngles(targetAngle);
    this.entity.setPosition(this._getWorldPoint());
    this.entity.lookAt(this.cameraTargetEntity.getPosition());
};

// Update camera angle from mouse events.
PlayerCameraMovement.prototype._onMouseMove = function(e) {
    if (pc.Mouse.isPointerLocked()) {
        this.eulers.x -= (this.mouseSensitivity * e.dx * deltaTime) % 360;
        this.eulers.y += (this.mouseSensitivity * e.dy * deltaTime) % 360;

        if (this.eulers.x < 0) this.eulers.x += 360;
        if (this.eulers.y < 0) this.eulers.y += 360;
    }
};

// Raycast from the camera to the raycast end point.
PlayerCameraMovement.prototype._getWorldPoint = function() {
    const startPoint = this.viewEntity.getPosition();
    const endPoint = this.raycastCameraClip.getPosition();
    const hitPoint = this.app.systems.rigidbody.raycastFirst(startPoint, endPoint);
    
    return (hitPoint !== null) ? hitPoint.point : endPoint;
};