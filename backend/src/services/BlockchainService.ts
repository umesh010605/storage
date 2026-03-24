import crypto from 'crypto';

export interface Block {
  index: number;
  timestamp: number;
  data: FileTransaction;
  previousHash: string;
  hash: string;
  nonce: number;
}

export interface FileTransaction {
  fileId: string;
  userId: string;
  fileName: string;
  ipfsHash: string;
  fileSize: number;
  action: 'upload' | 'download' | 'delete';
  encryptionHash: string; // Hash of encryption key for verification
}

export class BlockchainService {
  private chain: Block[];
  private difficulty: number = 2; // Mining difficulty (number of leading zeros)

  constructor() {
    this.chain = [];
    this.createGenesisBlock();
  }

  /**
   * Create the first block in the chain
   */
  private createGenesisBlock(): void {
    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now(),
      data: {
        fileId: 'genesis',
        userId: 'system',
        fileName: 'Genesis Block',
        ipfsHash: '',
        fileSize: 0,
        action: 'upload',
        encryptionHash: ''
      },
      previousHash: '0',
      hash: '',
      nonce: 0
    };

    genesisBlock.hash = this.calculateHash(genesisBlock);
    this.chain.push(genesisBlock);
    console.log('🔗 Blockchain initialized with genesis block');
  }

  /**
   * Calculate hash for a block
   */
  private calculateHash(block: Block): string {
    const data = 
      block.index +
      block.timestamp +
      JSON.stringify(block.data) +
      block.previousHash +
      block.nonce;

    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Mine a new block (Proof of Work)
   */
  private mineBlock(block: Block): Block {
    const target = '0'.repeat(this.difficulty);
    
    console.log('\n⛏️  ========== MINING STARTED ==========');
    console.log(`📦 Block #${block.index}`);
    console.log(`🎯 Target: Hash must start with "${target}"`);
    console.log(`📊 Difficulty: ${this.difficulty}`);
    
    const startTime = Date.now();
    let attempts = 0;
    
    while (!block.hash.startsWith(target)) {
      block.nonce++;
      attempts++;
      block.hash = this.calculateHash(block);
      
      // Show progress every 1000 attempts
      if (attempts % 1000 === 0) {
        console.log(`   Attempt ${attempts}: ${block.hash.substring(0, 10)}... ❌`);
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`\n✅ BLOCK MINED SUCCESSFULLY!`);
    console.log(`   Hash: ${block.hash}`);
    console.log(`   Nonce: ${block.nonce}`);
    console.log(`   Attempts: ${attempts}`);
    console.log(`   Time: ${duration}ms`);
    console.log(`   Previous Hash: ${block.previousHash.substring(0, 20)}...`);
    console.log('⛏️  ====================================\n');
    
    return block;
  }

  /**
   * Add a new transaction to the blockchain
   */
  public addTransaction(transaction: FileTransaction): Block {
    console.log('\n🔗 ========== NEW TRANSACTION ==========');
    console.log(`📄 File: ${transaction.fileName}`);
    console.log(`👤 User: ${transaction.userId}`);
    console.log(`🎬 Action: ${transaction.action.toUpperCase()}`);
    console.log(`📦 IPFS Hash: ${transaction.ipfsHash.substring(0, 20)}...`);
    console.log(`💾 Size: ${transaction.fileSize} bytes`);
    
    const previousBlock = this.getLatestBlock();
    
    const newBlock: Block = {
      index: previousBlock.index + 1,
      timestamp: Date.now(),
      data: transaction,
      previousHash: previousBlock.hash,
      hash: '',
      nonce: 0
    };

    const minedBlock = this.mineBlock(newBlock);
    this.chain.push(minedBlock);

    console.log(`\n✅ Transaction added to blockchain`);
    console.log(`   Block Index: #${minedBlock.index}`);
    console.log(`   Blockchain Length: ${this.chain.length} blocks`);
    console.log('🔗 ======================================\n');
    
    return minedBlock;
  }

  /**
   * Get the latest block in the chain
   */
  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Get the entire blockchain
   */
  public getChain(): Block[] {
    return this.chain;
  }

  /**
   * Get blocks for a specific user
   */
  public getUserBlocks(userId: string): Block[] {
    return this.chain.filter(block => block.data.userId === userId);
  }

  /**
   * Get blocks for a specific file
   */
  public getFileBlocks(fileId: string): Block[] {
    return this.chain.filter(block => block.data.fileId === fileId);
  }

  /**
   * Verify blockchain integrity
   */
  public isChainValid(): boolean {
    console.log('\n🔍 ========== VALIDATING BLOCKCHAIN ==========');
    
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      console.log(`\n📦 Validating Block #${i}:`);
      
      // Verify current block hash
      const calculatedHash = this.calculateHash(currentBlock);
      console.log(`   Current Hash: ${currentBlock.hash.substring(0, 30)}...`);
      console.log(`   Calculated Hash: ${calculatedHash.substring(0, 30)}...`);
      
      if (currentBlock.hash !== calculatedHash) {
        console.error(`   ❌ Block #${i} has been tampered with`);
        console.log('🔍 ============================================\n');
        return false;
      }
      console.log(`   ✅ Hash is valid`);

      // Verify chain linkage
      console.log(`   Previous Hash: ${currentBlock.previousHash.substring(0, 30)}...`);
      console.log(`   Expected: ${previousBlock.hash.substring(0, 30)}...`);
      
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`   ❌ Block #${i} is not properly linked`);
        console.log('🔍 ============================================\n');
        return false;
      }
      console.log(`   ✅ Chain linkage is valid`);

      // Verify proof of work
      const target = '0'.repeat(this.difficulty);
      if (!currentBlock.hash.startsWith(target)) {
        console.error(`   ❌ Block #${i} does not meet difficulty requirement`);
        console.log('🔍 ============================================\n');
        return false;
      }
      console.log(`   ✅ Proof of Work is valid`);
    }

    console.log(`\n✅ BLOCKCHAIN IS VALID - All ${this.chain.length} blocks verified`);
    console.log('🔍 ============================================\n');
    return true;
  }

  /**
   * Verify a file's integrity using blockchain
   */
  public verifyFile(fileId: string, ipfsHash: string): {
    valid: boolean;
    message: string;
    blocks: Block[];
  } {
    const fileBlocks = this.getFileBlocks(fileId);

    if (fileBlocks.length === 0) {
      return {
        valid: false,
        message: 'File not found in blockchain',
        blocks: []
      };
    }

    // Check if IPFS hash matches
    const uploadBlock = fileBlocks.find(b => b.data.action === 'upload');
    if (!uploadBlock) {
      return {
        valid: false,
        message: 'Upload record not found',
        blocks: fileBlocks
      };
    }

    if (uploadBlock.data.ipfsHash !== ipfsHash) {
      return {
        valid: false,
        message: 'IPFS hash mismatch - file may have been tampered with',
        blocks: fileBlocks
      };
    }

    return {
      valid: true,
      message: 'File verified successfully',
      blocks: fileBlocks
    };
  }

  /**
   * Get blockchain statistics
   */
  public getStats(): {
    totalBlocks: number;
    totalTransactions: number;
    uploads: number;
    downloads: number;
    deletes: number;
    isValid: boolean;
  } {
    const transactions = this.chain.slice(1); // Exclude genesis block

    return {
      totalBlocks: this.chain.length,
      totalTransactions: transactions.length,
      uploads: transactions.filter(b => b.data.action === 'upload').length,
      downloads: transactions.filter(b => b.data.action === 'download').length,
      deletes: transactions.filter(b => b.data.action === 'delete').length,
      isValid: this.isChainValid()
    };
  }

  /**
   * Export blockchain to JSON
   */
  public exportChain(): string {
    return JSON.stringify(this.chain, null, 2);
  }

  /**
   * Import blockchain from JSON
   */
  public importChain(chainData: string): boolean {
    try {
      const importedChain = JSON.parse(chainData) as Block[];
      
      // Validate imported chain
      this.chain = importedChain;
      if (this.isChainValid()) {
        console.log('✅ Blockchain imported successfully');
        return true;
      } else {
        console.error('❌ Imported blockchain is invalid');
        this.chain = [];
        this.createGenesisBlock();
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to import blockchain:', error);
      return false;
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
