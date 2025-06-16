// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

interface ICarbonCreditToken {
    function stake(address user, uint256 usdcAmount) external;
    function getUserStakingInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 ccEarned,
        uint256 hectaresSupported,
        uint256 verificationPhase,
        uint256 pendingRewards
    );
}

contract MangroveStaking {
    IERC20 public immutable usdcToken;
    ICarbonCreditToken public immutable ccToken;
    
    address public owner;
    address public feeRecipient;
    uint256 public stakingFeePercent = 250; // 2.5% fee (250 basis points)
    
    // Mangrove region tracking
    mapping(uint256 => string) public mangroveRegions;
    mapping(address => mapping(uint256 => uint256)) public userRegionStakes;
    mapping(uint256 => uint256) public totalRegionStaking;
    
    uint256 public nextRegionId = 1;
    uint256 public constant BASIS_POINTS = 10000;
    
    // Events
    event StakeDeposited(address indexed user, uint256 indexed regionId, uint256 amount, uint256 fee);
    event StakeWithdrawn(address indexed user, uint256 indexed regionId, uint256 amount);
    event MangroveRegionAdded(uint256 indexed regionId, string regionName);
    event FeeUpdated(uint256 newFeePercent);
    event FeeRecipientUpdated(address newRecipient);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier validRegion(uint256 regionId) {
        require(regionId > 0 && regionId < nextRegionId, "Invalid region ID");
        _;
    }
    
    constructor(
        address _usdcToken,
        address _ccToken,
        address _feeRecipient
    ) {
        require(_usdcToken != address(0), "Invalid USDC token address");
        require(_ccToken != address(0), "Invalid CC token address");
        require(_feeRecipient != address(0), "Invalid fee recipient address");
        
        usdcToken = IERC20(_usdcToken);
        ccToken = ICarbonCreditToken(_ccToken);
        owner = msg.sender;
        feeRecipient = _feeRecipient;
        
        // Add default mangrove regions
        _addMangroveRegion("Sundarbans, Bangladesh");
        _addMangroveRegion("Everglades, Florida");
        _addMangroveRegion("Mangroves of Borneo");
        _addMangroveRegion("Red Sea Mangroves");
        _addMangroveRegion("Amazon River Delta");
    }
    
    /**
     * @dev Stake USDC in a specific mangrove region
     * @param regionId The ID of the mangrove region
     * @param amount The amount of USDC to stake (in USDC decimals, typically 6)
     */
    function stakeUSDC(uint256 regionId, uint256 amount) external validRegion(regionId) {
        require(amount > 0, "Amount must be greater than 0");
        
        // Check user has enough USDC and allowance
        require(usdcToken.balanceOf(msg.sender) >= amount, "Insufficient USDC balance");
        require(usdcToken.allowance(msg.sender, address(this)) >= amount, "Insufficient USDC allowance");
        
        // Calculate fee
        uint256 fee = (amount * stakingFeePercent) / BASIS_POINTS;
        uint256 stakeAmount = amount - fee;
        
        // Transfer USDC from user
        require(usdcToken.transferFrom(msg.sender, address(this), stakeAmount), "USDC transfer failed");
        
        // Transfer fee to fee recipient
        if (fee > 0) {
            require(usdcToken.transferFrom(msg.sender, feeRecipient, fee), "Fee transfer failed");
        }
        
        // Update region stakes
        userRegionStakes[msg.sender][regionId] += stakeAmount;
        totalRegionStaking[regionId] += stakeAmount;
        
        // Notify CC token contract about the stake
        ccToken.stake(msg.sender, stakeAmount);
        
        emit StakeDeposited(msg.sender, regionId, stakeAmount, fee);
    }
    
    /**
     * @dev Withdraw staked USDC from a specific region
     * @param regionId The ID of the mangrove region
     * @param amount The amount of USDC to withdraw
     */
    function withdrawStake(uint256 regionId, uint256 amount) external validRegion(regionId) {
        require(amount > 0, "Amount must be greater than 0");
        require(userRegionStakes[msg.sender][regionId] >= amount, "Insufficient staked amount");
        
        // Update stakes
        userRegionStakes[msg.sender][regionId] -= amount;
        totalRegionStaking[regionId] -= amount;
        
        // Transfer USDC back to user
        require(usdcToken.transfer(msg.sender, amount), "USDC transfer failed");
        
        emit StakeWithdrawn(msg.sender, regionId, amount);
    }
    
    /**
     * @dev Get user's total staked amount across all regions
     */
    function getUserTotalStaked(address user) external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 1; i < nextRegionId; i++) {
            total += userRegionStakes[user][i];
        }
        return total;
    }
    
    /**
     * @dev Get user's staked amount in a specific region
     */
    function getUserRegionStake(address user, uint256 regionId) external view returns (uint256) {
        return userRegionStakes[user][regionId];
    }
    
    /**
     * @dev Get total staked amount in a specific region
     */
    function getRegionTotalStaking(uint256 regionId) external view returns (uint256) {
        return totalRegionStaking[regionId];
    }
    
    /**
     * @dev Get user's staking info from CC token contract
     */
    function getUserStakingInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 ccEarned,
        uint256 hectaresSupported,
        uint256 verificationPhase,
        uint256 pendingRewards
    ) {
        return ccToken.getUserStakingInfo(user);
    }
    
    /**
     * @dev Get all available mangrove regions
     */
    function getAllRegions() external view returns (uint256[] memory regionIds, string[] memory regionNames) {
        uint256 count = nextRegionId - 1;
        regionIds = new uint256[](count);
        regionNames = new string[](count);
        
        for (uint256 i = 0; i < count; i++) {
            regionIds[i] = i + 1;
            regionNames[i] = mangroveRegions[i + 1];
        }
        
        return (regionIds, regionNames);
    }
    
    /**
     * @dev Add a new mangrove region (owner only)
     */
    function addMangroveRegion(string memory regionName) external onlyOwner {
        _addMangroveRegion(regionName);
    }
    
    function _addMangroveRegion(string memory regionName) internal {
        require(bytes(regionName).length > 0, "Region name cannot be empty");
        
        mangroveRegions[nextRegionId] = regionName;
        emit MangroveRegionAdded(nextRegionId, regionName);
        nextRegionId++;
    }
    
    /**
     * @dev Update staking fee percentage (owner only)
     */
    function setStakingFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "Fee cannot exceed 10%"); // Max 10%
        stakingFeePercent = newFeePercent;
        emit FeeUpdated(newFeePercent);
    }
    
    /**
     * @dev Update fee recipient (owner only)
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient address");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }
    
    /**
     * @dev Emergency withdrawal function (owner only)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }
    
    /**
     * @dev Get contract USDC balance
     */
    function getContractBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }
}
