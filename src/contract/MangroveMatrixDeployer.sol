// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./MangroveMatrixFunding.sol";
import "./usdc.sol";

/**
 * @title Deployment script for MangroveMatrix contracts
 * @dev This contract helps deploy and initialize the funding ecosystem
 */
contract MangroveMatrixDeployer {
    TestUSDC public usdcToken;
    MangroveMatrixFunding public fundingContract;
    
    event ContractsDeployed(
        address usdcToken,
        address fundingContract,
        address deployer
    );
    
    constructor() {
        // Deploy USDC token first
        usdcToken = new TestUSDC();
        
        // Deploy funding contract with USDC address
        fundingContract = new MangroveMatrixFunding(address(usdcToken));
        
        emit ContractsDeployed(
            address(usdcToken),
            address(fundingContract),
            msg.sender
        );
    }
    
    /**
     * @dev Initialize with sample campaigns for testing
     */
    function initializeSampleCampaigns() external {
        // Create sample campaign 1: Sundarbans Mangrove Restoration
        fundingContract.createCampaign(
            "Sundarbans Mangrove Restoration",
            "Restore 500 hectares of mangrove forest in the Sundarbans delta region",
            "Sundarbans, Bangladesh",
            50000 * 10**6, // 50,000 USDC
            block.timestamp + 90 days,
            msg.sender,
            1000, // 1000 carbon credits expected
            85 // Biodiversity score
        );
        
        // Add milestones for campaign 1
        fundingContract.addMilestone(1, "Site preparation and seedling procurement", 15000 * 10**6);
        fundingContract.addMilestone(1, "Planting phase 1 (250 hectares)", 20000 * 10**6);
        fundingContract.addMilestone(1, "Planting phase 2 (250 hectares)", 15000 * 10**6);
        
        // Create sample campaign 2: Florida Everglades Protection
        fundingContract.createCampaign(
            "Florida Everglades Mangrove Protection",
            "Protect and enhance existing mangrove ecosystems in the Florida Everglades",
            "Everglades, Florida, USA",
            75000 * 10**6, // 75,000 USDC
            block.timestamp + 120 days,
            msg.sender,
            1500, // 1500 carbon credits expected
            92 // Biodiversity score
        );
        
        // Add milestones for campaign 2
        fundingContract.addMilestone(2, "Environmental assessment and monitoring setup", 25000 * 10**6);
        fundingContract.addMilestone(2, "Invasive species removal", 30000 * 10**6);
        fundingContract.addMilestone(2, "Habitat enhancement and water quality improvement", 20000 * 10**6);
        
        // Create sample campaign 3: Indonesian Mangrove Conservation
        fundingContract.createCampaign(
            "Indonesian Coastal Mangrove Conservation",
            "Community-based mangrove conservation in Indonesian coastal areas",
            "Java, Indonesia",
            30000 * 10**6, // 30,000 USDC
            block.timestamp + 60 days,
            msg.sender,
            800, // 800 carbon credits expected
            78 // Biodiversity score
        );
        
        // Add milestones for campaign 3
        fundingContract.addMilestone(3, "Community training and equipment", 10000 * 10**6);
        fundingContract.addMilestone(3, "Mangrove nursery establishment", 12000 * 10**6);
        fundingContract.addMilestone(3, "Community-led planting and monitoring", 8000 * 10**6);
    }
    
    /**
     * @dev Mint test USDC to specified addresses for testing
     */
    function mintTestUSDC(address[] calldata recipients, uint256[] calldata amounts) external {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            usdcToken.mint(recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev Get contract addresses for frontend integration
     */
    function getContractAddresses() external view returns (address, address) {
        return (address(usdcToken), address(fundingContract));
    }
}
