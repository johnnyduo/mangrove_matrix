# MangroveMatrix Smart Contracts

This directory contains the smart contracts for the MangroveMatrix funding platform, designed to facilitate transparent and verifiable funding for mangrove conservation projects worldwide.

## Contracts Overview

### 1. TestUSDC.sol
- A test USDC token contract for development and testing
- Includes faucet functionality for easy testing
- 6 decimal places (standard USDC format)
- Mintable by owner for testing purposes

### 2. MangroveMatrixFunding.sol
The main funding contract with the following features:

#### Core Functionality
- **Campaign Creation**: Create funding campaigns for specific mangrove conservation projects
- **Milestone-based Funding**: Break down projects into verifiable milestones
- **Transparent Contributions**: Track all contributions and contributors
- **Environmental Verification**: Authorized verifiers can validate project milestones
- **Carbon Credits**: Automatic issuance of carbon credits based on contributions
- **Refund Protection**: Automatic refunds if campaigns fail to meet targets

#### Key Features
- **Multi-signature Verification**: Requires authorized environmental verifiers
- **Proportional Fund Release**: Funds released based on completed milestones
- **Platform Fee**: Configurable platform fee (default 2.5%)
- **Biodiversity Scoring**: Track environmental impact metrics
- **Contributor Rewards**: Carbon credits and reputation system

### 3. MangroveMatrixDeployer.sol
- Deployment helper contract
- Creates sample campaigns for testing
- Utility functions for test setup

## Smart Contract Architecture

```
MangroveMatrixFunding
├── Campaigns
│   ├── Basic Info (name, description, location)
│   ├── Funding Details (target, raised, deadline)
│   ├── Milestones (description, target amount, verification)
│   └── Environmental Metrics (carbon credits, biodiversity)
├── Contributors
│   ├── Contribution Tracking
│   ├── Carbon Credits Earned
│   └── Reputation System
└── Verification System
    ├── Authorized Verifiers
    ├── Milestone Verification
    └── Evidence Storage (IPFS hashes)
```

## Deployment Instructions

### Prerequisites
- Solidity ^0.8.19
- Hardhat or Foundry development environment
- Test network access (Optimism Sepolia recommended)

### Deployment Steps

1. **Deploy TestUSDC** (for testing):
```solidity
TestUSDC usdc = new TestUSDC();
```

2. **Deploy MangroveMatrixFunding**:
```solidity
MangroveMatrixFunding funding = new MangroveMatrixFunding(address(usdc));
```

3. **Or use the Deployer contract**:
```solidity
MangroveMatrixDeployer deployer = new MangroveMatrixDeployer();
```

### Configuration

After deployment, configure the system:

1. **Add Environmental Verifiers**:
```solidity
funding.setVerifier(verifierAddress, true);
```

2. **Set Platform Fee** (if different from 2.5%):
```solidity
funding.setPlatformFee(250); // 2.5% = 250 basis points
```

3. **Initialize Test Campaigns** (optional):
```solidity
deployer.initializeSampleCampaigns();
```

## Usage Examples

### Creating a Campaign
```solidity
uint256 campaignId = funding.createCampaign(
    "Mangrove Restoration Project",
    "Restore mangroves in coastal area",
    "Location Name",
    100000 * 10**6, // 100,000 USDC target
    block.timestamp + 90 days, // 90-day deadline
    beneficiaryAddress,
    500, // Expected carbon credits
    80   // Biodiversity score
);
```

### Adding Milestones
```solidity
funding.addMilestone(
    campaignId,
    "Site preparation and seedling procurement",
    30000 * 10**6 // 30,000 USDC for this milestone
);
```

### Contributing to a Campaign
```solidity
// First approve USDC spending
usdc.approve(address(funding), amount);

// Then contribute
funding.contribute(campaignId, amount);
```

### Milestone Verification Process
1. **Beneficiary completes milestone**:
```solidity
funding.completeMilestone(campaignId, milestoneIndex, "ipfs://evidence-hash");
```

2. **Verifier validates milestone**:
```solidity
funding.verifyMilestone(campaignId, milestoneIndex);
```

3. **Release funds**:
```solidity
funding.releaseFunds(campaignId);
```

## Security Features

- **Access Control**: Owner and verifier roles with specific permissions
- **Input Validation**: Comprehensive validation of all inputs
- **Reentrancy Protection**: Safe external calls and state updates
- **Overflow Protection**: Using Solidity ^0.8.19 built-in overflow checks
- **Time-based Controls**: Deadline enforcement and cooldown periods

## Environmental Impact Tracking

The contract tracks several environmental metrics:
- **Carbon Credits**: Automatically calculated and issued to contributors
- **Biodiversity Score**: Project-specific environmental impact rating
- **Milestone Evidence**: IPFS hashes for verification documents
- **Geographic Tracking**: Location-based project categorization

## Integration with Frontend

The contracts are designed to work seamlessly with the React frontend:

### Key Functions for Frontend Integration
- `getCampaignDetails()`: Get all campaign information
- `getCampaignProgress()`: Get funding progress and time remaining
- `getContributorInfo()`: Get user's contribution history and rewards
- `getMilestone()`: Get milestone details and verification status

### Event Monitoring
Monitor these events for real-time updates:
- `CampaignCreated`: New campaigns
- `ContributionMade`: New contributions
- `MilestoneCompleted`: Milestone completions
- `MilestoneVerified`: Milestone verifications
- `FundsReleased`: Fund releases to beneficiaries

## Testing

Use the included test utilities:
1. Deploy contracts using `MangroveMatrixDeployer`
2. Mint test USDC using the faucet or `mintTestUSDC()`
3. Create test campaigns using `initializeSampleCampaigns()`
4. Test the full funding lifecycle

## Gas Optimization

The contracts are optimized for gas efficiency:
- Efficient storage layout
- Minimal external calls
- Batch operations where possible
- Event-based monitoring to reduce view function calls

## Future Enhancements

Potential future features:
- NFT rewards for contributors
- DAO governance for verifier selection
- Cross-chain compatibility
- Integration with real carbon credit registries
- Advanced environmental monitoring APIs

## License

MIT License - See individual contract files for specific licensing information.
