import { Instruction, Operation } from './instruction';
import { Parser } from './parser';

// Simple simulator status
export enum SimulatorStatus {
  READY = 'ready',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// Simple simulator config
export interface SimulatorConfig {
  instructionLatencies: Map<Operation, number>;
  memorySizeBytes: number;
  forwardingEnabled: boolean;
  [key: string]: any; // Allow additional properties
}

// Simple simulator result
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

// Simple pipeline state
export interface PipelineState {
  fetch: Instruction | null;
  decode: Instruction | null;
  execute: Instruction | null;
  memory: Instruction | null;
  writeback: Instruction | null;
}

// Simple core stats
export interface CoreStats {
  coreId: number;
  cycles: number;
  instructions: number;
  stalls: number;
  ipc: number;
  registers: number[];
  pipeline: PipelineState;
}

// Simple core class
export class Core {
  private coreId: number;
  private registers: number[] = new Array(32).fill(0);
  private pipeline: PipelineState = {
    fetch: null,
    decode: null,
    execute: null,
    memory: null,
    writeback: null
  };
  private cycleCount: number = 0;
  private instructionCount: number = 0;
  private stallCount: number = 0;
  
  constructor(id: number) {
    this.coreId = id;
    this.registers[31] = id; // Core ID in x31
  }
  
  // Get core statistics
  public getStats(): CoreStats {
    return {
      coreId: this.coreId,
      cycles: this.cycleCount,
      instructions: this.instructionCount,
      stalls: this.stallCount,
      ipc: this.cycleCount > 0 ? this.instructionCount / this.cycleCount : 0,
      registers: [...this.registers],
      pipeline: {
        fetch: this.pipeline.fetch,
        decode: this.pipeline.decode,
        execute: this.pipeline.execute,
        memory: this.pipeline.memory,
        writeback: this.pipeline.writeback
      }
    };
  }
  
  // Check if core has reached a SYNC instruction
  public hasReachedSync(): boolean {
    return false; // For simplicity, we'll always return false
  }
  
  // Initialize with memory segment size
  public initialize(memorySegmentSize: number): void {
    // Reset registers and other state
    this.reset();
  }
  
  // Reset core state
  public reset(): void {
    this.registers.fill(0);
    this.registers[31] = this.coreId;
    this.pipeline = {
      fetch: null,
      decode: null,
      execute: null,
      memory: null,
      writeback: null
    };
    this.cycleCount = 0;
    this.instructionCount = 0;
    this.stallCount = 0;
  }
  
  // Set instruction latencies
  public setInstructionLatencies(latencies: Map<Operation, number>): void {
    // Just a stub for now
  }
  
  // Run a single cycle
  public async runCycle(instructions: Instruction[], allCoresReachedSync: boolean): Promise<boolean> {
    this.cycleCount++;
    
    // For demo, just add an instruction to the pipeline
    if (instructions.length > 0 && this.instructionCount < instructions.length) {
      const instruction = instructions[this.instructionCount];
      
      // Shift pipeline
      this.pipeline.writeback = this.pipeline.memory;
      this.pipeline.memory = this.pipeline.execute;
      this.pipeline.execute = this.pipeline.decode;
      this.pipeline.decode = this.pipeline.fetch;
      this.pipeline.fetch = instruction;
      
      this.instructionCount++;
    } else {
      // Shift pipeline
      this.pipeline.writeback = this.pipeline.memory;
      this.pipeline.memory = this.pipeline.execute;
      this.pipeline.execute = this.pipeline.decode;
      this.pipeline.decode = this.pipeline.fetch;
      this.pipeline.fetch = null;
    }
    
    return false; // No SYNC reached
  }
}

// Simple simulator implementation
export class RISCVSimulator {
  private parser: Parser;
  private cores: Core[] = [];
  private instructions: Instruction[] = [];
  private status: SimulatorStatus = SimulatorStatus.READY;
  private cycleCount: number = 0;
  private config: SimulatorConfig;
  private error: Error | null = null;
  private memory: Uint32Array;
  
  constructor(config: SimulatorConfig) {
    this.config = config;
    this.parser = new Parser();
    this.memory = new Uint32Array(config.memorySizeBytes / 4); // 4 bytes per word
    
    // Create 4 cores
    for (let i = 0; i < 4; i++) {
      this.cores.push(new Core(i));
    }
  }
  
  // Load a program
  public loadProgram(code: string): void {
    try {
      // Reset simulator state
      this.reset();
      
      // Parse the program
      this.instructions = this.parser.parse(code);
      
      // Initialize cores
      const memorySegmentSize = this.config.memorySizeBytes / 4;
      for (let i = 0; i < this.cores.length; i++) {
        this.cores[i].initialize(memorySegmentSize);
      }
      
      // Set instruction latencies
      for (const core of this.cores) {
        core.setInstructionLatencies(this.config.instructionLatencies);
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
    this.instructions = [];
    this.memory.fill(0);
    
    // Reset cores
    for (const core of this.cores) {
      core.reset();
    }
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
      
      if (allCompleted && this.cycleCount > 10) { // Arbitrary minimum cycle count for demonstration
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
    
    // For demo, use fixed miss rates
    const l1iMissRate = 0.1;
    const l1dMissRate = 0.2;
    const l2MissRate = 0.05;
    
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
      memoryDump: this.memory
    };
  }
  
  // Get core statistics
  public getCoreStats(): CoreStats[] {
    return this.cores.map(core => core.getStats());
  }
  
  // Get current configuration
  public getConfig(): SimulatorConfig {
    return { ...this.config };
  }
  
  // Update configuration
  public updateConfig(config: Partial<SimulatorConfig>): void {
    this.config = { ...this.config, ...config };
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
