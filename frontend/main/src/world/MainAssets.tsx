interface PCAsset {
    name: string,
    extention:string,
    type: string,
    data?: any,
    url: string
} const worldAssets: PCAsset[] = [
    {
        name:'idle',
        extention:'glb',
        type:'animation',
        url:'https://api.slothtopia.io/get/animations/idle.glb'
    },    
    {
        name:'skyMain',
        extention:'dds',
        type:'texture',
        url:'https://api.slothtopia.io/get/cubemaps/skyMain.dds'
    },
    {
        name:'walk',
        extention:'glb',
        type:'animation',
        url:'https://api.slothtopia.io/get/animations/walk.glb'
    },
    {
        name:'jump',
        extention:'glb',
        type:'animation',
        url:'https://api.slothtopia.io/get/animations/jump.glb'
    },
    {
        name:'mintAura',
        extention:'js',
        type:'script',
        url:'https://api.slothtopia.io/get/scripts/mintAura.js'
    },
    {
        name:'arial',
        extention:'json',
        type:'font',
        url:'https://api.slothtopia.io/get/fonts/arial.json'
    },
    {
        name:'first-person-camera',
        extention:'js',
        type:'script',
        url:'https://api.slothtopia.io/get/scripts/first-person-camera.js'
    },
    {
        name:'chair',
        extention:'glb',
        type:'container',
        url:'https://api.slothtopia.io/get/models/chair.glb'
    },
   {
        name:'basic-sloth',
        extention:'glb',
        type:'container',
        url:'https://api.slothtopia.io/get/models/basic-sloth.glb'
    },
    {   
        name:'mainHouse',
        extention:'glb',
        type:'container',
        url:'https://api.slothtopia.io/get/models/mainHouse.glb'
    },
]

export default worldAssets;