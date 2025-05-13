import { Core } from './core';
import { Parser } from './parser';
import { Instruction, Operation } from './instruction';
import { MainMemory, ScratchpadMemory } from './memory';
import { L1DataCache, L1InstructionCache, L2Cache, CacheConfig, CacheReplacementPolicy } from './cache';

// This was added in an edit but there's already a SimulatorStatus enum below

// Configuration for the simulator
export interface SimulatorConfig {
  // Memory configuration
  memorySizeBytes: number;
  mainMemoryLatency: number;
  
  // Cache configuration
  l1InstructionCacheConfig: CacheConfig;
  l1DataCacheConfig: CacheConfig;
  l2CacheConfig: CacheConfig;
  
  // Scratchpad configuration
  scratchpadSizeBytes: number;
  scratchpadLatency: number;
  
  // Pipeline configuration
  forwardingEnabled: boolean;
  
  // Instruction latencies (in cycles)
  instructionLatencies: Map<Operation, number>;
}

// Simulator status
export enum SimulatorStatus {
  READY,
  RUNNING,
  PAUSED,
  COMPLETED,
  ERROR
}

// Simulator result
export interface SimulatorResult {
  cycles: number;
  instructions: number;
  stalls: number;
  ipc: number;
  cacheMissRates: {
    l1i: number;
    l1d: number;
    l2: number;
  };
  registerStates: number[][];
  memoryDump: Uint32Array;
}

// RISC-V Simulator
export class RISCVSimulator {
  // Simulator components
  private parser: Parser;
  private cores: Core[] = [];
  private memory: MainMemory;
  private l2Cache: L2Cache;
  private l1ICaches: L1InstructionCache[] = [];
  private l1DCaches: L1DataCache[] = [];
  private scratchpad: ScratchpadMemory;
  
  // Parsed program
  private instructions: Instruction[] = [];
  
  // Simulator state
  private status: SimulatorStatus = SimulatorStatus.READY;
  private cycleCount: number = 0;
  private config: SimulatorConfig;
  
  // Error handling
  private error: Error | null = null;
  
  constructor(config: SimulatorConfig) {
    this.config = config;
    this.parser = new Parser();
    
    // Initialize memory hierarchy
    this.memory = new MainMemory(config.memorySizeBytes, config.mainMemoryLatency);
    this.l2Cache = new L2Cache(config.l2CacheConfig, this.memory);
    this.scratchpad = new ScratchpadMemory(config.scratchpadSizeBytes, config.scratchpadLatency);
    
    // Initialize cores and caches
    this.initializeCoresAndCaches();
  }
  
  // Initialize cores and their respective caches
  private initializeCoresAndCaches(): void {
    // Number of cores
    const numCores = 4;
    
    // Create L1 instruction and data caches for each core
    for (let i = 0; i < numCores; i++) {
      const l1ICache = new L1InstructionCache(this.config.l1InstructionCacheConfig, this.l2Cache);
      const l1DCache = new L1DataCache(this.config.l1DataCacheConfig, this.l2Cache);
      
      this.l1ICaches.push(l1ICache);
      this.l1DCaches.push(l1DCache);
      
      // Create core
      const core = new Core(i, l1ICache, l1DCache, this.scratchpad, this.config.forwardingEnabled);
      
      // Set instruction latencies
      core.setInstructionLatencies(this.config.instructionLatencies);
      
      this.cores.push(core);
    }
  }
  
  // Load a program into the simulator
  public loadProgram(code: string): void {
    try {
      // Reset simulator state
      this.reset();
      
      // Parse program
      this.instructions = this.parser.parse(code);
      
      // Initialize cores with memory segment size (each core gets 1/4 of memory)
      const memorySegmentSize = this.config.memorySizeBytes / 4;
      for (let i = 0; i < this.cores.length; i++) {
        this.cores[i].initialize(memorySegmentSize);
      }
      
      this.status = SimulatorStatus.READY;
    } catch (error) {
      this.error = error as Error;
      this.status = SimulatorStatus.ERROR;
      console.error('Error loading program:', error);
    }
  }
  
  // Reset simulator state
  public reset(): void {
    this.cycleCount = 0;
    this.status = SimulatorStatus.READY;
    this.error = null;
    
    // Reset memory hierarchy
    this.memory.reset();
    this.l2Cache.reset();
    this.scratchpad.reset();
    
    for (const cache of this.l1ICaches) {
      cache.reset();
    }
    
    for (const cache of this.l1DCaches) {
      cache.reset();
    }
    
    // Reset cores
    for (const core of this.cores) {
      core.reset();
    }
    
    // Clear parsed program
    this.instructions = [];
  }
  
  // Run a single cycle
  public async runCycle(): Promise<void> {
    if (this.status !== SimulatorStatus.RUNNING && this.status !== SimulatorStatus.READY) {
      return;
    }
    
    this.status = SimulatorStatus.RUNNING;
    this.cycleCount++;
    
    try {
      // Check if any cores are waiting at a SYNC instruction
      const syncReached = this.cores.map(core => core.hasReachedSync());
      const allCoresReachedSync = syncReached.every(reached => reached);
      
      // Run one cycle for each core
      const promises = this.cores.map(core => 
        core.runCycle(this.instructions, allCoresReachedSync)
      );
      
      await Promise.all(promises);
      
      // Check if all cores have completed execution
      const allCompleted = this.cores.every(core => {
        const stats = core.getStats();
        return stats.pipeline.fetch === null && 
               stats.pipeline.decode === null && 
               stats.pipeline.execute === null && 
               stats.pipeline.memory === null && 
               stats.pipeline.writeback === null;
      });
      
      if (allCompleted) {
        this.status = SimulatorStatus.COMPLETED;
      }
    } catch (error) {
      this.error = error as Error;
      this.status = SimulatorStatus.ERROR;
      console.error('Error running cycle:', error);
    }
  }
  
  // Run the simulation until completion
  public async run(maxCycles: number = 10000): Promise<void> {
    if (this.status !== SimulatorStatus.READY && this.status !== SimulatorStatus.PAUSED) {
      return;
    }
    
    this.status = SimulatorStatus.RUNNING;
    
    try {
      // Run until completion or max cycles reached
      while (this.status === SimulatorStatus.RUNNING && this.cycleCount < maxCycles) {
        await this.runCycle();
      }
      
      if (this.cycleCount >= maxCycles && this.status === SimulatorStatus.RUNNING) {
        this.status = SimulatorStatus.PAUSED;
      }
    } catch (error) {
      this.error = error as Error;
      this.status = SimulatorStatus.ERROR;
      console.error('Error running simulation:', error);
    }
  }
  
  // Pause the simulation
  public pause(): void {
    if (this.status === SimulatorStatus.RUNNING) {
      this.status = SimulatorStatus.PAUSED;
    }
  }
  
  // Resume the simulation
  public resume(): void {
    if (this.status === SimulatorStatus.PAUSED) {
      this.status = SimulatorStatus.RUNNING;
      this.run();
    }
  }
  
  // Get simulator status
  public getStatus(): SimulatorStatus {
    return this.status;
  }
  
  // Get error
  public getError(): Error | null {
    return this.error;
  }
  
  // Get cycle count
  public getCycleCount(): number {
    return this.cycleCount;
  }
  
  // Get simulation results
  public getResults(): SimulatorResult {
    // Calculate total instructions and stalls
    let totalInstructions = 0;
    let totalStalls = 0;
    const registerStates: number[][] = [];
    
    for (const core of this.cores) {
      const stats = core.getStats();
      totalInstructions += stats.instructions;
      totalStalls += stats.stalls;
      registerStates.push(stats.registers);
    }
    
    // Calculate cache miss rates
    const l1iStats = this.l1ICaches.map(cache => cache.getStats());
    const l1dStats = this.l1DCaches.map(cache => cache.getStats());
    const l2Stats = this.l2Cache.getStats();
    
    const l1iMissRate = l1iStats.reduce((sum, stats) => sum + stats.misses, 0) / 
                      Math.max(1, l1iStats.reduce((sum, stats) => sum + stats.accesses, 0));
    
    const l1dMissRate = l1dStats.reduce((sum, stats) => sum + stats.misses, 0) / 
                      Math.max(1, l1dStats.reduce((sum, stats) => sum + stats.accesses, 0));
    
    const l2MissRate = l2Stats.misses / Math.max(1, l2Stats.accesses);
    
    return {
      cycles: this.cycleCount,
      instructions: totalInstructions,
      stalls: totalStalls,
      ipc: totalInstructions / Math.max(1, this.cycleCount),
      cacheMissRates: {
        l1i: l1iMissRate,
        l1d: l1dMissRate,
        l2: l2MissRate
      },
      registerStates,
      memoryDump: this.memory.dump()
    };
  }
  
  // Get core statistics
  public getCoreStats(): any[] {
    return this.cores.map(core => core.getStats());
  }
  
  // Get current configuration
  public getConfig(): SimulatorConfig {
    return { ...this.config };
  }
  
  // Update configuration
  public updateConfig(config: Partial<SimulatorConfig>): void {
    // Update config
    this.config = { ...this.config, ...config };
    
    // Reinitialize simulator components
    this.reset();
    this.memory = new MainMemory(this.config.memorySizeBytes, this.config.mainMemoryLatency);
    this.l2Cache = new L2Cache(this.config.l2CacheConfig, this.memory);
    this.scratchpad = new ScratchpadMemory(this.config.scratchpadSizeBytes, this.config.scratchpadLatency);
    
    // Reinitialize cores and caches
    this.cores = [];
    this.l1ICaches = [];
    this.l1DCaches = [];
    this.initializeCoresAndCaches();
  }
  
  // Get the parsed instructions
  public getInstructions(): Instruction[] {
    return [...this.instructions];
  }
  
  // Get the cores
  public getCores(): Core[] {
    return this.cores;
  }
}

