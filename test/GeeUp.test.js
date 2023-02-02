const assert = require('assert');
const ganache = require('ganache');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledGeeUpFactory = require('../ethereum/build/GeeUpFactory.json');
const compiledGeeUp = require('../ethereum/build/GeeUp.json');

let accounts;
let factory;
let geeUpAddress;
let geeUp;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(compiledGeeUpFactory.abi)
    .deploy({ data: compiledGeeUpFactory.evm.bytecode.object })
    .send({ from: accounts[0], gas: '1400000' });

  await factory.methods.createGeeUp('100').send({
    from: accounts[0],
    gas: '1000000'
  });

  [geeUpAddress] = await factory.methods.getDeployedGeeUps().call();
  geeUp = await new web3.eth.Contract(compiledGeeUp.abi, geeUpAddress);
});

describe('GeeUps', () => {
  it('deploys a factory and a geeUp', () => {
    assert.ok(factory.options.address);
    assert.ok(geeUp.options.address);
  });

  it('marks caller as the geeUp manager', async () => {
    const manager = await geeUp.methods.manager().call();

    assert.equal(accounts[0], manager);
  });

  it('allows people to contribute money and marks them as approvers', async () => {
    await geeUp.methods.contribute().send({
      value: '200',
      from: accounts[1]
    });

    const isContributor = await geeUp.methods.approvers(accounts[1]).call();
    
    assert(isContributor);
  });

  it('requires a minimum contribution', async () => {
    try {
      await geeUp.methods.contribute().send({
        value: '5',
        from: accounts[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('allows a manager to make a payment request', async () => {
    await geeUp.methods.createRequest('Buy some stuff', '100', accounts[1]).send({
      from: accounts[0],
      gas: '1000000'
    });

    const request = await geeUp.methods.requests(0).call();

    assert.equal('Buy some stuff', request.description);
  });

  it('processes requests', async () => {
    await geeUp.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei('10', 'ether')
    });

    await geeUp.methods.createRequest('A', web3.utils.toWei('5', 'ether'), accounts[1]).send({
      from: accounts[0],
      gas: '1000000'
    });

    await geeUp.methods.approveRequest(0).send({
      from: accounts[0],
      gas: '1000000'
    });

    await geeUp.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: '1000000'
    });

    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, 'ether');
    balance = parseFloat(balance);

    assert(balance > 104);
  });
});
