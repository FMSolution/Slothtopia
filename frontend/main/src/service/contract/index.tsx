import Web3 from 'web3';
import web3Utils from 'web3-utils';
import * as constants from './constants';
import { AbiItem } from 'web3-utils'

export default class SlothopiaW3 {

    public static web3 = new Web3(
        Web3.givenProvider ||
            'https://rpc.ftm.tools/',
    );
    public static NFTContract = new SlothopiaW3.web3.eth.Contract(
    	constants.NFT_contract.abi as AbiItem[],
    	constants.NFT_contract.address,
    );
    public static utils = web3Utils;

    public static async getWalletAvatar(address: string): Promise<string>{
        const lastNFT = await SlothopiaW3._getLastToken(address);
        if(lastNFT === "-1"){
            return "";
        }else{
            const nftURL = await SlothopiaW3._getAvatar(lastNFT);
            return nftURL;
        }
    }

    public static async _getLastToken(address: string): Promise<string>{
        var lastTokenID = await SlothopiaW3.NFTContract.methods.walletOfOwner(address).call();
        if(lastTokenID.length > 0){
            return (lastTokenID.at(-1)).toString();
        }else{
            return "-1";
        }
    }

    public static async _getAvatar(tokenID: string): Promise<string> {
        var jsonFile = await SlothopiaW3.NFTContract.methods.tokenURI(tokenID).call()
        var glbFile = await fetch(jsonFile).then((res:any) => res.json()).then((jRes:any) => {
            if(jRes){
                return jRes['3d'];
            }
            return '';
        });
        return glbFile;
    }

    public static async _mintAvatar(address: string): Promise<boolean> {
        if(address){
            address = SlothopiaW3.utils.toChecksumAddress(address);
        }
    	var didMint = await SlothopiaW3.NFTContract.methods.mintAvatar(address, 1).send({
    		from:address,
            value:SlothopiaW3.utils.toWei('50', 'ether')
    	}).then((res:any) => {
    		if (res){
    			return true;
    		}else{
    			return false;
    		}
    	}).catch((err:any) => {console.log(err)});

    	return didMint;
    }

}