import web3 from './web3';
import GeeUp from './build/GeeUp.json';

const geeUp = address => new web3.eth.Contract(GeeUp.abi, address);

export default geeUp;
