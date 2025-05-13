import { Memory, MemoryAccess, MemoryAccessType, MemoryType } from './memory';

// Cache replacement policies
export enum CacheReplacementPolicy {
  LRU = 'LRU',
  FIFO = 'FIFO',
  RANDOM = 'RANDOM',
}

// Cache configuration interface
export interface CacheConfig {
  sizeBytes: number;
  blockSizeBytes: number;
  associativity: number;
  accessLatency: number;
  replacementPolicy: CacheReplacementPolicy;
}

// Cache block representation
interface CacheBlock {
  valid: boolean;
  tag: number;
  data: Uint32Array;
  lastAccessed: number; // For LRU policy
  loaded: number; // For FIFO policy
}

// Cache set representation (collection of blocks)
interface CacheSet {
  blocks: CacheBlock[];
}

// Base cache class
export abstract class Cache implements Memory {
  protected sets: CacheSet[] = [];
  protected config: CacheConfig;
  protected nextLevelMemory: Memory;
  protected memoryType: MemoryType;
  protected name: string;
  
  // Cache statistics
  protected accessCount: number = 0;
  protected hitCount: number = 0;
  protected missCount: number = 0;
  protected accessLog: MemoryAccess[] = [];
  
  constructor(
    config: CacheConfig, 
    nextLevelMemory: Memory, 
    memoryType: MemoryType,
    name: string
  ) {
    this.config = config;
    this.nextLevelMemory = nextLevelMemory;
    this.memoryType = memoryType;
    this.name = name;
    this.initialize();
  }
  
  private initialize(): void {
    // Calculate cache organization
    const blockSizeWords = this.config.blockSizeBytes / 4;
    const numBlocks = this.config.sizeBytes / this.config.blockSizeBytes;
    const numSets = numBlocks / this.config.associativity;
    
    // Initialize cache sets and blocks
    this.sets = new Array(numSets);
    for (let i = 0; i < numSets; i++) {
      const blocks: CacheBlock[] = [];
      for (let j = 0; j < this.config.associativity; j++) {
        blocks.push({
          valid: false,
          tag: 0,
          data: new Uint32Array(blockSizeWords),
          lastAccessed: 0,
          loaded: 0
        });
      }
      this.sets[i] = { blocks };
    }
  }
  
  // Get cache block index, set index, and tag from address
  protected getAddressComponents(address: number): { 
    blockOffset: number; 
    setIndex: number; 
    tag: number;
    blockAddress: number;
  } {
    const blockOffsetBits = Math.log2(this.config.blockSizeBytes);
    const blockSizeWords = this.config.blockSizeBytes / 4;
    const numSets = this.config.sizeBytes / (this.config.blockSizeBytes * this.config.associativity);
    const setIndexBits = Math.log2(numSets);
    
    const blockOffset = (address % this.config.blockSizeBytes) / 4; // Convert to word offset
    const setIndex = (address >> blockOffsetBits) % numSets;
    const tag = address >> (blockOffsetBits + setIndexBits);
    const blockAddress = address - (address % this.config.blockSizeBytes);
    
    return { blockOffset, setIndex, tag, blockAddress };
  }
  
  // Find block in cache, return index if found or -1 if not found
  protected findBlock(setIndex: number, tag: number): number {
    const set = this.sets[setIndex];
    for (let i = 0; i < set.blocks.length; i++) {
      if (set.blocks[i].valid && set.blocks[i].tag === tag) {
        return i;
      }
    }
    return -1;
  }
  
  // Select victim block for replacement
  protected selectVictim(setIndex: number): number {
    const set = this.sets[setIndex];
    
    switch (this.config.replacementPolicy) {
      case CacheReplacementPolicy.LRU: {
        // Find least recently used block
        let lruIndex = 0;
        let lruTime = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < set.blocks.length; i++) {
          if (!set.blocks[i].valid) {
            return i; // Use invalid block first
          }
          if (set.blocks[i].lastAccessed < lruTime) {
            lruTime = set.blocks[i].lastAccessed;
            lruIndex = i;
          }
        }
        return lruIndex;
      }
      
      case CacheReplacementPolicy.FIFO: {
        // Find first-in block
        let fifoIndex = 0;
        let fifoTime = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < set.blocks.length; i++) {
          if (!set.blocks[i].valid) {
            return i; // Use invalid block first
          }
          if (set.blocks[i].loaded < fifoTime) {
            fifoTime = set.blocks[i].loaded;
            fifoIndex = i;
          }
        }
        return fifoIndex;
      }
      
      case CacheReplacementPolicy.RANDOM:
      default:
        // Use invalid block if available
        for (let i = 0; i < set.blocks.length; i++) {
          if (!set.blocks[i].valid) {
            return i;
          }
        }
        // Otherwise, select random block
        return Math.floor(Math.random() * set.blocks.length);
    }
  }
  
  // Load a block from next level memory
  protected async loadBlock(setIndex: number, blockIndex: number, blockAddress: number): Promise<void> {
    const blockSizeWords = this.config.blockSizeBytes / 4;
    const set = this.sets[setIndex];
    
    // Load data from next level memory
    for (let i = 0; i < blockSizeWords; i++) {
      const wordAddress = blockAddress + (i * 4);
      set.blocks[blockIndex].data[i] = await this.nextLevelMemory.read(wordAddress, 0);
    }
    
    // Update block metadata
    set.blocks[blockIndex].valid = true;
    set.blocks[blockIndex].tag = this.getAddressComponents(blockAddress).tag;
    set.blocks[blockIndex].lastAccessed = performance.now();
    set.blocks[blockIndex].loaded = performance.now();
  }
  
  // Read data from cache or next level memory
  public async read(address: number, coreId: number): Promise<number> {
    this.accessCount++;
    
    // Get address components
    const { blockOffset, setIndex, tag, blockAddress } = this.getAddressComponents(address);
    
    // Find block in cache
    const blockIndex = this.findBlock(setIndex, tag);
    
    // Cache hit
    if (blockIndex >= 0) {
      this.hitCount++;
      
      // Simulate cache access latency
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Update LRU information
      this.sets[setIndex].blocks[blockIndex].lastAccessed = performance.now();
      
      // Record access
      this.accessLog.push({
        address,
        type: MemoryAccessType.READ,
        memoryType: this.memoryType,
        coreId,
        cycle: performance.now(),
        isHit: true
      });
      
      return this.sets[setIndex].blocks[blockIndex].data[blockOffset];
    }
    
    // Cache miss
    this.missCount++;
    
    // Record access
    this.accessLog.push({
      address,
      type: MemoryAccessType.READ,
      memoryType: this.memoryType,
      coreId,
      cycle: performance.now(),
      isHit: false
    });
    
    // Select victim block
    const victimIndex = this.selectVictim(setIndex);
    
    // Load block from next level memory
    await this.loadBlock(setIndex, victimIndex, blockAddress);
    
    // Simulate cache access latency (after load)
    await new Promise(resolve => setTimeout(resolve, 0));
    
    return this.sets[setIndex].blocks[victimIndex].data[blockOffset];
  }
  
  // Write data to cache and next level memory (write-through policy)
  public async write(address: number, value: number, coreId: number): Promise<void> {
    this.accessCount++;
    
    // Get address components
    const { blockOffset, setIndex, tag, blockAddress } = this.getAddressComponents(address);
    
    // Find block in cache
    const blockIndex = this.findBlock(setIndex, tag);
    
    // Cache hit
    if (blockIndex >= 0) {
      this.hitCount++;
      
      // Update block data
      this.sets[setIndex].blocks[blockIndex].data[blockOffset] = value;
      
      // Update LRU information
      this.sets[setIndex].blocks[blockIndex].lastAccessed = performance.now();
      
      // Record access
      this.accessLog.push({
        address,
        type: MemoryAccessType.WRITE,
        memoryType: this.memoryType,
        coreId,
        cycle: performance.now(),
        isHit: true
      });
    } else {
      // Cache miss
      this.missCount++;
      
      // Record access
      this.accessLog.push({
        address,
        type: MemoryAccessType.WRITE,
        memoryType: this.memoryType,
        coreId,
        cycle: performance.now(),
        isHit: false
      });
      
      // Select victim block
      const victimIndex = this.selectVictim(setIndex);
      
      // Load block from next level memory
      await this.loadBlock(setIndex, victimIndex, blockAddress);
      
      // Update block data
      this.sets[setIndex].blocks[victimIndex].data[blockOffset] = value;
    }
    
    // Write-through to next level memory
    await this.nextLevelMemory.write(address, value, coreId);
  }
  
  // Reset cache state
  public reset(): void {
    // Reset statistics
    this.accessCount = 0;
    this.hitCount = 0;
    this.missCount = 0;
    this.accessLog = [];
    
    // Reset cache blocks
    for (const set of this.sets) {
      for (const block of set.blocks) {
        block.valid = false;
        block.tag = 0;
        block.data.fill(0);
        block.lastAccessed = 0;
        block.loaded = 0;
      }
    }
  }
  
  // Get cache statistics
  public getStats(): { hits: number; misses: number; accesses: number; hitRate: number } {
    return {
      hits: this.hitCount,
      misses: this.missCount,
      accesses: this.accessCount,
      hitRate: this.accessCount > 0 ? this.hitCount / this.accessCount : 0
    };
  }
  
  // Get memory access log
  public getAccessStats(): MemoryAccess[] {
    return [...this.accessLog];
  }
  
  // Get cache name
  public getName(): string {
    return this.name;
  }
  
  // Get cache configuration
  public getConfig(): CacheConfig {
    return { ...this.config };
  }
}

// L1 Instruction Cache implementation
export class L1InstructionCache extends Cache {
  constructor(config: CacheConfig, nextLevelMemory: Memory) {
    super(config, nextLevelMemory, MemoryType.L1_INSTRUCTION_CACHE, "L1I");
  }
}

// L1 Data Cache implementation
export class L1DataCache extends Cache {
  constructor(config: CacheConfig, nextLevelMemory: Memory) {
    super(config, nextLevelMemory, MemoryType.L1_DATA_CACHE, "L1D");
  }
}

// L2 Unified Cache implementation
export class L2Cache extends Cache {
  constructor(config: CacheConfig, nextLevelMemory: Memory) {
    super(config, nextLevelMemory, MemoryType.L2_CACHE, "L2");
  }
}

