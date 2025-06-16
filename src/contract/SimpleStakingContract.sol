// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Simple interface for USDC
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SimpleStakingContract {
    // State variables
    address public owner;
    address public usdcToken; // USDC token address
    
    // Staking tracking
    mapping(address => uint256) public userStakedAmount;
    mapping(address => uint256) public userCCEarned;
    mapping(address => uint256) public userHectaresSupported;
    mapping(address => uint256) public userVerificationPhase;
    mapping(address => uint256) public lastRewardTime;
    
    // CC Token tracking
    mapping(address => uint256) private _ccBalances;
    uint256 private _totalCCSupply;
    
    // Constants for calculations
    uint256 public constant CC_RATE_PER_USDC_PER_YEAR = 25; // 0.025 CC per USDC per year (scaled by 1000)
    uint256 public constant HECTARES_PER_USDC = 5; // 0.005 hectares per USDC (scaled by 1000)
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
    
    // ERC20 CC Token details
    string public constant CC_NAME = "Carbon Credit Token";
    string public constant CC_SYMBOL = "CC";
    uint8 public constant CC_DECIMALS = 18;
    
    // Events
    event Stake(address indexed user, uint256 usdcAmount);
    event ClaimRewards(address indexed user, uint256 ccAmount);
    event CCTransfer(address indexed from, address indexed to, uint256 value);
    event CCMint(address indexed to, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor(address _usdcToken) {
        owner = msg.sender;
        usdcToken = _usdcToken;
    }
    
    // CC Token ERC20 functions
    function ccTotalSupply() public view returns (uint256) {
        return _totalCCSupply;
    }
    
    function ccBalanceOf(address account) public view returns (uint256) {
        return _ccBalances[account];
    }
    
    function ccTransfer(address recipient, uint256 amount) public returns (bool) {
        _ccTransfer(msg.sender, recipient, amount);
        return true;
    }
    
    // Staking functions
    function stake(uint256 usdcAmount) public {
        require(usdcAmount > 0, "Amount must be greater than 0");
        
        // Transfer USDC from user to this contract
        IERC20(usdcToken).transferFrom(msg.sender, address(this), usdcAmount);
        
        // Update pending rewards before changing stake
        _updateRewards(msg.sender);
        
        // Add to user's stake
        userStakedAmount[msg.sender] += usdcAmount;
        
        // Calculate hectares supported (scaled down by 1000)
        userHectaresSupported[msg.sender] = (userStakedAmount[msg.sender] * HECTARES_PER_USDC) / 1000;
        
        // Update verification phase (1-3 based on stake amount)
        if (userStakedAmount[msg.sender] >= 1000 * 10**6) { // 1000 USDC (USDC has 6 decimals)
            userVerificationPhase[msg.sender] = 3;
        } else if (userStakedAmount[msg.sender] >= 500 * 10**6) { // 500 USDC
            userVerificationPhase[msg.sender] = 2;
        } else {
            userVerificationPhase[msg.sender] = 1;
        }
        
        emit Stake(msg.sender, usdcAmount);
    }
    
    // Calculate pending CC rewards
    function calculatePendingRewards(address user) public view returns (uint256) {
        if (userStakedAmount[user] == 0 || lastRewardTime[user] == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - lastRewardTime[user];
        uint256 yearlyReward = (userStakedAmount[user] * CC_RATE_PER_USDC_PER_YEAR) / 1000;
        uint256 pendingReward = (yearlyReward * timeElapsed) / SECONDS_PER_YEAR;
        
        return pendingReward;
    }
    
    // Update user rewards
    function _updateRewards(address user) internal {
        if (lastRewardTime[user] == 0) {
            lastRewardTime[user] = block.timestamp;
            return;
        }
        
        uint256 pendingReward = calculatePendingRewards(user);
        if (pendingReward > 0) {
            userCCEarned[user] += pendingReward;
            _ccMint(user, pendingReward);
        }
        
        lastRewardTime[user] = block.timestamp;
    }
    
    // Claim CC rewards
    function claimRewards() public {
        _updateRewards(msg.sender);
        
        uint256 rewards = userCCEarned[msg.sender];
        require(rewards > 0, "No rewards to claim");
        
        userCCEarned[msg.sender] = 0;
        // Tokens are already minted in _updateRewards
        emit ClaimRewards(msg.sender, rewards);
    }
    
    // Get user staking info
    function getUserStakingInfo(address user) public view returns (
        uint256 stakedAmount,
        uint256 ccEarned,
        uint256 hectaresSupported,
        uint256 verificationPhase,
        uint256 pendingRewards
    ) {
        return (
            userStakedAmount[user],
            userCCEarned[user],
            userHectaresSupported[user],
            userVerificationPhase[user],
            calculatePendingRewards(user)
        );
    }
    
    // Internal CC token functions
    function _ccTransfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "CC: transfer from the zero address");
        require(recipient != address(0), "CC: transfer to the zero address");
        
        uint256 senderBalance = _ccBalances[sender];
        require(senderBalance >= amount, "CC: transfer amount exceeds balance");
        
        _ccBalances[sender] = senderBalance - amount;
        _ccBalances[recipient] += amount;
        
        emit CCTransfer(sender, recipient, amount);
    }
    
    function _ccMint(address account, uint256 amount) internal {
        require(account != address(0), "CC: mint to the zero address");
        
        _totalCCSupply += amount;
        _ccBalances[account] += amount;
        
        emit CCTransfer(address(0), account, amount);
        emit CCMint(account, amount);
    }
    
    // Emergency functions
    function withdrawUSDC(uint256 amount) public onlyOwner {
        IERC20(usdcToken).transfer(owner, amount);
    }
    
    function emergencyWithdrawAll() public onlyOwner {
        uint256 balance = IERC20(usdcToken).balanceOf(address(this));
        IERC20(usdcToken).transfer(owner, balance);
    }
}
