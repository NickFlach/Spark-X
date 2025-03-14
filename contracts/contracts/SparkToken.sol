// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SparkToken
 * @dev Implementation of the Spark Token with credit system, staking, and enterprise features
 */
contract SparkToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Credit system parameters
    uint256 public constant CREDIT_DECIMALS = 18;
    uint256 public creditConversionRate; // How many tokens per credit
    uint256 public creditBurnRate; // Percentage of tokens burned per credit use (basis points)

    // Staking parameters
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    uint256 public minStakeDuration;
    uint256 public maxStakeDuration;

    // Enterprise vault parameters
    mapping(address => VaultTier) public enterpriseVaults;
    uint256 public constant BASIC_TIER_REQUIREMENT = 1000 * 10**18; // 1000 tokens
    uint256 public constant PRO_TIER_REQUIREMENT = 5000 * 10**18;  // 5000 tokens
    uint256 public constant ENTERPRISE_TIER_REQUIREMENT = 20000 * 10**18; // 20000 tokens

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 duration;
        bool locked;
    }

    enum VaultTier { NONE, BASIC, PRO, ENTERPRISE }

    // Events
    event CreditsPurchased(address indexed buyer, uint256 creditAmount, uint256 tokenAmount);
    event TokensStaked(address indexed staker, uint256 amount, uint256 duration);
    event TokensUnstaked(address indexed staker, uint256 amount);
    event VaultTierUpdated(address indexed enterprise, VaultTier tier);

    constructor()
        ERC20("Spark Token", "SPARK")
        ERC20Permit("Spark Token")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);

        creditConversionRate = 100 * 10**18; // 100 tokens per credit
        creditBurnRate = 500; // 5% burn rate (500 basis points)
        minStakeDuration = 30 days;
        maxStakeDuration = 365 days;
    }

    /**
     * @dev Creates `amount` new tokens for `to`.
     * See {ERC20-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the `MINTER_ROLE`.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // Credit System Functions

    function purchaseCredits(uint256 creditAmount) external nonReentrant whenNotPaused {
        require(creditAmount > 0, "Credit amount must be greater than 0");
        
        uint256 tokenAmount = creditAmount * creditConversionRate;
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");

        uint256 burnAmount = (tokenAmount * creditBurnRate) / 10000;
        uint256 reserveAmount = tokenAmount - burnAmount;

        _burn(msg.sender, burnAmount);
        _transfer(msg.sender, address(this), reserveAmount);

        emit CreditsPurchased(msg.sender, creditAmount, tokenAmount);
    }

    // Staking Functions

    function stake(uint256 amount, uint256 duration) external nonReentrant whenNotPaused {
        require(amount > 0, "Stake amount must be greater than 0");
        require(duration >= minStakeDuration && duration <= maxStakeDuration, "Invalid stake duration");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        StakeInfo storage userStake = stakes[msg.sender];
        require(!userStake.locked, "Existing stake is locked");

        _transfer(msg.sender, address(this), amount);

        userStake.amount = amount;
        userStake.startTime = block.timestamp;
        userStake.duration = duration;
        userStake.locked = true;

        totalStaked += amount;

        emit TokensStaked(msg.sender, amount, duration);
    }

    function unstake() external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.locked, "No active stake");
        require(block.timestamp >= userStake.startTime + userStake.duration, "Stake is still locked");

        uint256 amount = userStake.amount;
        _transfer(address(this), msg.sender, amount);

        totalStaked -= amount;
        delete stakes[msg.sender];

        emit TokensUnstaked(msg.sender, amount);
    }

    // Enterprise Vault Functions

    function updateVaultTier(address enterprise) external nonReentrant whenNotPaused {
        uint256 balance = balanceOf(enterprise);
        VaultTier newTier;

        if (balance >= ENTERPRISE_TIER_REQUIREMENT) {
            newTier = VaultTier.ENTERPRISE;
        } else if (balance >= PRO_TIER_REQUIREMENT) {
            newTier = VaultTier.PRO;
        } else if (balance >= BASIC_TIER_REQUIREMENT) {
            newTier = VaultTier.BASIC;
        } else {
            newTier = VaultTier.NONE;
        }

        enterpriseVaults[enterprise] = newTier;
        emit VaultTierUpdated(enterprise, newTier);
    }

    // Admin Functions

    function setConversionRate(uint256 newRate) external onlyRole(ADMIN_ROLE) {
        require(newRate > 0, "Invalid conversion rate");
        creditConversionRate = newRate;
    }

    function setBurnRate(uint256 newRate) external onlyRole(ADMIN_ROLE) {
        require(newRate <= 10000, "Burn rate cannot exceed 100%");
        creditBurnRate = newRate;
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // Required overrides

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}
