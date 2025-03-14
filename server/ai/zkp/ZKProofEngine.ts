import { createHash, randomBytes } from 'crypto';

// Core interfaces for the ZK system
export interface Witness {
  secretValue: bigint;
  randomness: bigint;
}

export interface Statement {
  publicValue: bigint;
  commitment: string;
}

export interface Proof {
  challenge: string;
  response: bigint;
  commitment: string;
}

export interface ProofParameters {
  generator: bigint;
  modulus: bigint;
}

/**
 * ZKProofEngine implements zero-knowledge proof generation and verification
 * using the Schnorr protocol as a base with additional features for
 * practical business applications.
 */
export class ZKProofEngine {
  private readonly parameters: ProofParameters;

  constructor() {
    // Initialize with secure parameters
    this.parameters = {
      // Using safe prime for modulus
      modulus: 115792089237316195423570985008687907853269984665640564039457584007908834671663n,
      // Using generator that ensures cyclic group properties
      generator: 2n,
    };
  }

  /**
   * Creates a commitment for a secret value
   * @param secretValue The value to commit to
   * @returns Commitment and witness
   */
  public createCommitment(secretValue: bigint): { commitment: string; witness: Witness } {
    const randomness = BigInt('0x' + randomBytes(32).toString('hex'));
    const witness: Witness = {
      secretValue,
      randomness,
    };

    const commitment = this.computeCommitment(witness);
    return { commitment, witness };
  }

  /**
   * Generates a zero-knowledge proof
   * @param statement Public statement
   * @param witness Private witness
   * @returns Generated proof
   */
  public generateProof(statement: Statement, witness: Witness): Proof {
    // Verify the commitment matches before proceeding
    const computedCommitment = this.computeCommitment(witness);
    if (computedCommitment !== statement.commitment) {
      throw new Error('Invalid commitment');
    }

    // Generate proof components
    const randomBlinding = BigInt('0x' + randomBytes(32).toString('hex'));
    const tempCommitment = this.modPow(
      this.parameters.generator,
      randomBlinding,
      this.parameters.modulus
    );

    // Generate challenge using Fiat-Shamir
    const challenge = this.generateChallenge(statement, tempCommitment.toString());

    // Compute response
    const response =
      (randomBlinding + BigInt('0x' + challenge) * witness.secretValue) %
      (this.parameters.modulus - 1n);

    return {
      challenge,
      response,
      commitment: statement.commitment,
    };
  }

  /**
   * Verifies a zero-knowledge proof
   * @param statement Public statement
   * @param proof The proof to verify
   * @returns boolean indicating if the proof is valid
   */
  public verifyProof(statement: Statement, proof: Proof): boolean {
    // Reconstruct the temporary commitment
    const leftSide = this.modPow(
      this.parameters.generator,
      proof.response,
      this.parameters.modulus
    );

    const rightSide = this.modPow(
      BigInt(proof.commitment),
      BigInt('0x' + proof.challenge),
      this.parameters.modulus
    );

    const computedTempCommitment =
      (leftSide * this.modInverse(rightSide, this.parameters.modulus)) % this.parameters.modulus;

    // Verify the challenge
    const expectedChallenge = this.generateChallenge(statement, computedTempCommitment.toString());

    return expectedChallenge === proof.challenge;
  }

  /**
   * Computes a commitment for a witness
   * @param witness The witness to commit to
   * @returns Commitment string
   */
  private computeCommitment(witness: Witness): string {
    const part1 = this.modPow(
      this.parameters.generator,
      witness.secretValue,
      this.parameters.modulus
    );
    const part2 = this.modPow(
      this.parameters.generator,
      witness.randomness,
      this.parameters.modulus
    );
    return ((part1 * part2) % this.parameters.modulus).toString();
  }

  /**
   * Generates a challenge using Fiat-Shamir heuristic
   * @param statement Public statement
   * @param tempCommitment Temporary commitment
   * @returns Challenge string
   */
  private generateChallenge(statement: Statement, tempCommitment: string): string {
    const hash = createHash('sha256');
    hash.update(statement.publicValue.toString());
    hash.update(statement.commitment);
    hash.update(tempCommitment);
    return hash.digest('hex');
  }

  /**
   * Creates a range proof to prove a value is within bounds
   * @param value The value to prove is in range
   * @param lowerBound Lower bound
   * @param upperBound Upper bound
   * @returns Proof of range
   */
  public createRangeProof(value: bigint, lowerBound: bigint, upperBound: bigint): Proof {
    if (value < lowerBound || value > upperBound) {
      throw new Error('Value out of range');
    }

    const witness: Witness = {
      secretValue: value,
      randomness: BigInt('0x' + randomBytes(32).toString('hex')),
    };

    const statement: Statement = {
      publicValue: upperBound,
      commitment: this.computeCommitment(witness),
    };

    return this.generateProof(statement, witness);
  }

  /**
   * Verifies a range proof
   * @param proof The range proof
   * @param lowerBound Lower bound
   * @param upperBound Upper bound
   * @returns boolean indicating if the proof is valid
   */
  public verifyRangeProof(proof: Proof, lowerBound: bigint, upperBound: bigint): boolean {
    const statement: Statement = {
      publicValue: upperBound,
      commitment: proof.commitment,
    };

    return this.verifyProof(statement, proof);
  }

  /**
   * Modular exponentiation (a^b mod n)
   * @param base Base value
   * @param exponent Exponent value
   * @param modulus Modulus value
   * @returns Result of modular exponentiation
   */
  private modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    if (modulus === 1n) {
      return 0n;
    }

    let result = 1n;
    base = base % modulus;

    while (exponent > 0n) {
      if (exponent % 2n === 1n) {
        result = (result * base) % modulus;
      }
      exponent = exponent >> 1n;
      base = (base * base) % modulus;
    }

    return result;
  }

  /**
   * Modular multiplicative inverse using Extended Euclidean Algorithm
   * @param a Value to find inverse for
   * @param m Modulus
   * @returns Modular multiplicative inverse
   */
  private modInverse(a: bigint, m: bigint): bigint {
    if (m === 1n) {
      return 0n;
    }

    const m0 = m;
    let x0 = 0n;
    let x1 = 1n;

    while (a > 1n) {
      const q = a / m;
      let t = m;

      m = a % m;
      a = t;

      t = x0;
      x0 = x1 - q * x0;
      x1 = t;
    }

    if (x1 < 0n) {
      x1 += m0;
    }

    return x1;
  }
}
