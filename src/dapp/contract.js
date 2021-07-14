import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    registerAirline(request){
        alert("inside contract");
        let self =this;
        return new Promise((res,rej)=>{
            self.flightSuretyApp.methods
            .registerAirline(request.airline)
            .send({ from: request.from }, (error, result) => {
              if (error) {
                console.log(error)
                rej(error)
              } else {
                res(result)
              }
            })
        })
        }


      populateAirline() {
          alert("inside contract");
        
            return this.airlines;
        
          
        }      

        buyInsurance(request) {
          const self = this
          alert("inside contract ");
          console.log(request);
          return new Promise((res, rej) => {
            self.flightSuretyApp.methods
              .buyInsurance(request.airline, request.flight,request.time)
              .send({ from: request.insuree, value: request.amount}, (error, result) => {
                if (error) {
                  rej(error)
                } else {
                  res(result)
                }
              })
          })
        }
      registerFlight(request){
          alert("inside contract ");
          console.log(request);
          let self =this;
          return new Promise((res,rej)=>{
              self.flightSuretyApp.methods
              .registerFlight(request.flight,request.airline, request.departure)
              .send({ from: request.from }, (error, result) => {
                if (error) {
                  console.log(error)
                  rej(error)
                } else {                  
                  res(result)
                }
              })
          })
          
      }

        fundAirline(request){
            alert("inside fund contract");
            let self =this;
            //const fee = web3.utils.toWei('10', 'ether')
            return new Promise((res,rej)=>{
                self.flightSuretyApp.methods
                .fund()
                .send({from: request.airline,value:request.value},(error, result) => {
                  if (error) {
                    console.log(error)
                    rej(error)
                  } else {
                    res(result)
                  }
                })
            })
            }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }
}