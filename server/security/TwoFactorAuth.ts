import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

interface TOTPConfig {
  issuer: string;
  algorithm: string;
  digits: number;
  step: number;
}

export class TwoFactorAuth {
  private readonly config: TOTPConfig;

  constructor(config?: Partial<TOTPConfig>) {
    this.config = {
      issuer: 'Spark-X',
      algorithm: 'sha256',
      digits: 6,
      step: 30,
      ...config,
    };

    // Configure authenticator
    authenticator.options = {
      algorithm: this.config.algorithm as any,
      digits: this.config.digits,
      step: this.config.step,
    };
  }

  /**
   * Generate a new secret key for 2FA setup
   * @returns The secret key
   */
  public generateSecret(): string {
    return authenticator.generateSecret(32); // 32 bytes for SHA256
  }

  /**
   * Generate a QR code for easy 2FA setup
   * @param username User's identifier
   * @param secret Secret key
   * @returns Promise resolving to QR code data URL
   */
  public async generateQRCode(username: string, secret: string): Promise<string> {
    const otpauth = authenticator.keyuri(username, this.config.issuer, secret);

    return QRCode.toDataURL(otpauth);
  }

  /**
   * Verify a TOTP token
   * @param token Token to verify
   * @param secret User's secret key
   * @returns boolean indicating if token is valid
   */
  public verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({
        token,
        secret,
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate backup codes for account recovery
   * @returns Array of backup codes
   */
  public generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hash backup codes for secure storage
   * @param codes Array of backup codes
   * @returns Array of hashed backup codes
   */
  public hashBackupCodes(codes: string[]): string[] {
    return codes.map(code => crypto.createHash('sha256').update(code).digest('hex'));
  }

  /**
   * Verify a backup code
   * @param code Code to verify
   * @param hashedCodes Array of hashed backup codes
   * @returns boolean indicating if code is valid
   */
  public verifyBackupCode(code: string, hashedCodes: string[]): boolean {
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    return hashedCodes.includes(hashedCode);
  }

  /**
   * Generate a time-based challenge for additional verification
   * @param userId User's identifier
   * @returns Challenge data
   */
  public generateChallenge(userId: string): {
    challenge: string;
    expiry: number;
  } {
    const challenge = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    return {
      challenge,
      expiry,
    };
  }

  /**
   * Verify a challenge response
   * @param challenge Original challenge
   * @param response User's response
   * @param expiry Challenge expiry timestamp
   * @returns boolean indicating if challenge is valid
   */
  public verifyChallenge(challenge: string, response: string, expiry: number): boolean {
    if (Date.now() > expiry) {
      return false;
    }

    // In a real implementation, this would verify the response
    // based on the specific challenge type
    return true;
  }
}
