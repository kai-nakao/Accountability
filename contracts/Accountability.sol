// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "./AccountabilityNFTs.sol";

contract Accountability {

    AccountabilityNFTs public accountabilityNFTs;

    constructor(AccountabilityNFTs _nftCollectionAddress) {
        accountabilityNFTs = _nftCollectionAddress;
    }

    struct LockedFunds {
        uint256 amount;
        uint256 time;
        uint256 lockedAt;
    }

    mapping(address => LockedFunds) public lockedFunds;

    function lockFunds(uint256 _time) public payable {
        require(lockedFunds[msg.sender].amount == 0, "You've already locked up funds.");

        lockedFunds[msg.sender] = LockedFunds(msg.value, _time, block.timestamp);
    }


    function withdraw() public {
        LockedFunds memory lockedFundsMemory = lockedFunds[msg.sender];
        require(lockedFundsMemory.amount > 0, "You have no locked funds.");
        require(block.timestamp >= lockedFundsMemory.lockedAt + lockedFundsMemory.time, "You can't withdraw yet.");
        require(accountabilityNFTs.balanceOf(msg.sender) > 0, "You do not own an NFT from the other smart contract.");

        console.log("lockedFundsMemory.amount", lockedFundsMemory.amount);
        uint256 amount = lockedFundsMemory.amount;
        console.log("amount", amount);
        delete lockedFunds[msg.sender];

        payable(msg.sender).transfer(amount);
    }

}
