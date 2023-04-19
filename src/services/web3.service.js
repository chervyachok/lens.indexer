const config = require('../config/config');
const { ethers } = require('ethers');

const rpc = new ethers.providers.JsonRpcProvider({ url: config.chainRpc, timeout: 10000 }, 'any')


const contract = function (name, address) {
	if (config.bc[name]) {
		return {
			instance: new ethers.Contract(address ? address : config.bc[name].address, config.bc[name].abi, rpc),
			...config.bc[name]
		};
	}
	return null;
};

const timestamp = async function() {
	const blockNum = await rpc.getBlockNumber();
	const block = await rpc.getBlock(blockNum);
	return block.timestamp;
}


module.exports = {
	rpc,
	contract,		 
	timestamp
};
