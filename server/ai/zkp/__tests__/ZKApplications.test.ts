/// <reference types="jest" />
import { ZKApplications } from '../ZKApplications';

describe('ZKApplications', () => {
  let zkApp: ZKApplications;

  beforeEach(() => {
    zkApp = new ZKApplications();
  });

  describe('Salary Verification', () => {
    it('should create and verify valid salary proofs', () => {
      const actualSalary = 75000;
      const lowerBound = 50000;
      const upperBound = 100000;

      const proof = zkApp.createSalaryProof(actualSalary, lowerBound, upperBound);
      expect(zkApp.verifySalaryProof(proof)).toBe(true);
    });

    it('should reject salary proofs outside the range', () => {
      const actualSalary = 40000; // Below minimum
      const lowerBound = 50000;
      const upperBound = 100000;

      expect(() => {
        zkApp.createSalaryProof(actualSalary, lowerBound, upperBound);
      }).toThrow('Value out of range');
    });
  });

  describe('Age Verification', () => {
    it('should create and verify valid age proofs', () => {
      const now = Math.floor(Date.now() / 1000);
      const twentyOneYearsAgo = now - 21 * 365 * 24 * 60 * 60;
      const minimumAge = 18;

      const proof = zkApp.createAgeProof(twentyOneYearsAgo, minimumAge);
      expect(zkApp.verifyAgeProof(proof)).toBe(true);
    });

    it('should reject age proofs for underage individuals', () => {
      const now = Math.floor(Date.now() / 1000);
      const seventeenYearsAgo = now - 17 * 365 * 24 * 60 * 60;
      const minimumAge = 18;

      expect(() => {
        zkApp.createAgeProof(seventeenYearsAgo, minimumAge);
      }).toThrow('Value out of range');
    });
  });

  describe('Credit Score Verification', () => {
    it('should create and verify valid credit score proofs', () => {
      const actualScore = 750;
      const threshold = 700;
      const institution = 'Experian';

      const proof = zkApp.createCreditScoreProof(actualScore, threshold, institution);
      expect(zkApp.verifyCreditScoreProof(proof)).toBe(true);
    });

    it('should reject credit score proofs below threshold', () => {
      const actualScore = 650;
      const threshold = 700;
      const institution = 'Experian';

      expect(() => {
        zkApp.createCreditScoreProof(actualScore, threshold, institution);
      }).toThrow('Value out of range');
    });
  });

  describe('Proof of Funds', () => {
    it('should create and verify valid proof of funds', () => {
      const actualBalance = 100000;
      const minimumRequired = 50000;

      const proof = zkApp.createProofOfFunds(actualBalance, minimumRequired);
      expect(zkApp.verifyProofOfFunds(proof, minimumRequired)).toBe(true);
    });

    it('should reject proof of funds below minimum', () => {
      const actualBalance = 40000;
      const minimumRequired = 50000;

      expect(() => {
        zkApp.createProofOfFunds(actualBalance, minimumRequired);
      }).toThrow('Value out of range');
    });
  });
});
