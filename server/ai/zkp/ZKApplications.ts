import { ZKProofEngine, Proof } from './ZKProofEngine';

interface SalaryProof {
  proof: Proof;
  bounds: {
    lower: bigint;
    upper: bigint;
  };
}

interface AgeVerification {
  proof: Proof;
  minimumAge: number;
  timestamp: number;
}

interface CreditScoreProof {
  proof: Proof;
  threshold: number;
  institution: string;
}

/**
 * ZKApplications provides practical business applications of zero-knowledge proofs
 * for common use cases like salary verification, age verification, and credit scores.
 */
export class ZKApplications {
  private readonly zkEngine: ZKProofEngine;

  constructor() {
    this.zkEngine = new ZKProofEngine();
  }

  /**
   * Creates a proof that a salary is within a specific range without revealing the exact amount
   * @param actualSalary The actual salary to prove
   * @param lowerBound Minimum salary requirement
   * @param upperBound Maximum salary limit
   * @returns Salary range proof
   */
  public createSalaryProof(
    actualSalary: number,
    lowerBound: number,
    upperBound: number
  ): SalaryProof {
    const salary = BigInt(actualSalary);
    const lower = BigInt(lowerBound);
    const upper = BigInt(upperBound);

    const proof = this.zkEngine.createRangeProof(salary, lower, upper);

    return {
      proof,
      bounds: { lower, upper },
    };
  }

  /**
   * Verifies a salary proof
   * @param salaryProof The salary proof to verify
   * @returns boolean indicating if the proof is valid
   */
  public verifySalaryProof(salaryProof: SalaryProof): boolean {
    return this.zkEngine.verifyRangeProof(
      salaryProof.proof,
      salaryProof.bounds.lower,
      salaryProof.bounds.upper
    );
  }

  /**
   * Creates a proof of being above a minimum age without revealing exact age
   * @param actualBirthTimestamp Unix timestamp of actual birth date
   * @param minimumAge Minimum age requirement
   * @returns Age verification proof
   */
  public createAgeProof(actualBirthTimestamp: number, minimumAge: number): AgeVerification {
    const now = Math.floor(Date.now() / 1000);
    const minimumBirthTimestamp = now - minimumAge * 365 * 24 * 60 * 60;

    const birthDate = BigInt(actualBirthTimestamp);
    const minDate = BigInt(minimumBirthTimestamp);
    const maxDate = BigInt(now);

    const proof = this.zkEngine.createRangeProof(birthDate, minDate, maxDate);

    return {
      proof,
      minimumAge,
      timestamp: now,
    };
  }

  /**
   * Verifies an age proof
   * @param ageProof The age proof to verify
   * @returns boolean indicating if the proof is valid
   */
  public verifyAgeProof(ageProof: AgeVerification): boolean {
    const now = Math.floor(Date.now() / 1000);
    const minimumBirthTimestamp = now - ageProof.minimumAge * 365 * 24 * 60 * 60;

    return this.zkEngine.verifyRangeProof(
      ageProof.proof,
      BigInt(minimumBirthTimestamp),
      BigInt(now)
    );
  }

  /**
   * Creates a proof that a credit score is above a threshold
   * @param actualScore The actual credit score
   * @param threshold Minimum required score
   * @param institution Credit reporting institution
   * @returns Credit score proof
   */
  public createCreditScoreProof(
    actualScore: number,
    threshold: number,
    institution: string
  ): CreditScoreProof {
    const score = BigInt(actualScore);
    const minScore = BigInt(threshold);
    const maxScore = BigInt(850); // Maximum possible credit score

    const proof = this.zkEngine.createRangeProof(score, minScore, maxScore);

    return {
      proof,
      threshold,
      institution,
    };
  }

  /**
   * Verifies a credit score proof
   * @param creditProof The credit score proof to verify
   * @returns boolean indicating if the proof is valid
   */
  public verifyCreditScoreProof(creditProof: CreditScoreProof): boolean {
    return this.zkEngine.verifyRangeProof(
      creditProof.proof,
      BigInt(creditProof.threshold),
      BigInt(850)
    );
  }

  /**
   * Creates a proof of funds without revealing exact amount
   * @param actualBalance The actual balance to prove
   * @param minimumRequired Minimum required balance
   * @returns Proof of funds
   */
  public createProofOfFunds(actualBalance: number, minimumRequired: number): Proof {
    const balance = BigInt(actualBalance);
    const minimum = BigInt(minimumRequired);
    const maximum = BigInt(Number.MAX_SAFE_INTEGER);

    return this.zkEngine.createRangeProof(balance, minimum, maximum);
  }

  /**
   * Verifies a proof of funds
   * @param proof The proof to verify
   * @param minimumRequired Minimum required balance
   * @returns boolean indicating if the proof is valid
   */
  public verifyProofOfFunds(proof: Proof, minimumRequired: number): boolean {
    return this.zkEngine.verifyRangeProof(
      proof,
      BigInt(minimumRequired),
      BigInt(Number.MAX_SAFE_INTEGER)
    );
  }
}
