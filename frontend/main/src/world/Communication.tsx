import SlothopiaW3 from '../service/contract'
interface PLYR {
	point: [number, number, number];
	timestamp: number;
	walletaddress: string;
	nft: string;
}

var INITIAL_WORLD_POINT: [number, number, number] = [0,0,0];

class Coms implements PLYR {
	public point = INITIAL_WORLD_POINT;
	public timestamp = this._getGMT();
	public walletaddress = "";
	public nft = "";
	private isConnected: boolean = false;
	private BASE_COMS: string = "https://api.slothtopia.io/";
	private UPDATE_COMS: string = this.BASE_COMS + 'playerInfo';
	private RENDER_COMS: string = this.BASE_COMS + 'getPlayers';


	constructor(wAddr: string){
		this.walletaddress = wAddr;
		this._getNFTs();
		this.updateCall();

	}

	// by defauly is UTC in mS
	_getGMT(): number{
		return(Math.floor(new Date().getTime()/1000));
	}

	async _getNFTs(): Promise<string> {
		const nft_ = await SlothopiaW3.getWalletAvatar(this.walletaddress);
		this.nft = nft_;
		return nft_;
	}

	getPlayerData():PLYR {
		const _player: PLYR = {
			point: this.point,
			timestamp: this.timestamp,
			walletaddress: this.walletaddress,
			nft: this.nft
		};
		return _player;
	}

	setPlayerData(playerPoint: [number, number, number]) {
		this.point = playerPoint;
		this.timestamp = this._getGMT();
		this.updateCall();
	}

	falttenData(): string{ 
		var _data:PLYR = this.getPlayerData();
		return(JSON.stringify(_data));
	}

	async renderCall(): Promise<PLYR[]|void>{
		let _res: PLYR[]|void = [];
		var plyrHeaders = this.falttenData();
		_res = await fetch(this.RENDER_COMS, { headers: { 'plyrDATA': plyrHeaders }}).then((res:any) => res.json()).then((jRes: any) => {
			if(jRes){
				return jRes;
			}
			return [];
		}).catch((err:any) => {console.log(err)});
		return _res;
	}

	async updateCall(): Promise<boolean|void>{
		let _res: boolean|void = false;
		var plyrHeaders = this.falttenData();
		_res = await fetch(this.UPDATE_COMS, { headers: { 'plyrDATA': plyrHeaders }}).then((res:any) => {
			if(res){
				return true;
			}
			return false;
		}).catch((err:any) => {console.log(err)});
		return _res;
	}



}

export default Coms;