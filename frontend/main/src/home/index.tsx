import React, { useContext } from "react";
import { Link } from "react-router-dom";
import './styles.css';
import { WalletContext } from '../service/context/wallet-context';
import SlothopiaW3 from '../service/contract';
//@ts-ignore
import sample from '../assets/sample.mp4';

const Home = () => {
    const { walletAddress } = useContext(WalletContext);

    function checkWallet(){
        if(walletAddress === ""){
            return false;
        }else{
           return true;
        }
    }

    function mintAva(){
        SlothopiaW3._mintAvatar(walletAddress);
    }

    function showAlert(){
        window.alert("Please connect your wallet to join Slothopia.")
    }

    return(
        <div className="home">
            <video className='videoBG' autoPlay loop muted>
                <source src={sample}   type='video/mp4' />
            </video>
            <div>
                {
                    walletAddress !== ""?
                    <div className="navs">
                        <Link to="/world"><button> World </button></Link>
                        <button onClick={() => mintAva()}> Mint Avatar </button>
                    </div>
                    :
                    <div className="navs">
                        <button onClick={() => showAlert() }> World </button>
                        <button onClick={() => showAlert() }> Mint Avatar </button>
                    </div>
                    
                }
            </div>
        </div>
    )
};

export default Home;