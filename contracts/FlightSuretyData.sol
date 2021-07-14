pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    uint256 private airlineCounter = 0;
    uint256 private participantCounter = 0;


       struct Airline {
        uint id;
        bool isParticipant;
    }

   



      struct Flight {
        string flightCode;
        uint statusCode;
        address airline;
        uint timeStamp;
        bool registered;
    }



     struct Insurance {
        address airline;
        bytes32 flight;
        uint256 value;
    }


    // mappings
      mapping(address => bool) private authorizedCallers;
    mapping(address => Airline) private airlines;
     mapping(address => uint256) private funds; // Airlines funds
      mapping(bytes32 => Flight) private flights;
     // mapping (uint => Flight)private flightsalt;
      mapping(address => Insurance) private insurances; 
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor() public 
    {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }
   modifier isAuthorizedCaller()
    {
        require(authorizedCallers[msg.sender] == true, "The caller is not authorized");
        _;
    }
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }

  


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }
    function getAirlineCounter() external view returns (uint256) {
        return airlineCounter;
    }
    function getParticipantCounter() external view returns (uint256) {
        return participantCounter;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
     function authorizeCaller(address _address) external requireContractOwner {
        authorizedCallers[_address] = true;
    }
   

     function isAirlineRegistered(address _address)
        external
        view
        returns (bool)
    {
        if (airlines[_address].id >=1)
        return true;
        else
        return false;
    }

    function AirlineNotRegistered(address _address)
        external
        view
        returns (bool)
    {
        if (airlines[_address].id <=1)
        return true;
        else
        return false;
    }

     function isFunded(address _address) external view returns (bool) {
        return airlines[_address].isParticipant;
    }

    function registerAirline(address _address) external {
        airlineCounter++;
        airlines[_address] = Airline({
            id:airlineCounter ,
            isParticipant: false
        });

        
    }
  


   /**
    * @dev Buy insurance for a flight
    *
    */  
    
function registerFlight(string _flightCode, address airlineAdd, uint _timestamp)
       requireIsOperational external
    {
         bytes32 key=keccak256(abi.encodePacked(airlineAdd, _flightCode, _timestamp));
           flights[key].flightCode=_flightCode;
           flights[key].statusCode=10;
         //  flights[key].registered = true;
          //flights[key].airline=airlineAdd;
           flights[key].timeStamp=1626438180;
   //
             
    }

    function isFlightRegistered(bytes32 key)
        external
        view
        returns (bool)
    {
       return flights[key].registered;
    
    } 
   
   function buyInsurance(
       address airline,
        string flight,
        uint256 timestamp,
        address insuree,
        uint256 amount,
        bytes32 key
    ) 
    external
    requireIsOperational
    {
      
      insurances[insuree] = Insurance({ airline: airline, flight: key,value: amount});
      funds[airline] = funds[airline].add(amount);
    }

   /* function creditInsurees(bytes32 key) external requireIsOperational {
        flights[key].isDelay = true;
    }*/
    
      
    function getFlight(bytes32 key)
        external
        returns (
            bool isRegistered,
            uint256 statusCode,
            address airline,
            uint256 timestamp
        )
    {
        isRegistered = flights[key].registered;
        statusCode = flights[key].statusCode;
        airline = flights[key].airline;
        timestamp = flights[key].timeStamp;

        return (isRegistered, statusCode, airline, timestamp);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
   function fund(address _address, uint256 amount)
        external
        requireIsOperational
    {
        airlines[_address].isParticipant = true;
        funds[_address] = amount;

        participantCounter++;
    }

    function getFunds(address _address) external view returns (uint256) {
        return funds[_address];
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        //fund();
    }


}

