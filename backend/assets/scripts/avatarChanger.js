
const AvatarChanger = pc.createScript("AvatarChanger");



AvatarChanger.prototype.initialize = function() {
	console.log('initializing change')
	var pavatar = this.app.root.findByName('playerAvatar');
	this.app.root.removeChild('mainPlayer');
	this.app.root.findByTag('mainPlayer').destroy();
    console.log('changingavatar done');
};

// Update code, runs every frame.
AvatarChanger.prototype.update = function(dt) {

};