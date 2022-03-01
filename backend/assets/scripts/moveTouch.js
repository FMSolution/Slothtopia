
pc = window['pc']
const movingTouch = pc.createScript('movingTouch');


movingTouch.prototype.initialize = function(){
	console.log(this.entity.getPosition());
	console.log(this.entity)
}



movingTouch.prototype.update = function (dt) {
    var keyboard = this.app.keyboard;
    var forward = this.entity.forward;
    var right = this.entity.right;

    var x = 0;
    var z = 0; 

    if (keyboard.isPressed(pc.KEY_A)) {
        x -= right.x;
        z -= right.z;
    }

    if (keyboard.isPressed(pc.KEY_D)) {
        x += right.x;
        z += right.z;
    }

    if (keyboard.isPressed(pc.KEY_W)) {
        x += forward.x;
        z += forward.z;
    }

    if (keyboard.isPressed(pc.KEY_S)) {
        x -= forward.x;
        z -= forward.z;
    }

    if (x !== 0 || z !== 0) {
        var pos = new pc.Vec3(x * dt, 0, z * dt);
        pos.add(this.entity.getPosition());
        this.entity.setPosition(pos);
    }
};
