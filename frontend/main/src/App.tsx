import React, { useState, useEffect, useMemo} from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./home";
import DND from "./panel";
import Header from "./header";
import World from './world/index'
import './styles.css';
import SlothopiaW3 from './service/contract';
import { WalletContext } from './service/context/wallet-context';



function App () {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [didEnable, setDidEnable] = useState<boolean>(false);
  const walletContextValue = useMemo(
      () => ({ walletAddress }),
      [walletAddress, setWalletAddress],
  );

  async function enableMetamask(){
    if(!didEnable){
        //@ts-ignore
        await window.ethereum.enable(); 
        setDidEnable(true);
    }
  }

  (window as any)['slothopiaWeb3'] = SlothopiaW3;


   useEffect(() => {
     //@ts-ignore
        if (typeof window !== 'undefined' && !!window.ethereum && window.ethereum.selectedAddress == null) {
            enableMetamask();
        }
  })


  useEffect(() => {
      //@ts-ignore
        if (typeof window !== 'undefined' && !!window.ethereum) {
            (async () => {
                //@ts-ignore
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts',
                });
                setWalletAddress(accounts[0] ?? "");
            })();
            //@ts-ignore
            window.ethereum.on('accountsChanged', async (accounts: string[]) => {
                setWalletAddress(accounts[0] ?? "");
            });
        }
    }, []);

  useEffect(() => {
        if (walletAddress) {
            //@ts-ignore
            if (parseInt(window.ethereum.networkVersion) !== 250)
                window.alert(
                    'Please switch to Fantom Opera (FTM) to join Slothopia.',
                );
            //@ts-ignore
            window.ethereum.on('networkChanged', (networkId: string) => {
                if (parseInt(networkId) !== 250)
                    window.alert(
                        'Please switch to Fantom Opera (FTM) to join Slothopia.',
                    );
            });
        }
    },[walletAddress]);
                  
  return (
    <div>
      <WalletContext.Provider value={walletContextValue}>
        <Header/>
          <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/drop" element={<DND/>}/>
              <Route path="/world" element={<World/>}/>
          </Routes>
      </WalletContext.Provider>
    </div>
    )
}

export default App;