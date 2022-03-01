import React, { useContext } from "react";
import './styles.css';
import { WalletContext } from '../service/context/wallet-context';

const Header = () => {
    const walletAddress = useContext(WalletContext)['walletAddress'];

    function getBeautyWallet(wAddr: string|null){
        if(wAddr){
            return wAddr.slice(0,5)+'..'+wAddr.slice(-4,)
        }else{
            return "Connect Wallet"
        }
    }

    function checkWalletCall(){
        if(walletAddress && walletAddress !== ""){
            return;
        }
    }

    return(
        <div className="header">
            <a href="/"><h2>Slothtopia</h2></a>
            <button onClick={() => checkWalletCall()}>
                {walletAddress ? getBeautyWallet(walletAddress) : "Connect Wallet"}
            </button>
        </div>
    )
};

export default Header;