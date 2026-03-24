import axios from 'axios';
import FormData from 'form-data';

export interface PinataUploadResult {
  hash: string;
  size: number;
}

export interface PinataConfig {
  apiKey: string;
  apiSecret: string;
  gatewayUrl: string;
  timeout: number;
  enabled: boolean;
}

// Load config dynamically to ensure env vars are loaded
function loadPinataConfig(): PinataConfig {
  return {
    apiKey: process.env.PINATA_API_KEY || '',
    apiSecret: process.env.PINATA_API_SECRET || '',
    gatewayUrl: process.env.PINATA_GATEWAY_URL || 'https://api.pinata.cloud',
    timeout: parseInt(process.env.IPFS_TIMEOUT || '30000', 10),
    enabled: process.env.IPFS_ENABLED === 'true',
  };
}

export const pinataConfig = loadPinataConfig();

export class PinataService {
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;
  private initialized: boolean = false;
  private connectionVerified: boolean = false;
  private config: PinataConfig | null = null;

  constructor() {
    // Don't initialize immediately - wait for first use
  }

  private getConfig(): PinataConfig {
    if (!this.config) {
      this.config = loadPinataConfig();
      console.log('🔍 Debug - Pinata Config:', {
        apiKey: this.config.apiKey ? `${this.config.apiKey.substring(0, 10)}...` : 'MISSING',
        apiSecret: this.config.apiSecret ? `${this.config.apiSecret.substring(0, 10)}...` : 'MISSING',
        enabled: this.config.enabled,
        gateway: this.config.gatewayUrl
      });
    }
    return this.config;
  }

  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const config = this.getConfig();

    if (!config.enabled) {
      console.log('⚠️  Pinata/IPFS is disabled in configuration');
      this.initialized = true;
      return;
    }

    if (!config.apiKey || !config.apiSecret) {
      console.error('❌ Pinata API credentials are missing');
      console.error(`   PINATA_API_KEY: ${config.apiKey ? 'SET' : 'MISSING'}`);
      console.error(`   PINATA_API_SECRET: ${config.apiSecret ? 'SET' : 'MISSING'}`);
      console.error(`   Check your backend/.env file`);
      this.initialized = true;
      return;
    }

    // Verify connection
    try {
      await this.testAuthentication();
      this.connectionVerified = true;
      console.log('✅ Pinata IPFS connected successfully');
      console.log(`   Gateway: ${config.gatewayUrl}`);
    } catch (error) {
      console.error('❌ Pinata connection failed:', error instanceof Error ? error.message : error);
      console.error('   Check your API credentials');
    }

    this.initialized = true;
  }

  /**
   * Test Pinata authentication
   */
  private async testAuthentication(): Promise<void> {
    const config = this.getConfig();
    const url = `${config.gatewayUrl}/data/testAuthentication`;
    
    const response = await axios.get(url, {
      headers: {
        pinata_api_key: config.apiKey,
        pinata_secret_api_key: config.apiSecret,
      },
      timeout: config.timeout,
    });

    if (response.data.message !== 'Congratulations! You are communicating with the Pinata API!') {
      throw new Error('Authentication test failed');
    }
  }

  /**
   * Check if Pinata service is available
   */
  public async isAvailable(): Promise<boolean> {
    await this.initialize();
    const config = this.getConfig();
    return this.initialized && this.connectionVerified && config.enabled;
  }

  /**
   * Upload encrypted file to IPFS via Pinata
   */
  public async uploadFile(encryptedBuffer: Buffer, filename?: string): Promise<PinataUploadResult> {
    await this.initialize();
    const config = this.getConfig();
    
    if (!(await this.isAvailable())) {
      throw new Error('Pinata IPFS service is not available');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`Pinata upload attempt ${attempt}/${this.retryAttempts}`);

        const formData = new FormData();
        formData.append('file', encryptedBuffer, {
          filename: filename || 'encrypted-file',
        });

        // Optional: Add metadata
        const metadata = JSON.stringify({
          name: filename || 'encrypted-file',
          keyvalues: {
            encrypted: 'true',
            uploadedAt: new Date().toISOString(),
          },
        });
        formData.append('pinataMetadata', metadata);

        // Optional: Pin options
        const pinataOptions = JSON.stringify({
          cidVersion: 1,
        });
        formData.append('pinataOptions', pinataOptions);

        const url = `${config.gatewayUrl}/pinning/pinFileToIPFS`;
        
        const response = await axios.post(url, formData, {
          headers: {
            ...formData.getHeaders(),
            pinata_api_key: config.apiKey,
            pinata_secret_api_key: config.apiSecret,
          },
          timeout: config.timeout,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        });

        const ipfsHash = response.data.IpfsHash;
        const size = response.data.PinSize;

        console.log(`File uploaded to IPFS via Pinata: ${ipfsHash}`);

        return {
          hash: ipfsHash,
          size: size,
        };
      } catch (error) {
        lastError = error as Error;
        console.error(
          `Pinata upload attempt ${attempt} failed:`,
          error instanceof Error ? error.message : error
        );

        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(
      `Failed to upload file to Pinata after ${this.retryAttempts} attempts: ${lastError?.message}`
    );
  }

  /**
   * Retrieve file from IPFS via Pinata gateway
   */
  public async retrieveFile(ipfsHash: string): Promise<Buffer> {
    await this.initialize();
    const config = this.getConfig();
    
    if (!(await this.isAvailable())) {
      throw new Error('Pinata IPFS service is not available');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`IPFS retrieval attempt ${attempt}/${this.retryAttempts} for hash: ${ipfsHash}`);

        // Use Pinata's dedicated gateway
        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

        const response = await axios.get(gatewayUrl, {
          responseType: 'arraybuffer',
          timeout: config.timeout,
        });

        const buffer = Buffer.from(response.data);
        console.log(`File retrieved from IPFS: ${ipfsHash} (${buffer.length} bytes)`);

        return buffer;
      } catch (error) {
        lastError = error as Error;
        console.error(
          `IPFS retrieval attempt ${attempt} failed:`,
          error instanceof Error ? error.message : error
        );

        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(
      `Failed to retrieve file from IPFS after ${this.retryAttempts} attempts: ${lastError?.message}`
    );
  }

  /**
   * Unpin a file from Pinata (cleanup when deleting)
   */
  public async unpinFile(ipfsHash: string): Promise<void> {
    await this.initialize();
    const config = this.getConfig();
    
    if (!(await this.isAvailable())) {
      console.warn('Pinata service is not available, skipping unpin operation');
      return;
    }

    try {
      const url = `${config.gatewayUrl}/pinning/unpin/${ipfsHash}`;

      await axios.delete(url, {
        headers: {
          pinata_api_key: config.apiKey,
          pinata_secret_api_key: config.apiSecret,
        },
        timeout: config.timeout,
      });

      console.log(`File unpinned from Pinata: ${ipfsHash}`);
    } catch (error) {
      console.error(
        `Failed to unpin file from Pinata: ${ipfsHash}`,
        error instanceof Error ? error.message : error
      );
      // Don't throw error - unpinning failure is not critical
    }
  }

  /**
   * Get Pinata account info
   */
  public async getNodeInfo(): Promise<any> {
    await this.initialize();
    const config = this.getConfig();
    
    if (!(await this.isAvailable())) {
      return { 
        available: false, 
        error: 'Pinata IPFS service is not available',
        provider: 'Pinata'
      };
    }

    try {
      const url = `${config.gatewayUrl}/data/testAuthentication`;
      
      const response = await axios.get(url, {
        headers: {
          pinata_api_key: config.apiKey,
          pinata_secret_api_key: config.apiSecret,
        },
        timeout: config.timeout,
      });

      return {
        available: true,
        provider: 'Pinata',
        message: response.data.message,
        gateway: 'https://gateway.pinata.cloud',
      };
    } catch (error) {
      return {
        available: false,
        provider: 'Pinata',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const pinataService = new PinataService();
