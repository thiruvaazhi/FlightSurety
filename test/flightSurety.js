
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });
  it('should register first airline when contract is deployed', async () => {
    let result = false

    try {
      result = await config.flightSuretyApp.isAirline.call(config.owner)
    } catch (e) {
      console.log(e)
    }

    assert.equal(result, true, 'First Airline is not registered')
  });

  
   
  it('Only existing airline may register a new airline until there are at least four airlines registered and register fifth or subsequent airlines with consensus of 50%', async () => {
   
    const fee = web3.utils.toWei('10', 'ether')
    try{
   for (i=2;i<5;i++)
   {    await config.flightSuretyData.registerAirline(accounts[i], {
        from: config.owner,
      })

      await config.flightSuretyApp.fund({
        from: accounts[i],
        value: fee,
      })

    }
      await config.flightSuretyApp.registerAirline(accounts[5], {
        from: config.owner,
      })
      await config.flightSuretyApp.registerAirline(accounts[5], {
        from: accounts[2],
      })
  } catch (e) {
      console.log('e:', e)
    }

    const wasRegistered = await config.flightSuretyApp.isAirline.call(accounts[5])

    // ASSERT
    assert.equal(wasRegistered,true, 'should only allow four airlines to be registered-code malfunction')
  })
  it('cannot register an Airline if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[6];
    let result=true;

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(newAirline, {from:accounts[5]});
    }
    catch(e) {

    // console.log("exception:",e);
    }
    try{
    result = await config.flightSuretyApp.isAirline.call(newAirline); 
    }
    catch(e)
    {
       // console.log("exception:",e);  
    }

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  })

  
});
