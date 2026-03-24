import crypto from 'crypto';

export interface EncryptionResult {
  encryptedData: Buffer;
  key: string;
  iv: string;
}

export interface DecryptionInput {
  encryptedData: Buffer;
  key: string;
  iv: string;
}

export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly defaultPassword = 'blockchain-secure-2024'; // Default password

  /**
   * Derive encryption key from password using PBKDF2
   */
  private deriveKeyFromPassword(password: string, salt: string): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha256');
  }

  /**
   * Generate a random encryption key
   */
  generateKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  /**
   * Generate a random initialization vector
   */
  generateIV(): string {
    return crypto.randomBytes(this.ivLength).toString('hex');
  }

  /**
   * Generate salt for password-based encryption
   */
  generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Encrypt file buffer using password-based encryption
   */
  encryptFileWithPassword(fileBuffer: Buffer, password?: string): EncryptionResult {
    try {
      const actualPassword = password || this.defaultPassword;
      const salt = this.generateSalt();
      const iv = this.generateIV();

      // Derive key from password
      const key = this.deriveKeyFromPassword(actualPassword, salt);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, Buffer.from(iv, 'hex'));

      // Encrypt the file
      const encrypted = Buffer.concat([
        cipher.update(fileBuffer),
        cipher.final()
      ]);

      return {
        encryptedData: encrypted,
        key: salt, // Store salt instead of key
        iv
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt file buffer using password
   */
  decryptFileWithPassword(input: DecryptionInput, password?: string): Buffer {
    try {
      const actualPassword = password || this.defaultPassword;
      const salt = input.key; // key field contains salt

      // Derive key from password
      const key = this.deriveKeyFromPassword(actualPassword, salt);

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, Buffer.from(input.iv, 'hex'));

      // Decrypt the file
      const decrypted = Buffer.concat([
        decipher.update(input.encryptedData),
        decipher.final()
      ]);

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed - Invalid password or corrupted file`);
    }
  }

  /**
   * Encrypt file buffer using AES-256-CBC
   */
  encryptFile(fileBuffer: Buffer, userId: string): EncryptionResult {
    try {
      // Generate unique key and IV for this file
      const key = this.generateKey();
      const iv = this.generateIV();

      // Create cipher with key and IV
      const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));

      // Encrypt the file
      const encrypted = Buffer.concat([
        cipher.update(fileBuffer),
        cipher.final()
      ]);

      return {
        encryptedData: encrypted,
        key,
        iv
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt file buffer using AES-256-CBC
   */
  decryptFile(input: DecryptionInput, userId: string): Buffer {
    try {
      // Create decipher with key and IV
      const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(input.key, 'hex'), Buffer.from(input.iv, 'hex'));

      // Decrypt the file
      const decrypted = Buffer.concat([
        decipher.update(input.encryptedData),
        decipher.final()
      ]);

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt a string (for metadata or small data)
   */
  encryptString(text: string, key?: string): { encrypted: string; key: string; iv: string } {
    const encryptionKey = key || this.generateKey();
    const iv = this.generateIV();

    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(encryptionKey, 'hex'), Buffer.from(iv, 'hex'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      key: encryptionKey,
      iv
    };
  }

  /**
   * Decrypt a string
   */
  decryptString(encryptedText: string, key: string, iv: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate a secure filename for encrypted storage
   */
  generateSecureFilename(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const hash = crypto.createHash('sha256')
      .update(`${originalName}${userId}${timestamp}${random}`)
      .digest('hex')
      .substring(0, 16);
    
    return `${hash}_${timestamp}.enc`;
  }

  /**
   * Verify encryption key format
   */
  isValidKey(key: string): boolean {
    try {
      const keyBuffer = Buffer.from(key, 'hex');
      return keyBuffer.length === this.keyLength;
    } catch {
      return false;
    }
  }

  /**
   * Verify IV format
   */
  isValidIV(iv: string): boolean {
    try {
      const ivBuffer = Buffer.from(iv, 'hex');
      return ivBuffer.length === this.ivLength;
    } catch {
      return false;
    }
  }
}