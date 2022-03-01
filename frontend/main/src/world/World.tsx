import React, {useEffect, useState} from 'react';
import * as pc from 'playcanvas/build/playcanvas.js';
import SlothopiaW3  from '../service/contract';
import { wasmSupported, loadWasmModuleAsync } from '../helpers/wasm-loader.js';
import MainAssets from './MainAssets';
import Coms from './Communication';


interface PCAsset {
    name: string,
    extention:string,
    type: string,
    data?: any,
    url: string
};

interface PLYR {
    point: [number, number, number];
    timestamp: number;
    walletaddress: string;
    nft: string;
}

class SlothopiaWorld {
    public canvas:HTMLCanvasElement;
    private mainDiv:HTMLElement;
    private walletAddress:string;
    public isLoading:boolean;
    private isRunning:boolean;
    public plyrComs:Coms;
    public app:pc.Application;


    constructor(wAddr: string){
    	let canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
    	let mainDiv = document.getElementById('main') as HTMLElement;
        this.isLoading = true;
        this.isRunning = false;
        this.walletAddress = wAddr;
    	this.canvas = canvas;
    	this.mainDiv = mainDiv;
        this.plyrComs = this.initiatePlayer();
        this.app = this.startMain();
    }

    mintAvatar(){
        SlothopiaW3._mintAvatar(this.walletAddress)
    }

    initiatePlayer():Coms {
        var playerComs = new Coms(this.walletAddress);
        (window as any)["plyrComs"] = playerComs;
        return playerComs;
    }

    initiateApp(){
        // create the main playCanvas app
        const app = new pc.Application(this.canvas, {
                mouse: new pc.Mouse(document.body),
                touch: new pc.TouchDevice(document.body),
                keyboard: new pc.Keyboard(window),
            });
        app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);
        app.scene.gammaCorrection = pc.GAMMA_SRGB;
        app.scene.toneMapping = pc.TONEMAP_ACES;

        (window as any)["pc"] = pc;
        (window as any)["slothApp"] = app;
        return app
    }


    startMain(): pc.Application{
        this.activateWASM();
        const worldApp = this.initiateApp();
        this.checkPlayersAssets().then((res:any) => this.loadAssets(worldApp, res));
        this.showWorld(worldApp);
        return worldApp
    }


    decodeNFTURL(nftURL: string): string|undefined{
        return(nftURL.split('/')?.at(-1))
    }

    async checkPlayersAssets(): Promise<PCAsset[]>{
        var _worldAssets: Array<PCAsset> = MainAssets;
        const nft_ = await this.plyrComs._getNFTs()
        if(nft_ !== "" && nft_.includes('http')){
            var nftID = this.decodeNFTURL(nft_);
            if(nftID !== undefined){
                 const playerNFT: PCAsset = {
                name: nftID.replace('.glb',''),
                extention:'glb',
                type:'container',
                url:nft_
            }
            _worldAssets.unshift(playerNFT);
            }
        }
        return _worldAssets;
    }


    formAssetName(asset:PCAsset){
        return asset.name+'.'+asset.extention;
    }

    loadAssets(app: pc.Application, worldAssets:Array<PCAsset>){
        var _isFetchingAssets : boolean = false;
        for(var i=0; i<worldAssets.length; i++){
            if(app.assets.find(this.formAssetName(worldAssets[i])) != null){
                continue;
            }
            if(i === worldAssets.length -1){
                this.externalAssetLoads(app, worldAssets[i], true);
            }else{
                this.externalAssetLoads(app, worldAssets[i], false);
            }
        }
    }


    async externalAssetLoads(app: pc.Application, appAsset: PCAsset, updateMainState: boolean){
        var self = this;
        if(appAsset.type == 'texture'){
            //@ts-ignore
            app.loader.getHandler("texture").crossOrigin = "anonymous";
        }
        await app.assets.loadFromUrl(appAsset.url, appAsset.type, function(err, asset){
            if(!err && asset){
               app.assets.add(asset);
               if(updateMainState){
                self.isLoading = false;
               }
            }
        });
    }

    activateWASM(){
        if(wasmSupported()){
            loadWasmModuleAsync('Ammo', 'https://api.slothtopia.io/get/scripts/ammo.wasm.js', 'https://api.slothtopia.io/get/scripts/ammo.wasm.wasm', function(){console.log('loaded WASM')})
        }else{
            loadWasmModuleAsync('Ammo', 'https://api.slothtopia.io/get/scripts/ammo.js', '', function(){console.log('loaded WASM')})
        }
    }


    showWorld(app: pc.Application){
        var self = this;
        if(this.isLoading){
            const timer: ReturnType<typeof setTimeout> = setTimeout(() => this.showWorld(app), 10000);
            return;
        }else{
            if(!this.isRunning){
                mainRun();
                this.isRunning = true;
                document.getElementById('main-loading')?.remove();
            }
            
        }

        function changeAvatarModel(){
            // sloth to change  = newSloth
            // playerSloth.model.asset = nModel.resource.model.id
            var currentAvatar = app.assets.find('playerSloth');
            var newAvatar = app.assets.find('avatarMain');
            if(newAvatar !== null){
                //@ts-ignore
                currentAvatar.model.asset = newAvatar.resource.model.id;
            }

        }

       async function getGLBFile(glb_file: string){
            await self.externalAssetLoads(app, {name: 'avatarMain', extention:'glb', type:'container', url: glb_file}, false).then((res:any) => changeAvatarModel())     
        }



        function addSomeSloths(versePlayers:PLYR[]){

            const slothGLB = app.assets.find('sloth-demo.glb');
            const slothTemp = slothGLB.resource.instantiateModelEntity({
                castShadows: false
            });
            slothTemp.addComponent("collision", {
                    type: "box",
            });
            slothTemp.addComponent("rigidbody", {
                    type: pc.BODYTYPE_DYNAMIC,
                    angularDamping: 0,
                    angularFactor: pc.Vec3.ZERO,
                    friction: 0.75,
                    linearDamping: 0,
                    linearFactor: pc.Vec3.ONE,
                    mass: 80,
                    restitution: 0.5,
            });
            slothTemp.addComponent('anim', {
                activate:true,
                loop:false,
                speed:1.0,
            });
            slothTemp.setPosition(Math.floor(Math.random()*100),2,Math.floor(Math.random()*75));
            slothTemp.setLocalScale(2,2,2);
            app.root.addChild(slothTemp);
            slothTemp.anim.assignAnimation('idle', app.assets.find('idle.glb').resource);
        }

        // (window as any)["slothAddition"] = addSomeSloths

        function getLightingPosition():pc.Vec3{
            var x = Math.floor(Math.random()*175);
            var z = Math.floor(Math.random()*60);
            return new pc.Vec3(x, 6, z);
        }


        function getSlothStats(isMinted:boolean, prop:string){
            var nftURL = self.plyrComs['nft'];
            if(isMinted || (nftURL !== '')){
                if(prop === 'camera'){
                    return new pc.Vec3(0, 14, 10);
                }else{
                    return new pc.Vec3(0,-90,-90);
                }
            }else{
                if(prop === 'camera'){
                    return new pc.Vec3(0, 8, -5);
                }else{
                    return new pc.Vec3(0,-90, 0);
                }
            }
        }

        function getRandomNumber(max:number, bidirectional:boolean){
            if(bidirectional){
                var direc = Math.random() < 0.5 ? -1 : 1;
                return(Math.floor(Math.random()*max*direc));
            }
            return(Math.floor(Math.random()*max));
        }


        function addChairsToHouse(){
            var allPositions = [];
            const diningChair = app.assets.find('chair.glb');
            for(var i=0; i<8; i++){
                var _chair = diningChair.resource.instantiateModelEntity({
                    castShadows:false,
                });
                _chair.addComponent("rigidbody", {
                    type: pc.BODYTYPE_STATIC,
                });
                _chair.addComponent("collision", {
                    type:"box",
                    halfExtents: new pc.Vec3(5,5,5),
                });
                var _chairPos = new pc.Vec3(getRandomNumber((i+1)*10,true), 1, getRandomNumber((i+1)*12,true));
                // allPositions.push(_chairPos)
                _chair.setPosition(_chairPos);
                app.root.addChild(_chair);
            }
        }

    

        function mainRun(){
           
            // start the app
            app.start();

            const cBOX = app.assets.find('skyMain.dds');
            var cbTexture = cBOX.resource as pc.Texture;
            cbTexture.magFilter=1;
            cbTexture.minFilter=5;
            cbTexture.anisotropy=1;
            (cbTexture as any).rgbm=true;

            app.setSkybox(cBOX);
            app.scene.skyboxMip = 5;

            // render the auction house, as it is the heaviest file
            const auctionHouseGLB = app.assets.find('mainHouse.glb');
            const auctionHouse = auctionHouseGLB.resource.instantiateModelEntity({
                castShadows:false
            });
            // as there is no mesh-mesh collision it 
            // will be pointless to render a "collision" component here
            auctionHouse.addComponent("rigidbody", {
                type: pc.BODYTYPE_STATIC,
            });
            // translate the house so it sits above the ground
            auctionHouse.translate(0,8,0);
            // add it to the app
            app.root.addChild(auctionHouse);


            addChairsToHouse();

            // Create an Entity for the ground
            const ground = new pc.Entity('Ground');

            // create a collision component for gravity
            ground.addComponent("collision", {
                type:"box",
                halfExtents: new pc.Vec3(300, 1, 125),
            })
            // add a rigid body as static for friction
            ground.addComponent("rigidbody", {
                    type: pc.BODYTYPE_STATIC,
                    friction:0.75,
                    restitution:0.5,
            });
            // set a local scale for the ground 
            ground.setLocalScale(1, 1, 1);
            ground.setLocalPosition(0, 0, 0);
            // add the ground to the app
            app.root.addChild(ground);
            // Create a floor model 
            const floorModel = new pc.Entity();
            floorModel.addComponent("model", {
                type: "plane"
            });
            floorModel.setLocalPosition(0, -1, 0);
            floorModel.setLocalScale(550, 1, 250);
            ground.addChild(floorModel);

            // Create a camera that will be driven by the character controller
            const camera = new pc.Entity('AbsCamera');
            camera.addComponent("camera", {
                clearColor: new pc.Color(0.4, 0.45, 0.5),
                farClip: 500,
                fov: 75,
                nearClip: 0.1
            });
            camera.setLocalPosition(0, 14, 10);
            camera.setLocalEulerAngles(0,90,0);

            var _playerAvatar = self.plyrComs['nft'] !== "" ? self.decodeNFTURL(self.plyrComs['nft']) : "basic-sloth.glb";
            if(_playerAvatar === undefined){
                _playerAvatar = "basic-sloth.glb";
            }
            const slothGLB = app.assets.find(_playerAvatar);
            const sloth = slothGLB.resource.instantiateModelEntity({
                castShadows: false
            });
            sloth.name = "playerSloth";
            sloth.addComponent("collision", {
                    type: "box"
            });
            sloth.addComponent("rigidbody", {
                    type: pc.BODYTYPE_DYNAMIC,
                    angularDamping: 0,
                    angularFactor: pc.Vec3.ZERO,
                    friction: 0.75,
                    linearDamping: 0,
                    linearFactor: pc.Vec3.ONE,
                    mass: 80,
                    restitution: 0.5,
            });
            sloth.addComponent('anim', {
                activate:true,
                loop:false,
                speed:1.0,
            });

            sloth.addComponent("script");
            sloth.script.create("characterController");
            sloth.script.create("firstPersonCamera", {
                attributes: {
                    camera: camera,
                }
            });
            sloth.script.create("keyboardInput");
            sloth.script.create("mouseInput");

            sloth.setPosition(220,2,50);
            sloth.setLocalEulerAngles(0,-90,-90);
            sloth.setLocalScale(2,2,2);


            // Add the character controll and camera to the hierarchy
            app.root.addChild(sloth);
            sloth.addChild(camera);

            (window as any)['playerSloth'] = sloth;


            // Create a directional light
            const light = new pc.Entity();
            light.addComponent("light", {
                type: "directional"
            });
            app.root.addChild(light);
            light.setLocalEulerAngles(15, 15, 15);

            // Create a directional light
            const light2 = new pc.Entity();
            light2.addComponent("light", {
                type: "directional"
            });
            app.root.addChild(light2);
            light2.setLocalEulerAngles(195, 15, 195);

            const light1 = new pc.Entity('spotLight1');
            light1.addComponent('script');
            light1.script?.create("mintingLight")
            light1.addComponent("light", {
                type: "spot",
                color: new pc.Color(125, 16, 188, 0.2),
                intensity: 0.5,
                range: 25,
                innerConeAngle: 25,
                outerConeAngle: 70
            });
            light1.setPosition(getLightingPosition());
            app.root.addChild(light1);
        }
    }



}



export default SlothopiaWorld;