
var MintLight = pc.createScript('mintingLight');

MintLight.prototype.initialize = function () {
	this.mainPlayer = this.app.root.findByName('playerSloth');
	this.spotPos = this.entity.getPosition();
	this.isMinting = false;
	console.log(this.app)
	console.log(this.spotPos)
}

MintLight.prototype.startMint = async function () {
	console.log('minting started')
	var res = await window.slothopiaWeb3._mintAvatar(window.ethereum.selectedAddress);
	console.log('mint Avatar res = ', res)
	if(res){
		setTimeout(this.checkAvatars(), 10000);
	}
}

MintLight.prototype.checkAvatars = async function() {
	var tokenID = await window.slothopiaWeb3._getLastToken(window.ethereum.selectedAddress);
		console.log('tokenID res = ', tokenID)
	if(tokenID !== "-1"){
		await window.slothopiaWeb3._getAvatar(tokenID).then((res) => this.replaceAvatar(res));
	}
}

MintLight.prototype.replaceAvatar = async function (_url) {
	console.log('replacing avatar');
	console.log('avatarURL = ', _url);
	var app = this.app
	var _player = this.mainPlayer;
	await app.assets.loadFromUrl(_url,'container', function(err, asset){
            if(!err && asset){
               app.assets.add(asset);
               console.log('added avatar as an asset');
               _player.model.asset = asset.resource.model.id;
               console.log('changed main player model asset');
               app.assets.load(asset);
            }
        });
	// this.editParams();
}


MintLight.prototype.editParams = function () {
	console.log('editing params')
	this.mainPlayer.setEulerAngles(0,-90,-90);
	console.log('setting euler angles');
	var cam = this.app.root.findByName('AbsCamera');
	cam.setLocalPosition(0, 14, 10);
	console.log('setting AbsCamera');
}

MintLight.prototype.update = function (dt) {
	var temp = this.mainPlayer.getPosition();
	if(!this.isMinting && temp.x >= this.spotPos.x-10 && temp.x <= this.spotPos.x+10 && temp.z >= this.spotPos.z-10 && temp.z <= this.spotPos.z+10){
		this.isMinting = true;
		this.startMint();
	}
}

