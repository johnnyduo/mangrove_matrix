// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CarbonCreditToken {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    string public name = "Carbon Credit Token";
    string public symbol = "CC";
    uint8 public decimals = 18;
    
    address public owner;
    address public stakingContract; // Address that can mint CC tokens
    
    // Staking tracking
    mapping(address => uint256) public userStakedAmount;
    mapping(address => uint256) public userCCEarned;
    mapping(address => uint256) public userHectaresSupported;
    mapping(address => uint256) public userVerificationPhase;
    mapping(address => uint256) public lastRewardTime;
    
    // Constants for calculations
    uint256 public constant CC_RATE_PER_USDC_PER_YEAR = 25; // 0.025 CC per USDC per year (scaled by 1000)
    uint256 public constant HECTARES_PER_USDC = 5; // 0.005 hectares per USDC (scaled by 1000)
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);
    event Stake(address indexed user, uint256 usdcAmount);
    event ClaimRewards(address indexed user, uint256 ccAmount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyStakingContract() {
        require(msg.sender == stakingContract || msg.sender == owner, "Only staking contract can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        stakingContract = msg.sender; // Initially set owner as staking contract
    }
    
    // Set staking contract address
    function setStakingContract(address _stakingContract) public onlyOwner {
        stakingContract = _stakingContract;
    }
    
    // Standard ERC-20 functions
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address recipient, uint256 amount) public returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }
    
    function allowance(address _owner, address spender) public view returns (uint256) {
        return _allowances[_owner][spender];
    }
    
    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, currentAllowance - amount);
        
        return true;
    }
    
    // Staking functions
    function stake(address user, uint256 usdcAmount) public onlyStakingContract {
        // Update pending rewards before changing stake
        _updateRewards(user);
        
        // Add to user's stake
        userStakedAmount[user] += usdcAmount;
        
        // Calculate hectares supported (scaled down by 1000)
        userHectaresSupported[user] = (userStakedAmount[user] * HECTARES_PER_USDC) / 1000;
        
        // Update verification phase (1-3 based on stake amount)
        if (userStakedAmount[user] >= 1000 * 10**6) { // 1000 USDC (USDC has 6 decimals)
            userVerificationPhase[user] = 3;
        } else if (userStakedAmount[user] >= 500 * 10**6) { // 500 USDC
            userVerificationPhase[user] = 2;
        } else {
            userVerificationPhase[user] = 1;
        }
        
        emit Stake(user, usdcAmount);
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
            _mint(user, pendingReward);
        }
        
        lastRewardTime[user] = block.timestamp;
    }
    
    // Claim CC rewards
    function claimRewards() public {
        _updateRewards(msg.sender);
        
        uint256 rewards = userCCEarned[msg.sender];
        require(rewards > 0, "No rewards to claim");
        
        userCCEarned[msg.sender] = 0;
        // Tokens are already minted in _updateRewards, so we just emit event
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
    
    // Manual mint function for owner (for testing)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    // Internal functions
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        
        uint256 senderBalance = _balances[sender];
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        
        _balances[sender] = senderBalance - amount;
        _balances[recipient] += amount;
        
        emit Transfer(sender, recipient, amount);
    }
    
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");
        
        _totalSupply += amount;
        _balances[account] += amount;
        
        emit Transfer(address(0), account, amount);
        emit Mint(account, amount);
    }
    
    function _approve(address _owner, address spender, uint256 amount) internal {
        require(_owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        
        _allowances[_owner][spender] = amount;
        emit Approval(_owner, spender, amount);
    }
    
    // Emergency functions
    function pause() public onlyOwner {
        // Implementation for pausing the contract if needed
    }
    
    function unpause() public onlyOwner {
        // Implementation for unpausing the contract if needed
    }
}
