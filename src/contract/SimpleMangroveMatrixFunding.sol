// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./usdc.sol";

/**
 * @title Simple MangroveMatrix Funding Contract - MVP for Hackathon
 * @dev Simplified funding contract with core features only
 */
contract SimpleMangroveMatrixFunding {
    TestUSDC public immutable usdcToken;
    
    struct Campaign {
        uint256 id;
        string name;
        string location;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 deadline;
        address beneficiary;
        bool isActive;
        bool fundsReleased;
        uint256 carbonCreditsExpected;
    }
    
    // State variables
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions; // campaignId => contributor => amount
    mapping(address => uint256) public totalContributions;
    mapping(address => uint256) public carbonCreditsEarned;
    
    uint256 public campaignCounter;
    uint256 public totalFundsRaised;
    address public owner;
    uint256 public platformFeePercent = 250; // 2.5%
    uint256 public constant PERCENT_DIVISOR = 10000;
    
    // Events
    event CampaignCreated(uint256 indexed campaignId, string name, uint256 targetAmount, address beneficiary);
    event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event FundsReleased(uint256 indexed campaignId, uint256 amount, address beneficiary);
    event CarbonCreditsIssued(address indexed contributor, uint256 amount, uint256 campaignId);
    event RefundIssued(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId > 0 && _campaignId <= campaignCounter, "Campaign does not exist");
        _;
    }
    
    modifier campaignActive(uint256 _campaignId) {
        Campaign memory campaign = campaigns[_campaignId];
        require(campaign.isActive, "Campaign not active");
        require(block.timestamp <= campaign.deadline, "Campaign deadline passed");
        _;
    }
    
    constructor(address _usdcToken) {
        usdcToken = TestUSDC(_usdcToken);
        owner = msg.sender;
    }
    
    /**
     * @dev Create a new funding campaign - simplified version
     */
    function createCampaign(
        string memory _name,
        string memory _location,
        uint256 _targetAmount,
        uint256 _durationDays,
        uint256 _carbonCreditsExpected
    ) external returns (uint256) {
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_durationDays > 0, "Duration must be greater than 0");
        
        campaignCounter++;
        uint256 deadline = block.timestamp + (_durationDays * 1 days);
        
        campaigns[campaignCounter] = Campaign({
            id: campaignCounter,
            name: _name,
            location: _location,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            deadline: deadline,
            beneficiary: msg.sender,
            isActive: true,
            fundsReleased: false,
            carbonCreditsExpected: _carbonCreditsExpected
        });
        
        emit CampaignCreated(campaignCounter, _name, _targetAmount, msg.sender);
        return campaignCounter;
    }
    
    /**
     * @dev Contribute to a campaign - simplified version
     */
    function contribute(uint256 _campaignId, uint256 _amount) 
        external 
        campaignExists(_campaignId) 
        campaignActive(_campaignId) 
    {
        require(_amount > 0, "Contribution must be greater than 0");
        
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.raisedAmount + _amount <= campaign.targetAmount, "Exceeds target amount");
        
        // Transfer USDC from contributor
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "USDC transfer failed");
        
        // Update records
        campaign.raisedAmount += _amount;
        contributions[_campaignId][msg.sender] += _amount;
        totalContributions[msg.sender] += _amount;
        totalFundsRaised += _amount;
        
        emit ContributionMade(_campaignId, msg.sender, _amount);
        
        // Issue carbon credits proportionally
        if (campaign.carbonCreditsExpected > 0) {
            uint256 carbonCredits = (_amount * campaign.carbonCreditsExpected) / campaign.targetAmount;
            carbonCreditsEarned[msg.sender] += carbonCredits;
            emit CarbonCreditsIssued(msg.sender, carbonCredits, _campaignId);
        }
    }
    
    /**
     * @dev Release funds to beneficiary - simplified version
     */
    function releaseFunds(uint256 _campaignId) external campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.beneficiary || msg.sender == owner, "Not authorized");
        require(campaign.raisedAmount > 0, "No funds to release");
        require(!campaign.fundsReleased, "Funds already released");
        require(campaign.raisedAmount >= campaign.targetAmount, "Target not reached");
        
        // Calculate amounts
        uint256 platformFee = (campaign.raisedAmount * platformFeePercent) / PERCENT_DIVISOR;
        uint256 netAmount = campaign.raisedAmount - platformFee;
        
        // Mark as released
        campaign.fundsReleased = true;
        
        // Transfer funds
        require(usdcToken.transfer(campaign.beneficiary, netAmount), "Transfer failed");
        require(usdcToken.transfer(owner, platformFee), "Fee transfer failed");
        
        emit FundsReleased(_campaignId, netAmount, campaign.beneficiary);
    }
    
    /**
     * @dev Refund contributors if campaign fails
     */
    function refund(uint256 _campaignId) external campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp > campaign.deadline, "Campaign still active");
        require(campaign.raisedAmount < campaign.targetAmount, "Campaign was successful");
        require(contributions[_campaignId][msg.sender] > 0, "No contribution to refund");
        
        uint256 refundAmount = contributions[_campaignId][msg.sender];
        
        // Reset contribution
        contributions[_campaignId][msg.sender] = 0;
        campaign.raisedAmount -= refundAmount;
        totalContributions[msg.sender] -= refundAmount;
        
        // Transfer refund
        require(usdcToken.transfer(msg.sender, refundAmount), "Refund failed");
        
        emit RefundIssued(_campaignId, msg.sender, refundAmount);
    }
    
    /**
     * @dev Emergency stop a campaign (owner only)
     */
    function stopCampaign(uint256 _campaignId) external onlyOwner campaignExists(_campaignId) {
        campaigns[_campaignId].isActive = false;
    }
    
    /**
     * @dev Update platform fee (owner only)
     */
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee cannot exceed 10%");
        platformFeePercent = _feePercent;
    }
    
    // Simple view functions
    function getCampaign(uint256 _campaignId) external view campaignExists(_campaignId) 
        returns (Campaign memory) {
        return campaigns[_campaignId];
    }
    
    function getContribution(uint256 _campaignId, address _contributor) external view 
        returns (uint256) {
        return contributions[_campaignId][_contributor];
    }
    
    function getCampaignProgress(uint256 _campaignId) external view campaignExists(_campaignId)
        returns (uint256 percentageRaised, uint256 daysLeft, bool isSuccessful) {
        Campaign memory campaign = campaigns[_campaignId];
        
        percentageRaised = (campaign.raisedAmount * 100) / campaign.targetAmount;
        
        if (block.timestamp >= campaign.deadline) {
            daysLeft = 0;
        } else {
            daysLeft = (campaign.deadline - block.timestamp) / 1 days;
        }
        
        isSuccessful = campaign.raisedAmount >= campaign.targetAmount;
    }
    
    function getUserStats(address _user) external view returns (
        uint256 totalContributed,
        uint256 carbonCredits
    ) {
        return (totalContributions[_user], carbonCreditsEarned[_user]);
    }
}
