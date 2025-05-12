import { Instruction, InstructionStatus } from './instruction';

// Pipeline stages
export enum PipelineStage {
  FETCH = 'FETCH',
  DECODE = 'DECODE',
  EXECUTE = 'EXECUTE',
  MEMORY = 'MEMORY',
  WRITEBACK = 'WRITEBACK'
}

// Stall reasons
export enum StallReason {
  NONE = 'NONE',
  DATA_HAZARD = 'DATA_HAZARD',
  CONTROL_HAZARD = 'CONTROL_HAZARD',
  STRUCTURAL_HAZARD = 'STRUCTURAL_HAZARD',
  MEMORY_STALL = 'MEMORY_STALL'
}

// Stage result
interface StageResult {
  instruction: Instruction | null;
  stalled: boolean;
  stallReason: StallReason;
}

// Pipeline state
interface PipelineState {
  fetch: Instruction | null;
  decode: Instruction | null;
  execute: Instruction | null;
  memory: Instruction | null;
  writeback: Instruction | null;
  completed: Instruction[];
}

// Pipeline implementation
export class Pipeline {
  // Pipeline stages
  private fetch: Instruction | null = null;
  private decode: Instruction | null = null;
  private execute: Instruction | null = null;
  private memory: Instruction | null = null;
  private writeback: Instruction | null = null;
  
  // Completed instructions
  private completed: Instruction[] = [];
  
  // Pipeline configuration
  private forwardingEnabled: boolean;
  
  // Pipeline state
  private stallReason: Map<PipelineStage, StallReason> = new Map();
  
  constructor(forwardingEnabled: boolean = true) {
    this.forwardingEnabled = forwardingEnabled;
    this.reset();
  }
  
  // Reset pipeline state
  public reset(): void {
    this.fetch = null;
    this.decode = null;
    this.execute = null;
    this.memory = null;
    this.writeback = null;
    this.completed = [];
    
    for (const stage of Object.values(PipelineStage)) {
      this.stallReason.set(stage, StallReason.NONE);
    }
  }
  
  // Check if a specific stage is stalled
  public isStalled(stage: PipelineStage): boolean {
    return this.stallReason.get(stage) !== StallReason.NONE;
  }
  
  // Get the reason for a stall in a specific stage
  public getStallReason(stage: PipelineStage): StallReason {
    return this.stallReason.get(stage) || StallReason.NONE;
  }
  
  // Set stall reason for a stage
  private setStallReason(stage: PipelineStage, reason: StallReason): void {
    this.stallReason.set(stage, reason);
  }
  
  // Clear stall reason for a stage
  private clearStallReason(stage: PipelineStage): void {
    this.stallReason.set(stage, StallReason.NONE);
  }
  
  // Clear all stall reasons
  private clearAllStallReasons(): void {
    for (const stage of Object.values(PipelineStage)) {
      this.clearStallReason(stage);
    }
  }
  
  // Check for data hazards
  private checkDataHazards(): boolean {
    // No data hazards if not enough instructions in pipeline
    if (!this.decode || !this.execute || !this.memory || !this.writeback) {
      return false;
    }
    
    // Check if decode depends on execute
    if (this.decode.hasDataDependencyOn(this.execute)) {
      // If forwarding is disabled, stall
      if (!this.forwardingEnabled) {
        this.setStallReason(PipelineStage.DECODE, StallReason.DATA_HAZARD);
        return true;
      }
      
      // For load instructions, must stall even with forwarding (load-use hazard)
      if (this.execute.operation === 'LW' || this.execute.operation === 'LW_SPM') {
        this.setStallReason(PipelineStage.DECODE, StallReason.DATA_HAZARD);
        return true;
      }
    }
    
    // Check if decode depends on memory
    if (this.decode.hasDataDependencyOn(this.memory)) {
      // If forwarding is disabled, stall
      if (!this.forwardingEnabled) {
        this.setStallReason(PipelineStage.DECODE, StallReason.DATA_HAZARD);
        return true;
      }
    }
    
    // Check if decode depends on writeback (only matters if forwarding is disabled)
    if (!this.forwardingEnabled && this.decode.hasDataDependencyOn(this.writeback)) {
      this.setStallReason(PipelineStage.DECODE, StallReason.DATA_HAZARD);
      return true;
    }
    
    // No data hazards detected
    return false;
  }
  
  // Advance the pipeline by one cycle
  public async advancePipeline(
    newInstruction: Instruction | null,
    decodeFn: (instruction: Instruction) => void,
    executeFn: (instruction: Instruction) => void,
    memoryFn: (instruction: Instruction) => Promise<void>,
    writebackFn: (instruction: Instruction) => void
  ): Promise<StageResult> {
    let result: StageResult = {
      instruction: null,
      stalled: false,
      stallReason: StallReason.NONE
    };
    
    // Move instruction from writeback to completed
    if (this.writeback) {
      this.completed.push(this.writeback);
      this.writeback = null;
    }
    
    // Advance stages from back to front
    this.writeback = this.memory;
    this.memory = this.execute;
    this.execute = this.decode;
    this.decode = this.fetch;
    this.fetch = newInstruction;
    
    // Perform stage operations
    if (this.writeback) {
      writebackFn(this.writeback);
    }
    
    if (this.memory) {
      await memoryFn(this.memory);
    }
    
    if (this.execute) {
      executeFn(this.execute);
    }
    
    // Check for data hazards before decode
    let hazardDetected = false;
    if (this.decode) {
      hazardDetected = this.checkDataHazards();
      
      if (!hazardDetected) {
        decodeFn(this.decode);
        this.clearStallReason(PipelineStage.DECODE);
      } else {
        // Stall the pipeline
        result.stalled = true;
        result.stallReason = StallReason.DATA_HAZARD;
      }
    }
    
    return result;
  }
  
  // Flush the pipeline (used after branch mispredictions)
  public flush(): void {
    // Mark instructions in pipeline as flushed
    if (this.fetch) this.fetch.status = InstructionStatus.FLUSHED;
    if (this.decode) this.decode.status = InstructionStatus.FLUSHED;
    if (this.execute) this.execute.status = InstructionStatus.FLUSHED;
    
    // Clear pipeline
    this.fetch = null;
    this.decode = null;
    this.execute = null;
    
    // Clear stall reasons
    this.clearAllStallReasons();
  }
  
  // Get current pipeline state
  public getState(): PipelineState {
    return {
      fetch: this.fetch,
      decode: this.decode,
      execute: this.execute,
      memory: this.memory,
      writeback: this.writeback,
      completed: [...this.completed]
    };
  }
  
  // Get completed instructions
  public getCompleted(): Instruction[] {
    return [...this.completed];
  }
  
  // Enable or disable forwarding
  public setForwarding(enabled: boolean): void {
    this.forwardingEnabled = enabled;
  }
  
  // Is forwarding enabled
  public isForwardingEnabled(): boolean {
    return this.forwardingEnabled;
  }
}

