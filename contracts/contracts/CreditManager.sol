// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./SparkToken.sol";

/**
 * @title CreditManager
 * @dev Manages the credit system for AI agent usage and enterprise features
 */
contract CreditManager is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");

    SparkToken public sparkToken;

    // Credit costs for different agent services
    uint256 public constant IDEA_ENHANCEMENT_COST = 1;
    uint256 public constant MARKET_ANALYSIS_COST = 2;
    uint256 public constant TECHNICAL_ASSESSMENT_COST = 2;
    uint256 public constant RISK_ASSESSMENT_COST = 2;
    uint256 public constant IMPLEMENTATION_PLANNING_COST = 3;

    // Enterprise vault multipliers (basis points)
    uint256 public constant BASIC_MULTIPLIER = 9000;    // 90% of standard cost
    uint256 public constant PRO_MULTIPLIER = 8000;      // 80% of standard cost
    uint256 public constant ENTERPRISE_MULTIPLIER = 7000; // 70% of standard cost

    // Credit balances and usage tracking
    mapping(address => uint256) public creditBalances;
    mapping(address => uint256) public creditsUsed;
    mapping(address => uint256) public lastPurchaseTime;

    // Enterprise-specific tracking
    mapping(address => bool) public isEnterprise;
    mapping(address => mapping(string => uint256)) public enterpriseUsageStats;

    // Events
    event CreditsAdded(address indexed user, uint256 amount);
    event CreditsUsed(address indexed user, string agentType, uint256 amount);
    event EnterpriseStatusUpdated(address indexed enterprise, bool status);
    event AgentServiceUsed(
        address indexed user,
        string agentType,
        uint256 creditsUsed,
        uint256 remainingCredits
    );

    constructor(address _sparkToken) {
        require(_sparkToken != address(0), "Invalid token address");
        sparkToken = SparkToken(_sparkToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // Credit Management Functions

    function addCredits(address user, uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(
            hasRole(ADMIN_ROLE, msg.sender) || msg.sender == address(sparkToken),
            "Unauthorized"
        );

        creditBalances[user] += amount;
        lastPurchaseTime[user] = block.timestamp;

        emit CreditsAdded(user, amount);
    }

    function useCredits(
        address user,
        string memory agentType,
        uint256 amount
    ) external nonReentrant whenNotPaused onlyRole(AGENT_ROLE) {
        require(creditBalances[user] >= amount, "Insufficient credits");

        uint256 adjustedAmount = calculateAdjustedCost(user, amount);
        creditBalances[user] -= adjustedAmount;
        creditsUsed[user] += adjustedAmount;

        if (isEnterprise[user]) {
            enterpriseUsageStats[user][agentType] += adjustedAmount;
        }

        emit CreditsUsed(user, agentType, adjustedAmount);
    }

    // Service Usage Functions

    function useIdeaEnhancement(address user) external nonReentrant whenNotPaused onlyRole(AGENT_ROLE) {
        useAgentService(user, "IdeaEnhancement", IDEA_ENHANCEMENT_COST);
    }

    function useMarketAnalysis(address user) external nonReentrant whenNotPaused onlyRole(AGENT_ROLE) {
        useAgentService(user, "MarketAnalysis", MARKET_ANALYSIS_COST);
    }

    function useTechnicalAssessment(address user) external nonReentrant whenNotPaused onlyRole(AGENT_ROLE) {
        useAgentService(user, "TechnicalAssessment", TECHNICAL_ASSESSMENT_COST);
    }

    function useRiskAssessment(address user) external nonReentrant whenNotPaused onlyRole(AGENT_ROLE) {
        useAgentService(user, "RiskAssessment", RISK_ASSESSMENT_COST);
    }

    function useImplementationPlanning(address user) external nonReentrant whenNotPaused onlyRole(AGENT_ROLE) {
        useAgentService(user, "ImplementationPlanning", IMPLEMENTATION_PLANNING_COST);
    }

    // Enterprise Management Functions

    function setEnterpriseStatus(address enterprise, bool status) external onlyRole(ADMIN_ROLE) {
        isEnterprise[enterprise] = status;
        emit EnterpriseStatusUpdated(enterprise, status);
    }

    function getEnterpriseStats(
        address enterprise,
        string memory agentType
    ) external view returns (uint256) {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || msg.sender == enterprise,
            "Unauthorized"
        );
        return enterpriseUsageStats[enterprise][agentType];
    }

    // Internal Functions

    function calculateAdjustedCost(address user, uint256 amount) internal view returns (uint256) {
        SparkToken.VaultTier tier = sparkToken.enterpriseVaults(user);
        
        if (tier == SparkToken.VaultTier.ENTERPRISE) {
            return (amount * ENTERPRISE_MULTIPLIER) / 10000;
        } else if (tier == SparkToken.VaultTier.PRO) {
            return (amount * PRO_MULTIPLIER) / 10000;
        } else if (tier == SparkToken.VaultTier.BASIC) {
            return (amount * BASIC_MULTIPLIER) / 10000;
        }
        
        return amount;
    }

    function useAgentService(
        address user,
        string memory agentType,
        uint256 baseCost
    ) internal {
        uint256 adjustedCost = calculateAdjustedCost(user, baseCost);
        require(creditBalances[user] >= adjustedCost, "Insufficient credits");

        creditBalances[user] -= adjustedCost;
        creditsUsed[user] += adjustedCost;

        if (isEnterprise[user]) {
            enterpriseUsageStats[user][agentType] += adjustedCost;
        }

        emit AgentServiceUsed(
            user,
            agentType,
            adjustedCost,
            creditBalances[user]
        );
    }

    // Admin Functions

    function grantAgentRole(address agent) external onlyRole(ADMIN_ROLE) {
        _grantRole(AGENT_ROLE, agent);
    }

    function revokeAgentRole(address agent) external onlyRole(ADMIN_ROLE) {
        _revokeRole(AGENT_ROLE, agent);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
