// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./usdc.sol";

/**
 * @title MangroveMatrix Funding Contract
 * @dev A comprehensive funding contract for mangrove conservation projects
 * Features:
 * - Multiple funding campaigns for different mangrove regions
 * - Milestone-based fund release
 * - Contributor rewards and NFT minting
 * - Environmental impact verification
 * - Transparent fund allocation and tracking
 */
contract MangroveMatrixFunding {
    TestUSDC public immutable usdcToken;
    
    // Structs
    struct Campaign {
        uint256 id;
        string name;
        string description;
        string location;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 deadline;
        address beneficiary;
        bool isActive;
        bool fundsReleased;
        uint256 carbonCreditsExpected;
        uint256 biodiversityScore;
        mapping(address => uint256) contributions;
        mapping(uint256 => Milestone) milestones;
        uint256 milestoneCount;
        uint256 completedMilestones;
    }
    
    struct Milestone {
        string description;
        uint256 targetAmount;
        bool completed;
        bool verified;
        string evidenceHash; // IPFS hash for verification documents
        uint256 completionDate;
    }
    
    struct Contributor {
        uint256 totalContributions;
        uint256 campaignsSupported;
        uint256 carbonCreditsEarned;
        bool isVerified;
        mapping(uint256 => uint256) campaignContributions;
    }
    
    // State variables
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => Contributor) public contributors;
    mapping(address => bool) public verifiers; // Authorized environmental verifiers
    
    uint256 public campaignCounter;
    uint256 public totalFundsRaised;
    uint256 public totalCarbonCredits;
    address public owner;
    uint256 public platformFeePercent = 250; // 2.5%
    uint256 public constant PERCENT_DIVISOR = 10000;
    
    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        string name,
        uint256 targetAmount,
        address beneficiary,
        uint256 deadline
    );
    
    event ContributionMade(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount,
        uint256 timestamp
    );
    
    event MilestoneCompleted(
        uint256 indexed campaignId,
        uint256 milestoneIndex,
        string description,
        uint256 timestamp
    );
    
    event MilestoneVerified(
        uint256 indexed campaignId,
        uint256 milestoneIndex,
        address verifier,
        uint256 timestamp
    );
    
    event FundsReleased(
        uint256 indexed campaignId,
        uint256 amount,
        address beneficiary,
        uint256 timestamp
    );
    
    event CarbonCreditsIssued(
        address indexed contributor,
        uint256 amount,
        uint256 campaignId
    );
    
    event RefundIssued(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Only authorized verifier");
        _;
    }
    
    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId > 0 && _campaignId <= campaignCounter, "Campaign does not exist");
        _;
    }
    
    modifier campaignActive(uint256 _campaignId) {
        require(campaigns[_campaignId].isActive, "Campaign not active");
        require(block.timestamp <= campaigns[_campaignId].deadline, "Campaign deadline passed");
        _;
    }
    
    constructor(address _usdcToken) {
        usdcToken = TestUSDC(_usdcToken);
        owner = msg.sender;
        verifiers[msg.sender] = true; // Owner is initial verifier
    }
    
    /**
     * @dev Create a new funding campaign for mangrove conservation
     */
    function createCampaign(
        string memory _name,
        string memory _description,
        string memory _location,
        uint256 _targetAmount,
        uint256 _deadline,
        address _beneficiary,
        uint256 _carbonCreditsExpected,
        uint256 _biodiversityScore
    ) external returns (uint256) {
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_beneficiary != address(0), "Invalid beneficiary address");
        
        campaignCounter++;
        
        Campaign storage newCampaign = campaigns[campaignCounter];
        newCampaign.id = campaignCounter;
        newCampaign.name = _name;
        newCampaign.description = _description;
        newCampaign.location = _location;
        newCampaign.targetAmount = _targetAmount;
        newCampaign.deadline = _deadline;
        newCampaign.beneficiary = _beneficiary;
        newCampaign.isActive = true;
        newCampaign.carbonCreditsExpected = _carbonCreditsExpected;
        newCampaign.biodiversityScore = _biodiversityScore;
        
        emit CampaignCreated(
            campaignCounter,
            _name,
            _targetAmount,
            _beneficiary,
            _deadline
        );
        
        return campaignCounter;
    }
    
    /**
     * @dev Add milestones to a campaign
     */
    function addMilestone(
        uint256 _campaignId,
        string memory _description,
        uint256 _targetAmount
    ) external campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.beneficiary || msg.sender == owner, "Not authorized");
        require(!campaign.fundsReleased, "Funds already released");
        
        uint256 milestoneIndex = campaign.milestoneCount;
        campaign.milestones[milestoneIndex] = Milestone({
            description: _description,
            targetAmount: _targetAmount,
            completed: false,
            verified: false,
            evidenceHash: "",
            completionDate: 0
        });
        campaign.milestoneCount++;
    }
    
    /**
     * @dev Contribute to a campaign
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
        require(
            usdcToken.transferFrom(msg.sender, address(this), _amount),
            "USDC transfer failed"
        );
        
        // Update campaign and contributor data
        campaign.raisedAmount += _amount;
        campaign.contributions[msg.sender] += _amount;
        
        Contributor storage contributor = contributors[msg.sender];
        if (contributor.campaignContributions[_campaignId] == 0) {
            contributor.campaignsSupported++;
        }
        contributor.totalContributions += _amount;
        contributor.campaignContributions[_campaignId] += _amount;
        
        totalFundsRaised += _amount;
        
        emit ContributionMade(_campaignId, msg.sender, _amount, block.timestamp);
        
        // Issue carbon credits proportionally
        uint256 carbonCredits = (_amount * campaign.carbonCreditsExpected) / campaign.targetAmount;
        if (carbonCredits > 0) {
            contributor.carbonCreditsEarned += carbonCredits;
            totalCarbonCredits += carbonCredits;
            emit CarbonCreditsIssued(msg.sender, carbonCredits, _campaignId);
        }
    }
    
    /**
     * @dev Mark a milestone as completed (by beneficiary)
     */
    function completeMilestone(
        uint256 _campaignId,
        uint256 _milestoneIndex,
        string memory _evidenceHash
    ) external campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.beneficiary, "Only beneficiary can complete milestones");
        require(_milestoneIndex < campaign.milestoneCount, "Invalid milestone index");
        
        Milestone storage milestone = campaign.milestones[_milestoneIndex];
        require(!milestone.completed, "Milestone already completed");
        
        milestone.completed = true;
        milestone.evidenceHash = _evidenceHash;
        milestone.completionDate = block.timestamp;
        
        emit MilestoneCompleted(_campaignId, _milestoneIndex, milestone.description, block.timestamp);
    }
    
    /**
     * @dev Verify a completed milestone (by authorized verifier)
     */
    function verifyMilestone(
        uint256 _campaignId,
        uint256 _milestoneIndex
    ) external onlyVerifier campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(_milestoneIndex < campaign.milestoneCount, "Invalid milestone index");
        
        Milestone storage milestone = campaign.milestones[_milestoneIndex];
        require(milestone.completed, "Milestone not completed");
        require(!milestone.verified, "Milestone already verified");
        
        milestone.verified = true;
        campaign.completedMilestones++;
        
        emit MilestoneVerified(_campaignId, _milestoneIndex, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Calculate milestone amounts for fund release
     */
    function _calculateMilestoneAmounts(uint256 _campaignId) 
        internal 
        view 
        returns (uint256 totalAmount, uint256 verifiedAmount) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        
        for (uint256 i = 0; i < campaign.milestoneCount; i++) {
            Milestone storage milestone = campaign.milestones[i];
            totalAmount += milestone.targetAmount;
            if (milestone.verified) {
                verifiedAmount += milestone.targetAmount;
            }
        }
    }
    
    /**
     * @dev Release funds to beneficiary based on completed milestones
     */
    function releaseFunds(uint256 _campaignId) external campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(
            msg.sender == campaign.beneficiary || msg.sender == owner,
            "Only beneficiary or owner can release funds"
        );
        require(campaign.raisedAmount > 0, "No funds to release");
        require(campaign.completedMilestones > 0, "No verified milestones");
        
        // Calculate releasable amount based on verified milestones
        (uint256 totalMilestoneAmount, uint256 verifiedMilestoneAmount) = _calculateMilestoneAmounts(_campaignId);
        
        uint256 releasableAmount = totalMilestoneAmount == 0 ? 
            campaign.raisedAmount : 
            (campaign.raisedAmount * verifiedMilestoneAmount) / totalMilestoneAmount;
        
        // Calculate fees and transfer
        uint256 platformFee = (releasableAmount * platformFeePercent) / PERCENT_DIVISOR;
        uint256 netAmount = releasableAmount - platformFee;
        
        // Transfer funds
        require(usdcToken.transfer(campaign.beneficiary, netAmount), "Transfer to beneficiary failed");
        require(usdcToken.transfer(owner, platformFee), "Platform fee transfer failed");
        
        campaign.fundsReleased = true;
        
        emit FundsReleased(_campaignId, netAmount, campaign.beneficiary, block.timestamp);
    }
    
    /**
     * @dev Refund contributors if campaign fails or deadline passes
     */
    function refund(uint256 _campaignId) external campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(
            block.timestamp > campaign.deadline || !campaign.isActive,
            "Campaign still active"
        );
        require(campaign.raisedAmount < campaign.targetAmount, "Campaign was successful");
        require(campaign.contributions[msg.sender] > 0, "No contribution to refund");
        
        uint256 refundAmount = campaign.contributions[msg.sender];
        campaign.contributions[msg.sender] = 0;
        campaign.raisedAmount -= refundAmount;
        
        // Update contributor data
        Contributor storage contributor = contributors[msg.sender];
        contributor.totalContributions -= refundAmount;
        contributor.campaignContributions[_campaignId] = 0;
        
        require(usdcToken.transfer(msg.sender, refundAmount), "Refund transfer failed");
        
        emit RefundIssued(_campaignId, msg.sender, refundAmount);
    }
    
    /**
     * @dev Add or remove verifiers (only owner)
     */
    function setVerifier(address _verifier, bool _status) external onlyOwner {
        verifiers[_verifier] = _status;
    }
    
    /**
     * @dev Update platform fee (only owner)
     */
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercent = _feePercent;
    }
    
    /**
     * @dev Deactivate a campaign (only owner or beneficiary)
     */
    function deactivateCampaign(uint256 _campaignId) external campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(
            msg.sender == campaign.beneficiary || msg.sender == owner,
            "Not authorized"
        );
        campaign.isActive = false;
    }
    
    // View functions - Split into smaller functions to avoid stack too deep
    function getCampaignBasicInfo(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (
            string memory name,
            string memory description,
            string memory location,
            address beneficiary
        ) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.name,
            campaign.description,
            campaign.location,
            campaign.beneficiary
        );
    }
    
    function getCampaignFundingInfo(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (
            uint256 targetAmount,
            uint256 raisedAmount,
            uint256 deadline,
            bool isActive,
            bool fundsReleased
        ) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.targetAmount,
            campaign.raisedAmount,
            campaign.deadline,
            campaign.isActive,
            campaign.fundsReleased
        );
    }
    
    function getCampaignEnvironmentalInfo(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (
            uint256 carbonCreditsExpected,
            uint256 biodiversityScore,
            uint256 milestoneCount,
            uint256 completedMilestones
        ) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.carbonCreditsExpected,
            campaign.biodiversityScore,
            campaign.milestoneCount,
            campaign.completedMilestones
        );
    }
    
    function getMilestone(uint256 _campaignId, uint256 _milestoneIndex)
        external
        view
        campaignExists(_campaignId)
        returns (
            string memory description,
            uint256 targetAmount,
            bool completed,
            bool verified,
            string memory evidenceHash,
            uint256 completionDate
        )
    {
        require(_milestoneIndex < campaigns[_campaignId].milestoneCount, "Invalid milestone index");
        Milestone storage milestone = campaigns[_campaignId].milestones[_milestoneIndex];
        return (
            milestone.description,
            milestone.targetAmount,
            milestone.completed,
            milestone.verified,
            milestone.evidenceHash,
            milestone.completionDate
        );
    }
    
    function getContributorInfo(address _contributor)
        external
        view
        returns (
            uint256 totalContributions,
            uint256 campaignsSupported,
            uint256 carbonCreditsEarned,
            bool isVerified
        )
    {
        Contributor storage contributor = contributors[_contributor];
        return (
            contributor.totalContributions,
            contributor.campaignsSupported,
            contributor.carbonCreditsEarned,
            contributor.isVerified
        );
    }
    
    function getContribution(uint256 _campaignId, address _contributor)
        external
        view
        campaignExists(_campaignId)
        returns (uint256)
    {
        return campaigns[_campaignId].contributions[_contributor];
    }
    
    function getCampaignProgress(uint256 _campaignId)
        external
        view
        campaignExists(_campaignId)
        returns (uint256 percentageRaised, uint256 daysLeft, bool isSuccessful)
    {
        Campaign storage campaign = campaigns[_campaignId];
        percentageRaised = (campaign.raisedAmount * 100) / campaign.targetAmount;
        
        if (block.timestamp >= campaign.deadline) {
            daysLeft = 0;
        } else {
            daysLeft = (campaign.deadline - block.timestamp) / 1 days;
        }
        
        isSuccessful = campaign.raisedAmount >= campaign.targetAmount;
    }
}
