// SPDX-License-Identifier: MIT
pragma solidity >= 0.6.0 < 0.9.0;

contract GeeUpFactory {
    address payable[] public deployedGeeUps;

    function createGeeUp(uint minContrib) public {
        address newGeeUp = address(new GeeUp(minContrib, msg.sender));
        deployedGeeUps.push(payable(newGeeUp));
    }

    function getDeployedGeeUps() public view returns (address payable[] memory) {
        return deployedGeeUps;
    }
}

contract GeeUp {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }

    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;

    // function modifier that allows Request creation and finalization to contract's manager only 
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor (uint minContrib, address creator) {
        manager = creator;
        minimumContribution = minContrib;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution);

        approvers[msg.sender] = true;
        approversCount++;
    }

    function createRequest(string memory description, uint value, address recipient) public restricted {
        Request storage newRequest = requests.push(); 
        newRequest.description = description;
        newRequest.value = value;
        newRequest.recipient = recipient;
        newRequest.complete = false;
        newRequest.approvalCount = 0;
    }

    function approveRequest(uint index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];

        require(request.approvalCount > (approversCount / 2));
        require(!request.complete);

        payable(request.recipient).transfer(request.value);
        request.complete = true;
    }
    
    function getSummary() public view returns (uint, uint, uint, uint, address) {
        return (
            minimumContribution,
            address(this).balance,
            requests.length,
            approversCount,
            manager
        );
    }
    
    function getRequests() public view returns (uint) {
        return requests.length;
    }
}
