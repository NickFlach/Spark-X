import { parseUnits } from 'ethers';
import { IdeaToken } from './IdeaToken';
import { ZKProofEngine, Proof } from '../zkp/ZKProofEngine';

interface GovernanceConfig {
  votingThreshold: bigint;
  implementationReward: bigint;
  validationReward: bigint;
  stakingRequirement: bigint;
  cooldownPeriod: number; // in seconds
}

interface Proposal {
  id: string;
  ideaId: string;
  type: 'implementation' | 'validation' | 'reward' | 'parameter';
  proposer: string;
  timestamp: number;
  votes: Map<string, Proof>;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  executionData?: any;
}

/**
 * IdeaGovernance implements a privacy-preserving governance system
 * for managing idea tokens, voting, and rewards distribution.
 */
export class IdeaGovernance {
  private readonly zkEngine: ZKProofEngine;
  private readonly config: GovernanceConfig;
  private readonly ideas: Map<string, IdeaToken>;
  private readonly proposals: Map<string, Proposal>;
  private readonly stakingBalances: Map<string, bigint>;
  private readonly rewardPool: bigint;

  constructor(config: GovernanceConfig) {
    this.zkEngine = new ZKProofEngine();
    this.config = config;
    this.ideas = new Map();
    this.proposals = new Map();
    this.stakingBalances = new Map();
    this.rewardPool = 0n;
  }

  /**
   * Creates a new idea token with governance parameters
   * @param metadata Idea metadata
   * @returns Created idea token
   */
  public createIdea(metadata: any): IdeaToken {
    const idea = new IdeaToken(metadata);
    this.ideas.set(metadata.id, idea);
    return idea;
  }

  /**
   * Creates a governance proposal with privacy protection
   * @param type Proposal type
   * @param ideaId Target idea ID
   * @param proposer Proposer's address
   * @param executionData Optional execution data
   * @returns Created proposal
   */
  public createProposal(
    type: Proposal['type'],
    ideaId: string,
    proposer: string,
    executionData?: any
  ): Proposal {
    // Verify proposer has sufficient stake
    const stake = this.stakingBalances.get(proposer) || 0n;
    if (stake < this.config.stakingRequirement) {
      throw new Error('Insufficient stake to create proposal');
    }

    const proposal: Proposal = {
      id: `${ideaId}-${Date.now()}`,
      ideaId,
      type,
      proposer,
      timestamp: Date.now(),
      votes: new Map(),
      status: 'active',
      executionData,
    };

    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  /**
   * Casts a private vote on a proposal
   * @param proposalId Proposal ID
   * @param voter Voter's address
   * @param voteAmount Voting amount
   * @returns Proof of valid vote
   */
  public castVote(proposalId: string, voter: string, voteAmount: bigint): Proof {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'active') {
      throw new Error('Invalid or inactive proposal');
    }

    const idea = this.ideas.get(proposal.ideaId);
    if (!idea) {
      throw new Error('Invalid idea');
    }

    // Create and verify vote proof
    const proof = idea.createVote(voter, voteAmount);
    if (!idea.verifyVote(voter, proof)) {
      throw new Error('Invalid vote proof');
    }

    proposal.votes.set(voter, proof);
    this.checkProposalThreshold(proposalId);

    return proof;
  }

  /**
   * Stakes tokens for governance participation
   * @param address Staker's address
   * @param amount Stake amount
   * @returns Proof of valid stake
   */
  public stake(address: string, amount: bigint): Proof {
    const currentStake = this.stakingBalances.get(address) || 0n;
    const newStake = currentStake + amount;

    // Create proof of valid stake amount
    const proof = this.zkEngine.createRangeProof(
      amount,
      0n,
      this.config.stakingRequirement * 2n // Allow up to 2x requirement
    );

    this.stakingBalances.set(address, newStake);
    return proof;
  }

  /**
   * Distributes rewards with privacy protection
   * @param ideaId Idea ID
   * @param recipients Reward recipients
   * @returns Map of proofs for each recipient
   */
  public distributeRewards(ideaId: string, recipients: string[]): Map<string, Proof> {
    const idea = this.ideas.get(ideaId);
    if (!idea) {
      throw new Error('Invalid idea');
    }

    const rewardProofs = new Map<string, Proof>();
    const rewardPerRecipient = this.config.implementationReward / BigInt(recipients.length);

    for (const recipient of recipients) {
      const proof = this.zkEngine.createRangeProof(
        rewardPerRecipient,
        0n,
        this.config.implementationReward
      );
      rewardProofs.set(recipient, proof);
    }

    return rewardProofs;
  }

  /**
   * Checks if a proposal has reached the voting threshold
   * @param proposalId Proposal ID
   * @returns boolean indicating if threshold is reached
   */
  private checkProposalThreshold(proposalId: string): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      return false;
    }

    let totalVotes = 0n;
    for (const [_, proof] of proposal.votes) {
      // We can verify the proof without knowing the exact vote amount
      if (this.zkEngine.verifyRangeProof(proof, 0n, this.config.votingThreshold)) {
        totalVotes = totalVotes + 1n;
      }
    }

    if (totalVotes >= this.config.votingThreshold) {
      proposal.status = 'passed';
      this.executeProposal(proposalId);
      return true;
    }

    return false;
  }

  /**
   * Executes a passed proposal
   * @param proposalId Proposal ID
   * @returns boolean indicating execution success
   */
  private executeProposal(proposalId: string): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'passed') {
      return false;
    }

    const idea = this.ideas.get(proposal.ideaId);
    if (!idea) {
      return false;
    }

    // Execute based on proposal type
    switch (proposal.type) {
      case 'implementation':
        // Mark idea as implemented
        idea.updateStage('implemented');
        // Distribute implementation rewards
        this.distributeRewards(proposal.ideaId, [proposal.proposer]);
        break;
      case 'validation':
        // Mark idea as validated
        idea.updateStage('validated');
        // Distribute validation rewards
        this.distributeRewards(proposal.ideaId, [proposal.proposer]);
        break;
      case 'reward':
        // Custom reward distribution
        if (proposal.executionData && proposal.executionData.recipients) {
          this.distributeRewards(proposal.ideaId, proposal.executionData.recipients);
        }
        break;
      case 'parameter':
        // Update governance parameters
        // Implementation would update specific parameters
        break;
    }

    proposal.status = 'executed';
    return true;
  }

  /**
   * Gets proposal details
   * @param proposalId Proposal ID
   * @returns Proposal details
   */
  public getProposal(proposalId: string): Omit<Proposal, 'votes'> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error('Invalid proposal');
    }

    // Return proposal without revealing individual votes
    const { votes, ...publicDetails } = proposal;
    return publicDetails;
  }

  /**
   * Gets governance configuration
   * @returns Current governance config
   */
  public getConfig(): GovernanceConfig {
    return this.config;
  }
}
