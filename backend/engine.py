import time
import sqlite3
import json
from web3 import Web3

NFT_CONTRACT_ADDRESS = '0x4433EDAd71061313ed5Dd01619D78228D0e791F6'
NFT_CONTRACT_ABI = '''[{"inputs":[{"internalType":"string","name":"_url","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"OWNER","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_nURL","type":"string"},{"internalType":"string","name":"_nBaseExt","type":"string"}],"name":"changeURLParams","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mintAvatar","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mintCost","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"reservedSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"wallet","type":"address"}],"name":"walletOfOwner","outputs":[{"internalType":"uint256[]","name":"walletNFTs","type":"uint256[]"}],"stateMutability":"view","type":"function"}]'''

##########################################################################################
#										MAINDB 											 #
##########################################################################################
#																						 #
#  ID | positionX | positionY | positionZ | timeStamp | walletAddress | nftUrl | active_ #
#																						 #
##########################################################################################


def _getGMTTs(check=False):
	if(check):
		return(int(time.time() + 360))
	return(int(time.time()))


def _dictFactory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def checkPlayerData(data):
	try:
		position = data['point']
		walletAddr = data['walletaddress']
		timestamp = data['timestamp']
		nftImage = data['nft']
		assert(type(position) == list and len(position) == 3)
		assert(Web3.isAddress(str(walletAddr)))
		# assert(timestamp <= _getGMTTs(check=True) and timestamp >= _getGMTTs())
		assert(nftImage.lower().startswith('http') or not nftImage)
		x,y,z = ('%.4f'%i for i in position)
		nftURL = checkAddressForNFTs(Web3.toChecksumAddress(walletAddr), nftImage)
		if(not nftImage and nftURL):
			return((x, y, z, _getGMTTs(), str(Web3.toChecksumAddress(walletAddr)), nftURL, True))
		else:
			return((x, y, z, _getGMTTs(), str(Web3.toChecksumAddress(walletAddr)), nftImage, True))
	except:
		return False


def checkAddressForNFTs(wallet_address, nftImage):
	# url = https://rpc.ftm.tools/
	w3 = Web3(Web3.HTTPProvider('https://rpc.ftm.tools/'))
	assert(w3.isConnected())
	nft_contract = w3.eth.contract(address=NFT_CONTRACT_ADDRESS, abi=NFT_CONTRACT_ABI)
	addr_nfts = nft_contract.functions.walletOfOwner(Web3.toChecksumAddress(wallet_address)).call()
	if(len(addr_nfts) > 0 and not nftImage.startswith('https')):
		return nft_contract.functions.tokenURI(addr_nfts[-1]).call()
	return None


def connectToDatabase():
	connection = sqlite3.connect(MAIN_DB_PATH)
	# connection.row_factory = _dictFactory
	cursor = connection.cursor()
	return connection,cursor


def updateDatabase(player_data, player_wallet):
	conn,cur = connectToDatabase()
	try:
		option = player_data + (player_wallet,)
		statement = ''' UPDATE main SET positionX =%s, positionY =%s, positionZ =%s, timeStamp =%s, walletAddress ='%s', nftUrl ='%s', active_ =%s WHERE walletAddress = '%s'; '''%option
		cur.execute(statement)
		conn.commit()
		cur.close()
		conn.close()
		return cur.lastrowid
	except:
		return False


# data is already checked here
def addToDatabase(player_data):
	conn,cur = connectToDatabase()
	try:
		statement = ''' INSERT INTO main(positionX,positionY,positionZ,timeStamp,walletAddress,nftUrl,active_) VALUES(?,?,?,?,?,?,?); '''
		cur.execute(statement, player_data)
		conn.commit()
		cur.close()
		conn.close()
		return cur.lastrowid
	except:
		return False

def shouldUpdateOrAdd(data):
	_player = readFromDatabase(data[4])
	if(not _player):
		res = addToDatabase(data)
		return res
	for i in range(1,4):
		if(int(float(_player[i])) != int(float(data[i-1]))):
			res = updateDatabase(_player, data[4])
			return res
	return True


def readFromDatabase(wallet_address=None):
	conn,cur = connectToDatabase()
	statement = ''' SELECT * FROM main'''
	if(wallet_address):
		statement += ''' WHERE walletAddress ='%s'; '''%wallet_address
	res = cur.execute(statement).fetchall()
	cur.close()
	conn.close()
	if(res and wallet_address):
		return res[0]
	elif(res and not wallet_address):
		return res
	else:
		return False

def getActivePlayers(player_data):
	wallet_address = player_data[4]
	conn,cur = connectToDatabase()
	statement = ''' SELECT positionX,positionY,positionZ,walletAddress,nftUrl FROM main WHERE ((active_ = 1 OR active_ = True) AND walletAddress != '%s');'''%wallet_address
	res = cur.execute(statement).fetchall()
	cur.close()
	conn.close()
	return res


def loadHeaders(header_data):
	return json.loads(header_data)


def parseInfo(res_data):
	_data = loadHeaders(res_data)
	data = checkPlayerData(_data)
	res = shouldUpdateOrAdd(data)
	return(res)


def parseGetter(res_data):
	_data = loadHeaders(res_data)
	data = checkPlayerData(_data)
	res = getActivePlayers(data)
	return(res)
