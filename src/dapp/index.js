
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
              
              // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' current time' + result.timestamp} ]);

            });
        })
       // Register Flight
        DOM.elid("registerflight").addEventListener("click", async ()=>{
            alert(" inside register flight" );
            let request = {
                flight: DOM.elid("flight").value,
                airline: DOM.elid("airlineaddress").value,
                departure: new Date(DOM.elid("time").value).valueOf()/ 1000,
                from: DOM.elid("passaddress").value
            };
            console.log("ip from register flight",request);
            let err, result, label;
            try {
                console.log("inside register flight try");
                await contract.registerFlight(request);
                label = "Success";
            } catch (e) {
                err = e;
                console.log(e);
                label = "Failure";
            } finally {
                display('Register Flight', 'Creates new flight in the system', [ { label: label, error: err, value: "Flight is registered"} ]);
            }
        });

        DOM.elid("registerairline").addEventListener("click", async ()=>{
            alert(" inside register flight" );
            let request = {
                airline: DOM.elid("airline-address").value,
                from:DOM.elid("registering_Airline").value
                
            };
            console.log("ip from register airline",request);
            let err, result, label;
            try {
                console.log("inside register airline try");
                await contract.registerAirline(request);
                label = "Success";
            } catch (e) {
                err = e;
                console.log(e);
                label = "Failure";
            } finally {
                display('Register Airline', 'Registers new airline', [ { label: label, error: err, value: "Airline registered Successfully !"} ]);
            }
        });
        DOM.elid("popAirline").addEventListener("click",async()=>{
         
            const airlines=contract.populateAirline();
            alert("inside try");
            alert(airlines);
            airlines.forEach((address) => {
                let opt = document.createElement("option");
                opt.value =address 
    opt.innerHTML = address
                DOM.elid("populateAirlines").append(opt);
            
            })
        });

        DOM.elid("buyInsurance").addEventListener("click", async () => {
            let airlineAddress = DOM.elid("populateAirlines").value;
            let flightCode=DOM.elid("flightDetails").value;
            let DeprTime= new Date(DOM.elid('dTime').value).getTime()
            let insureeAddress=DOM.elid("iAddress").value;
            let insuaranceAmount=DOM.elid("iAmount").value;
           // let towei=1000000000000000000;
            //let iamount=parseInt(insuaranceAmount);
           let iamount=1000000000000000000;
            let request = {
                airline: airlineAddress,
                flight: flightCode,
                time:DeprTime,
                insuree:insureeAddress,
                amount : iamount

            };
            console.log(request);
            let err, result, label
            try {
                await contract.buyInsurance(request);
                alert("inside try");

                label = "Success";
                result = "Insurance Purchase Successful !";
            } catch(e){
                console.log(e);
                label = "Failure";
                err = e;
            } finally {
                display(
                    "Buy Insurance",
                    "Passenger Purchasing Insurance- Status",
                    [{label: label, error: err, value: result}]
                )
            }
        });
        
           DOM.elid("fundairline").addEventListener("click", async () => {
            let airlineAddress = DOM.elid("fundAddress");
            let fee= document.getElementById("fundValue");
            console.log(fee.value);
            fee=10000000000000000000;
            let request = {
                airline: fundAddress.value,
                value:fee
            };
            console.log(request);
            let err, result, label
            try {
                await contract.fundAirline(request);
                alert("inside try");

                label = "Success";
                result = "Airline is registered";
            } catch(e){
                console.log(e);
                label = "Failure";
                err = e;
            } finally {
                display(
                    "Register Airline",
                    "Registers new airline in the system, but does not allow it to vote without registration fee paid",
                    [{label: label, error: err, value: result}]
                )
            }
        });
    
    });
    

})();



function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}







