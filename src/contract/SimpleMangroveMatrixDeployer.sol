// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SimpleMangroveMatrixFunding.sol";
import "./usdc.sol";

/**
 * @title Simple Deployer for Hackathon MVP
 * @dev Quick deployment and setup for demo purposes
 */
contract SimpleMangroveMatrixDeployer {
    TestUSDC public usdcToken;
    SimpleMangroveMatrixFunding public fundingContract;
    
    event ContractsDeployed(address usdcToken, address fundingContract);
    
    constructor() {
        // Deploy USDC token
        usdcToken = new TestUSDC();
        
        // Deploy simple funding contract
        fundingContract = new SimpleMangroveMatrixFunding(address(usdcToken));
        
        emit ContractsDeployed(address(usdcToken), address(fundingContract));
    }
    
    /**
     * @dev Create demo campaigns for hackathon presentation
     */
    function createDemoCampaigns() external {
        // Campaign 1: Quick mangrove restoration
        fundingContract.createCampaign(
            "Sundarbans Mangrove Restoration",
            "Bangladesh",
            50000 * 10**6, // 50,000 USDC
            30, // 30 days
            500 // 500 carbon credits
        );
        
        // Campaign 2: Florida protection
        fundingContract.createCampaign(
            "Florida Everglades Protection",
            "Florida, USA",
            25000 * 10**6, // 25,000 USDC
            45, // 45 days
            300 // 300 carbon credits
        );
        
        // Campaign 3: Small community project
        fundingContract.createCampaign(
            "Community Mangrove Garden",
            "Philippines",
            10000 * 10**6, // 10,000 USDC
            60, // 60 days
            150 // 150 carbon credits
        );
    }
    
    /**
     * @dev Mint test USDC for demo
     */
    function mintDemoUSDC(address[] calldata users) external {
        for (uint256 i = 0; i < users.length; i++) {
            usdcToken.mint(users[i], 100000 * 10**6); // 100,000 USDC each
        }
    }
    
    /**
     * @dev Get contract addresses for frontend
     */
    function getAddresses() external view returns (address, address) {
        return (address(usdcToken), address(fundingContract));
    }
}
