// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AnalyticsRegistry.sol";

/**
 * @title PrivacyManager
 * @dev Contract for managing privacy settings and consent for analytics data
 */
contract PrivacyManager is Ownable {
    // Events
    event ConsentUpdated(address indexed user, bool hasConsented);
    event PrivacyLevelSet(address indexed user, uint8 privacyLevel);
    event DataRemovalRequested(address indexed user, bytes32 dataHash);
    event DataRemovalProcessed(address indexed user, bytes32 dataHash, bool success);

    // Reference to the AnalyticsRegistry contract
    AnalyticsRegistry public analyticsRegistry;
    
    // Privacy levels
    // 0: Public - Data can be used without restrictions
    // 1: Limited - Data can be used with some restrictions
    // 2: Private - Data can only be used in aggregated form
    // 3: Restricted - Data cannot be used for analytics
    mapping(address => uint8) public privacyLevels;
    
    // Consent status
    mapping(address => bool) public userConsent;
    
    // Data removal requests
    mapping(bytes32 => bool) public removalRequests;

    constructor(address _analyticsRegistry) Ownable(msg.sender) {
        analyticsRegistry = AnalyticsRegistry(_analyticsRegistry);
    }

    /**
     * @dev Update user consent status
     * @param hasConsented Whether the user consents to data collection
     */
    function updateConsent(bool hasConsented) external {
        userConsent[msg.sender] = hasConsented;
        emit ConsentUpdated(msg.sender, hasConsented);
    }

    /**
     * @dev Set user privacy level
     * @param level Privacy level (0-3)
     */
    function setPrivacyLevel(uint8 level) external {
        require(level <= 3, "Invalid privacy level");
        privacyLevels[msg.sender] = level;
        emit PrivacyLevelSet(msg.sender, level);
    }

    /**
     * @dev Request removal of specific data
     * @param dataHash Hash of the data to be removed
     */
    function requestDataRemoval(bytes32 dataHash) external {
        require(analyticsRegistry.verifyData(msg.sender, dataHash), "Data not found or not owned by user");
        removalRequests[dataHash] = true;
        emit DataRemovalRequested(msg.sender, dataHash);
    }

    /**
     * @dev Process a data removal request (admin only)
     * @param user Address of the user
     * @param dataHash Hash of the data to be removed
     * @param success Whether the removal was successful
     */
    function processRemovalRequest(address user, bytes32 dataHash, bool success) external onlyOwner {
        require(removalRequests[dataHash], "No removal request found");
        if (success) {
            removalRequests[dataHash] = false;
        }
        emit DataRemovalProcessed(user, dataHash, success);
    }

    /**
     * @dev Check if user has consented to data collection
     * @param user Address of the user
     * @return bool Whether the user has consented
     */
    function hasConsented(address user) external view returns (bool) {
        return userConsent[user];
    }

    /**
     * @dev Get user's privacy level
     * @param user Address of the user
     * @return uint8 Privacy level
     */
    function getPrivacyLevel(address user) external view returns (uint8) {
        return privacyLevels[user];
    }
}
