// Represents the memory hierarchy of the RISC-V simulator

// Memory access types
export enum MemoryAccessType {
  READ,
  WRITE
}

// Memory types
export enum MemoryType {
  MAIN_MEMORY,
  L1_INSTRUCTION_CACHE,
  L1_DATA_CACHE,
  L2_CACHE,
  SCRATCHPAD
}

// Represents a memory access event for statistics
export interface MemoryAccess {
  address: number;
  type: MemoryAccessType;
  memoryType: MemoryType;
  coreId: number;
  cycle: number;
  isHit: boolean;
}

// Base memory interface
export interface Memory {
  read(address: number, coreId: number): Promise<number>;
  write(address: number, value: number, coreId: number): Promise<void>;
  reset(): void;
  getAccessStats(): MemoryAccess[];
}

// Main memory implementation
export class MainMemory implements Memory {
  private memory: Uint32Array;
  private accessLog: MemoryAccess[] = [];
  private accessLatency: number;
  
  constructor(sizeInBytes: number, accessLatency: number = 100) {
    this.memory = new Uint32Array(sizeInBytes / 4); // Convert bytes to words
    this.accessLatency = accessLatency;
  }
  
  public async read(address: number, coreId: number): Promise<number> {
    // Ensure aligned access
    if (address % 4 !== 0) {
      throw new Error(`Unaligned memory access at address 0x${address.toString(16)}`);
    }
    
    // Check bounds
    const wordIndex = address / 4;
    if (wordIndex >= this.memory.length) {
      throw new Error(`Memory access out of bounds at address 0x${address.toString(16)}`);
    }
    
    // Simulate memory access latency
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Record the access
    this.accessLog.push({
      address,
      type: MemoryAccessType.READ,
      memoryType: MemoryType.MAIN_MEMORY,
      coreId,
      cycle: performance.now(),
      isHit: true
    });
    
    return this.memory[wordIndex];
  }
  
  public async write(address: number, value: number, coreId: number): Promise<void> {
    // Ensure aligned access
    if (address % 4 !== 0) {
      throw new Error(`Unaligned memory access at address 0x${address.toString(16)}`);
    }
    
    // Check bounds
    const wordIndex = address / 4;
    if (wordIndex >= this.memory.length) {
      throw new Error(`Memory access out of bounds at address 0x${address.toString(16)}`);
    }
    
    // Simulate memory access latency
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Record the access
    this.accessLog.push({
      address,
      type: MemoryAccessType.WRITE,
      memoryType: MemoryType.MAIN_MEMORY,
      coreId,
      cycle: performance.now(),
      isHit: true
    });
    
    this.memory[wordIndex] = value;
  }
  
  public reset(): void {
    this.memory.fill(0);
    this.accessLog = [];
  }
  
  public dump(): Uint32Array {
    return new Uint32Array(this.memory);
  }
  
  public getAccessStats(): MemoryAccess[] {
    return [...this.accessLog];
  }
  
  public getAccessLatency(): number {
    return this.accessLatency;
  }
  
  public setAccessLatency(latency: number): void {
    this.accessLatency = latency;
  }
}

// Scratchpad memory implementation
export class ScratchpadMemory implements Memory {
  private memory: Uint32Array;
  private accessLog: MemoryAccess[] = [];
  private accessLatency: number;
  
  constructor(sizeInBytes: number, accessLatency: number = 1) {
    this.memory = new Uint32Array(sizeInBytes / 4); // Convert bytes to words
    this.accessLatency = accessLatency;
  }
  
  public async read(address: number, coreId: number): Promise<number> {
    // Ensure aligned access
    if (address % 4 !== 0) {
      throw new Error(`Unaligned scratchpad access at address 0x${address.toString(16)}`);
    }
    
    // Check bounds
    const wordIndex = address / 4;
    if (wordIndex >= this.memory.length) {
      throw new Error(`Scratchpad access out of bounds at address 0x${address.toString(16)}`);
    }
    
    // Record the access
    this.accessLog.push({
      address,
      type: MemoryAccessType.READ,
      memoryType: MemoryType.SCRATCHPAD,
      coreId,
      cycle: performance.now(),
      isHit: true
    });
    
    return this.memory[wordIndex];
  }
  
  public async write(address: number, value: number, coreId: number): Promise<void> {
    // Ensure aligned access
    if (address % 4 !== 0) {
      throw new Error(`Unaligned scratchpad access at address 0x${address.toString(16)}`);
    }
    
    // Check bounds
    const wordIndex = address / 4;
    if (wordIndex >= this.memory.length) {
      throw new Error(`Scratchpad access out of bounds at address 0x${address.toString(16)}`);
    }
    
    // Record the access
    this.accessLog.push({
      address,
      type: MemoryAccessType.WRITE,
      memoryType: MemoryType.SCRATCHPAD,
      coreId,
      cycle: performance.now(),
      isHit: true
    });
    
    this.memory[wordIndex] = value;
  }
  
  public reset(): void {
    this.memory.fill(0);
    this.accessLog = [];
  }
  
  public dump(): Uint32Array {
    return new Uint32Array(this.memory);
  }
  
  public getAccessStats(): MemoryAccess[] {
    return [...this.accessLog];
  }
  
  public getAccessLatency(): number {
    return this.accessLatency;
  }
  
  public setAccessLatency(latency: number): void {
    this.accessLatency = latency;
  }
}

