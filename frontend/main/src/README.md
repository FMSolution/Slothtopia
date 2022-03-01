
# SLOTHTOPIA

## Main 3D Metaverse rendering 

- Using:
	1) _react-router-dom:_ navigation
	2) _web3:_ for web3 calls 
	3) _forked/modified playcanvas engine:_ @playcanvas in ../../build for the main 3D rendering


___index.tsx:___ mainEntry file<br />
<br />
___App.tsx:___ creates `web3` context and provides value for the interface (walletAddress) and checks if wallet is connected && if *metamask* is on the correct chainId => FANTOM OPERA (250)<br />
<br />
___componenets/:___ has the main `Loader` that gets displayed while the Metaverse is fetching assets and loading gameplay<br />
<br />
___helpers/:___ `Ammo` dependency from @playcanvas is being fetched directly from the server for *wasm* loading<br />
<br />
___assets/:___ contains the sample video `sample.mp4` that is displayed on the homepage<br />
<br />
___header/:___ contains the main header that displays the walletAddress and the logo for `SLOTHTOPIA`<br />
<br />
___home/:___ contains the main routing for the different main buttons <br />
<br />
___service/context/:___ contains the main export for the (walletAddress) context that is used throughout the app<br />
<br />
___service/contract/constants:___ contains the *NFT contract* address&&ABI<br />
<br />
___service/contract/:___ contains the main `web3` calls. in the class *SlothopiaW3*. Class provides utility methods, that are called by exposing the class itself to `window` <br />
<br />
___world/:___ contains the main Metaverse<br />
	1) __world/:__ creates a new instance of World class && starts the Loader<br />
	<br />
	2) __world/MainAssets:__ acts as a pre-loader for the different models/assets needed in the metaverse. specified under the pcAsset interface<br />
	<br />
	3) __world/World:__ the main world class. creates the Metaverse, renders all the assets needed after loading MainAssets exports, creates the player and loads the NFT or a default model for the sloth<br />
	<br />
	4) __world/Communication:__ the main communication between the Metaverse and the backend server, mainly used to update the NFT urls, and the player position in the multiplayer world.<br />
	<br />

@author:**mr.kj**
