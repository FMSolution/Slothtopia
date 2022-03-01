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

class Metaverse {

public canvas:HTMLCanvasElement;
private mainDiv:HTMLElement;
private isLoading:boolean;
private isRunning:boolean;
public plyrComs:Coms;



constructor(){
	let canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
	let mainDiv = document.getElementById('main') as HTMLElement;
    this.isLoading = true;
    this.isRunning = false;
	this.canvas = canvas;
	this.mainDiv = mainDiv;
	console.log('initatied');
    this.plyrComs = this.initiatePlayer();
    this.showWorld();
    setInterval(() => { 
        // console.log(this.plyrComs.updateCall())
    }, 2000);
}



initiatePlayer():Coms {
    var playerComs = new Coms("0x467640Fc0dBcE4266BaD1A4317b8e6A45019ABF7");
    return playerComs;
}


// init(){
//     //@ts-ignore
//     if(window.Ammo && window.AmmoLib){
//         console.log('loaded AMMO')
//         return this.showWorld();
//     }else{
//         if(wasmSupported()){
//             loadWasmModuleAsync('Ammo', 'http://192.168.8.116:5000/getFile/ammo.wasm.js', 'http://192.168.8.116:5000/getFile/ammo.wasm.wasm', () => this.init())
//         }else{
//             loadWasmModuleAsync('Ammo', 'http://192.168.8.116:5000/getFile/ammo.js', '', () => this.init())
//         }
//     }
// }



mintAvatar(){
    console.log('in minting')
    // SlothopiaW3._mintAvatar(this.walletAddress, "1")
}

formAssetName(asset:PCAsset){

    return asset.name+'.'+asset.extention;
}

loadAssets(app: pc.Application, _callback: any){
    var _isFetchingAssets : boolean = false;
    var worldAssets : Array<PCAsset> = MainAssets;
    for(var i=0; i<worldAssets.length; i++){
        if(app.assets.find(this.formAssetName(worldAssets[i])) != null){
            continue;
        }
        if(i === worldAssets.length -1){
            this.externalAssetLoads(app, worldAssets[i], _callback);
        }else{
            this.externalAssetLoads(app, worldAssets[i], false);
        }
    }

}


async externalAssetLoads(app: pc.Application, appAsset: PCAsset, _initialCB: any){
    var self = this;
    if(appAsset.type == 'texture'){
        //@ts-ignore
        app.loader.getHandler("texture").crossOrigin = "anonymous";
    }
    console.log('externally loading ', appAsset.name);
    await app.assets.loadFromUrl(appAsset.url, appAsset.type, function(err, asset){
        if(!err && asset){
            console.log('added asset')
           app.assets.add(asset);
           app.assets.load(asset);
           console.log('ok', _initialCB)
           if(_initialCB != false){
                
            _initialCB();
           }
        }
    })
}


updateAvatar(nGLBFile:string){


}


showWorld(){
    (window as any)["pc"] = pc;
    (window as any)["mint"] = slothopiaMint;
    (window as any)['tokenURI'] = getGLBFile;
    var self = this;

     
    async function getGLBFile(){
        var glb_file = await SlothopiaW3._getAvatar("1");
        console.log('GLB file url = ', glb_file)
        console.log('loading GLB from IPFS')
        self.externalAssetLoads(app, {name: 'avatarMain', extention:'glb', type:'container', url: glb_file}, function(){addMainPlayer(glb_file.split('/').splice(-1,)[0], true)});       
    }

    function addMainPlayer(f_name:string, toReplace:boolean){
        if(toReplace){
            var avatarChanger = new pc.Entity('avatarChanger');
            avatarChanger.addComponent("script");
            app.root.addChild(avatarChanger);
            
        }
        console.log('initiating Avatar');

        const player = new pc.Entity('mainPlayer');
        player.setPosition(0,0,0);

        const cameraAxis = new pc.Entity('camAxis');

        // const ray = new pc.Entity('RaycastEndPoint');
        // ray.setLocalPosition(0,25,0);
        // cameraAxis.addChild(ray);

        const camera = new pc.Entity('Camera');
        camera.addComponent("camera", {
            clearColor: new pc.Color(30 / 255, 30 / 255, 30 / 255)
        });
        camera.setPosition(0,-10,-5);
        camera.addComponent("script");
        // camera.script?.create("cameraMovement");
        cameraAxis.addChild(camera);

        player.addChild(cameraAxis);

        const slothGLB = app.assets.find(f_name);
        var playerAvatar = slothGLB.resource.instantiateRenderEntity({
            castShadows: false
        });
        playerAvatar.name = "playerAvatar";
        
        // playerAvatar.addComponent("collision", {
        //         axis: 0,
        //         height: 2,
        //         radius: 0.5,
        //         type: "capsule"
        // });
        playerAvatar.addComponent("rigidbody", {
                friction: 0.3,
                type: pc.BODYTYPE_DYNAMIC
        });

        playerAvatar.addComponent("script");
        playerAvatar.script?.create("playerMovement");
        playerAvatar.setLocalScale(0.75, 0.75, 0.75);
        player.addChild(playerAvatar);
        app.root.addChild(player);

        console.log(f_name);



      
    }

    function slothopiaMint(){
        //@ts-ignore
        var addr = window.ethereum.selectedAddress;
        console.log(addr);
        SlothopiaW3._mintAvatar(addr).then((res:any) => {
            if(res){
                return;
            }
        })
    }

     // create the main playCanvas app
    const app = new pc.Application(this.canvas, {
            mouse: new pc.Mouse(document.body),
            touch: new pc.TouchDevice(document.body),
            keyboard: new pc.Keyboard(window),
            gamepads: new pc.GamePads(),
        });

    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    console.log('loading Assets')
    this.loadAssets(app, mainRun);

    function mainRun(){
        console.log('running main');

        /**
         * create the main player
         * which consists of 
         * 1. cameraAxis
         *   1.1. camera
         *   1.2. ray
         * 2. playerModal
         */


        addMainPlayer('sloth-demo.glb', false)

        const material = new pc.StandardMaterial();
        material.diffuse = pc.Color.WHITE;
        material.diffuseMap = app.assets.find('checkboard.png').resource;
        material.diffuseMapTiling = new pc.Vec2(50, 50);
        material.update();
        const ground = new pc.Entity();
        ground.addComponent("render", {
            type: "box",
            material: material
        });
        ground.setLocalScale(500, 1, 500);
        ground.setLocalPosition(0, -0.5, 0);
        app.root.addChild(ground);

        const light = new pc.Entity();
        light.addComponent("light", {
            type: "directional",
            color: new pc.Color(1, 1, 1),
            // castShadows: true,
            intensity: 1,
            normalOffsetBias: 0.05,
        });
        light.setLocalEulerAngles(15, 15, 15);
        app.root.addChild(light);


        // Create a 3D world screen, which is basically a `screen` with `screenSpace` set to false
        const screen = new pc.Entity();
        screen.setLocalScale(0.01, 0.01, 0.01);
        screen.setPosition(25, 0.01, 25); // place UI slightly above the ground
        screen.setLocalRotation(new pc.Quat().setFromEulerAngles(-90, 0, 0));
        screen.addComponent("screen", {
            referenceResolution: new pc.Vec2(1280, 720),
            screenSpace: false
        });
        app.root.addChild(screen);

        const arial = app.assets.find('arial.json');

        // Text
        const text = new pc.Entity();
        text.addComponent("element", {
            pivot: new pc.Vec2(0.5, 0.5),
            anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5),
            fontAsset: arial,
            fontSize: 140,
            text: "Mint Your Avatar Here",
            width: 2000,
            height: 1000,
            autoWidth: true,
            autoHeight: true,
            wrapLines: true,
            enableMarkup: true,
            type: pc.ELEMENTTYPE_TEXT
        });
        screen.addChild(text);

        const light1 = new pc.Entity();
        light1.name = 'spotLight1';
        light1.addComponent("light", {
            type: "spot",
            color: new pc.Color(125, 16, 188, 0.2),
            intensity: 0.5,
            range: 15,
            innerConeAngle: 25,
            outerConeAngle: 50
        });
        light1.setPosition(25, 10, 25);
        app.root.addChild(light1);


        const auctionHouseGLB = app.assets.find('auction-house.glb');
        const auctionHouse = auctionHouseGLB.resource.instantiateRenderEntity({
            // castShadows:true
        });
        auctionHouse.addComponent("rigidbody", {
            type: pc.BODYTYPE_STATIC,
        });
        auctionHouse.setPosition(200,8,100);
        app.root.addChild(auctionHouse);

       app.start();

       
    }
}



}



export default Metaverse;