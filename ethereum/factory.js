import web3 from './web3';
import GeeUpFactory from './build/GeeUpFactory.json';

const instance = new web3.eth.Contract(GeeUpFactory.abi, 'YOUR_FACTORY_ADDRESS');

export default instance;
