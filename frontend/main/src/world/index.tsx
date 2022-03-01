import React,{ Component, useEffect, useContext, useState } from 'react';
import World from './World';
import Verse from './MetaVerse';
import './styles.css';
import { WalletContext } from '../service/context/wallet-context';
import { wasmSupported, loadWasmModuleAsync } from '../helpers/wasm-loader.js';
import Loader from '../componenets/Loader';

const App = () => {
  const { walletAddress } = useContext(WalletContext);
  const [worldLoading, setWorldLoading] = useState<boolean>(false);

  var w: World|any = null;

  useEffect(() => {
     w = new World(walletAddress);
  });

  return(

    <div className="main" id='main'>
      <Loader isLoading={w === null ? true : w.isLoading}/>
      <canvas className="canvas" id="main-canvas"></canvas>
    </div>
  )
}


export default App;
