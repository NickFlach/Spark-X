// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title AnalyticsRegistry
 * @dev Contract for registering analytics data hashes on the blockchain
 * to ensure data integrity and provide verifiable proof of analytics data
 */
contract AnalyticsRegistry is Ownable {
    using ECDSA for bytes32;

    // Events
    event DataRegistered(address indexed user, bytes32 dataHash, uint256 timestamp);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    // Mapping of data hashes to their metadata
    mapping(bytes32 => DataEntry) public dataRegistry;
    
    // Approved verifiers
    mapping(address => bool) public verifiers;

    // Data structure for registered analytics
    struct DataEntry {
        address user;
        uint256 timestamp;
        bool exists;
    }

    constructor() Ownable(msg.sender) {
        // Initialize contract
    }

    /**
     * @dev Register a new analytics data hash
     * @param dataHash Hash of the analytics data
     */
    function registerData(bytes32 dataHash) external {
        require(!dataRegistry[dataHash].exists, "Data hash already registered");
        
        dataRegistry[dataHash] = DataEntry({
            user: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        emit DataRegistered(msg.sender, dataHash, block.timestamp);
    }

    /**
     * @dev Register data on behalf of a user (requires verifier status)
     * @param user Address of the user
     * @param dataHash Hash of the analytics data
     */
    function registerDataFor(address user, bytes32 dataHash) external {
        require(verifiers[msg.sender], "Not an authorized verifier");
        require(!dataRegistry[dataHash].exists, "Data hash already registered");
        
        dataRegistry[dataHash] = DataEntry({
            user: user,
            timestamp: block.timestamp,
            exists: true
        });
        
        emit DataRegistered(user, dataHash, block.timestamp);
    }

    /**
     * @dev Verify if a data hash exists and belongs to a specific user
     * @param user Address of the user
     * @param dataHash Hash of the analytics data
     * @return bool True if the data hash exists and belongs to the user
     */
    function verifyData(address user, bytes32 dataHash) external view returns (bool) {
        DataEntry memory entry = dataRegistry[dataHash];
        return entry.exists && entry.user == user;
    }

    /**
     * @dev Add a new verifier
     * @param verifier Address of the verifier
     */
    function addVerifier(address verifier) external onlyOwner {
        require(!verifiers[verifier], "Already a verifier");
        verifiers[verifier] = true;
        emit VerifierAdded(verifier);
    }

    /**
     * @dev Remove a verifier
     * @param verifier Address of the verifier
     */
    function removeVerifier(address verifier) external onlyOwner {
        require(verifiers[verifier], "Not a verifier");
        verifiers[verifier] = false;
        emit VerifierRemoved(verifier);
    }
}
