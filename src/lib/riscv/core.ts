import { Instruction, InstructionStatus, Operation } from './instruction';
import { Memory } from './memory';
import { L1DataCache, L1InstructionCache } from './cache';
import { ScratchpadMemory } from './memory';
import { Pipeline, PipelineStage, StallReason } from './pipeline';

// Represents the register file of a RISC-V core
export class RegisterFile {
  private registers: Int32Array = new Int32Array(32);
  private coreId: number;
  
  constructor(coreId: number) {
    this.coreId = coreId;
    this.reset();
  }
  
  // Get all register values
  public getRegisters(): Int32Array {
    return this.registers;
  }
  
  // Read a register value
  public read(register: number): number {
    if (register < 0 || register >= 32) {
      throw new Error(`Invalid register index: ${register}`);
    }
    
    // x0 is always 0
    if (register === 0) {
      return 0;
    }
    
    return this.registers[register];
  }
  
  // Write a value to a register
  public write(register: number, value: number): void {
    if (register < 0 || register >= 32) {
      throw new Error(`Invalid register index: ${register}`);
    }
    
    // x0 is read-only
    if (register === 0) {
      return;
    }
    
    this.registers[register] = value;
  }
  
  // Get all register values
  public getAll(): Int32Array {
    return new Int32Array(this.registers);
  }
  
  // Reset all registers to 0
  public reset(): void {
    this.registers.fill(0);
    
    // Set core ID in special register (we'll use x31)
    this.registers[31] = this.coreId;
  }
  
  // Get core ID
  public getCoreId(): number {
    return this.coreId;
  }
}

// Represents a RISC-V core
export class Core {
  // Core identification
  private coreId: number;
  private name: string;
  
  // Core components
  private registers: RegisterFile;
  private pipeline: Pipeline;
  private instructionCache: L1InstructionCache;
  private dataCache: L1DataCache;
  private scratchpad: ScratchpadMemory;
  
  // Program counter
  private pc: number = 0;
  
  // Instruction execution options
  private instructionLatencies: Map<Operation, number> = new Map();
  
  // Sync instruction handling
  private reachedSync: boolean = false;
  private allCoresReachedSync: boolean = false;
  
  // Statistics
  private cycleCount: number = 0;
  private instructionCount: number = 0;
  private stallCount: number = 0;
  
  constructor(
    coreId: number,
    instructionCache: L1InstructionCache,
    dataCache: L1DataCache,
    scratchpad: ScratchpadMemory,
    forwarding: boolean = true
  ) {
    this.coreId = coreId;
    this.name = `Core ${coreId}`;
    this.registers = new RegisterFile(coreId);
    this.pipeline = new Pipeline(forwarding);
    this.instructionCache = instructionCache;
    this.dataCache = dataCache;
    this.scratchpad = scratchpad;
    
    // Set default latencies
    this.setDefaultLatencies();
  }
  
  // Set default instruction latencies
  private setDefaultLatencies(): void {
    this.instructionLatencies.set(Operation.ADD, 1);
    this.instructionLatencies.set(Operation.SUB, 1);
    this.instructionLatencies.set(Operation.ADDI, 1);
    this.instructionLatencies.set(Operation.LW, 1);
    this.instructionLatencies.set(Operation.SW, 1);
    this.instructionLatencies.set(Operation.BNE, 1);
    this.instructionLatencies.set(Operation.JAL, 1);
    this.instructionLatencies.set(Operation.LW_SPM, 1);
    this.instructionLatencies.set(Operation.SW_SPM, 1);
    this.instructionLatencies.set(Operation.SYNC, 1);
  }
  
  // Set instruction latencies
  public setInstructionLatencies(latencies: Map<Operation, number>): void {
    this.instructionLatencies = new Map(latencies);
  }
  
  // Reset core state
  public reset(): void {
    this.registers.reset();
    this.pipeline.reset();
    this.pc = 0;
    this.cycleCount = 0;
    this.instructionCount = 0;
    this.stallCount = 0;
    this.reachedSync = false;
    this.allCoresReachedSync = false;
  }
  
  // Initialize core with a memory segment size and offset
  public initialize(memorySegmentSize: number): void {
    this.pc = this.coreId * memorySegmentSize;
  }
  
  // Execute the fetch stage of the pipeline
  public async fetch(instructions: Instruction[]): Promise<Instruction | null> {
    // Check if core has reached a sync instruction and is waiting
    if (this.reachedSync && !this.allCoresReachedSync) {
      return null;
    }
    
    // Find instruction at current PC
    const instruction = instructions.find(instr => instr.address === this.pc);
    if (!instruction) {
      return null; // End of program or invalid PC
    }
    
    // Create a clone of the instruction for pipeline execution
    const fetchedInstruction = instruction.clone();
    fetchedInstruction.coreId = this.coreId;
    fetchedInstruction.status = InstructionStatus.FETCHED;
    fetchedInstruction.fetchCycle = this.cycleCount;
    
    // Simulate instruction cache access
    try {
      await this.instructionCache.read(this.pc, this.coreId);
    } catch (error) {
      console.error(`Core ${this.coreId} instruction fetch error:`, error);
      return null;
    }
    
    // Advance PC to next instruction
    this.pc += 4;
    
    return fetchedInstruction;
  }
  
  // Execute the decode stage of the pipeline
  public decode(instruction: Instruction): void {
    if (!instruction) return;
    
    instruction.status = InstructionStatus.DECODED;
    instruction.decodeCycle = this.cycleCount;
  }
  
  // Execute the execute stage of the pipeline
  public execute(instruction: Instruction): void {
    if (!instruction) return;
    
    let shouldBranch = false;
    let branchTarget = 0;
    
    // Access register values
    const rs1Value = this.registers.read(instruction.rs1);
    const rs2Value = this.registers.read(instruction.rs2);
    let result = 0;
    
    // Execute operation based on instruction type
    switch (instruction.operation) {
      case Operation.ADD:
        result = rs1Value + rs2Value;
        break;
        
      case Operation.SUB:
        result = rs1Value - rs2Value;
        break;
        
      case Operation.ADDI:
        result = rs1Value + instruction.immediate;
        break;
        
      case Operation.BNE:
        // For BNE cid, x, label instructions, check if cid matches core ID
        if (instruction.rs1 === 31) { // Assuming core ID is stored in x31
          const coreId = this.registers.getCoreId();
          if (coreId !== rs2Value) {
            shouldBranch = true;
            branchTarget = instruction.targetAddress;
          }
        } else {
          // Regular BNE rs1, rs2, label
          if (rs1Value !== rs2Value) {
            shouldBranch = true;
            branchTarget = instruction.targetAddress;
          }
        }
        break;
        
      case Operation.JAL:
        // Save return address
        result = instruction.address + 4;
        shouldBranch = true;
        branchTarget = instruction.targetAddress;
        break;
        
      case Operation.SYNC:
        this.reachedSync = true;
        break;
        
      // Memory operations don't compute results in execute stage
      case Operation.LW:
      case Operation.SW:
      case Operation.LW_SPM:
      case Operation.SW_SPM:
        result = rs1Value + instruction.immediate; // Calculate effective address
        break;
        
      default:
        console.warn(`Core ${this.coreId}: Unsupported operation ${instruction.operation}`);
    }
    
    // Store execution result for later stages
    (instruction as any).executionResult = result;
    (instruction as any).shouldBranch = shouldBranch;
    (instruction as any).branchTarget = branchTarget;
    
    instruction.status = InstructionStatus.EXECUTED;
    instruction.executeCycle = this.cycleCount;
  }
  
  // Execute the memory stage of the pipeline
  public async memory(instruction: Instruction): Promise<void> {
    if (!instruction) return;
    
    // Only handle memory operations
    if (instruction.operation === Operation.LW || instruction.operation === Operation.SW) {
      const effectiveAddress = (instruction as any).executionResult;
      
      try {
        if (instruction.operation === Operation.LW) {
          // Load word from memory
          const value = await this.dataCache.read(effectiveAddress, this.coreId);
          (instruction as any).memoryResult = value;
        } else {
          // Store word to memory
          const valueToStore = this.registers.read(instruction.rs2);
          await this.dataCache.write(effectiveAddress, valueToStore, this.coreId);
        }
      } catch (error) {
        console.error(`Core ${this.coreId} memory access error:`, error);
      }
    } 
    // Handle scratchpad memory operations
    else if (instruction.operation === Operation.LW_SPM || instruction.operation === Operation.SW_SPM) {
      const effectiveAddress = (instruction as any).executionResult;
      
      try {
        if (instruction.operation === Operation.LW_SPM) {
          // Load word from scratchpad memory
          const value = await this.scratchpad.read(effectiveAddress, this.coreId);
          (instruction as any).memoryResult = value;
        } else {
          // Store word to scratchpad memory
          const valueToStore = this.registers.read(instruction.rs2);
          await this.scratchpad.write(effectiveAddress, valueToStore, this.coreId);
        }
      } catch (error) {
        console.error(`Core ${this.coreId} scratchpad access error:`, error);
      }
    }
    
    instruction.status = InstructionStatus.MEMORY_ACCESSED;
    instruction.memoryCycle = this.cycleCount;
  }
  
  // Execute the writeback stage of the pipeline
  public writeback(instruction: Instruction): void {
    if (!instruction) return;
    
    // Only perform writeback for instructions that write to registers
    if (instruction.writesToRegister() && instruction.rd !== 0) {
      let valueToWrite = 0;
      
      if (instruction.operation === Operation.LW || instruction.operation === Operation.LW_SPM) {
        // For load operations, write memory value to register
        valueToWrite = (instruction as any).memoryResult;
      } else {
        // For other operations, write execution result to register
        valueToWrite = (instruction as any).executionResult;
      }
      
      this.registers.write(instruction.rd, valueToWrite);
    }
    
    // Handle branch and jump instructions
    if ((instruction as any).shouldBranch) {
      this.pc = (instruction as any).branchTarget;
      
      // Flush the pipeline
      this.pipeline.flush();
    }
    
    instruction.status = InstructionStatus.WRITTEN_BACK;
    instruction.writebackCycle = this.cycleCount;
    this.instructionCount++;
  }
  
  // Run one clock cycle
  public async runCycle(instructions: Instruction[], allCoresReachedSync: boolean = false): Promise<boolean> {
    this.cycleCount++;
    
    // Update SYNC status
    if (this.reachedSync && allCoresReachedSync) {
      this.allCoresReachedSync = true;
      this.reachedSync = false; // Reset to continue execution
    }
    
    // Get new instruction from fetch stage
    let newInstruction: Instruction | null = null;
    
    // Don't fetch if pipeline is stalled
    if (!this.pipeline.isStalled(PipelineStage.FETCH)) {
      newInstruction = await this.fetch(instructions);
    } else {
      this.stallCount++;
    }
    
    // Progress pipeline by one cycle
    const pipelineResult = await this.pipeline.advancePipeline(
      newInstruction,
      (instr) => this.decode(instr),
      (instr) => this.execute(instr),
      (instr) => this.memory(instr),
      (instr) => this.writeback(instr)
    );
    
    // Update stall count
    if (pipelineResult.stalled) {
      this.stallCount++;
    }
    
    // Return whether core has reached a SYNC instruction
    return this.reachedSync;
  }
  
  // Get core statistics
  public getStats() {
    return {
      coreId: this.coreId,
      cycles: this.cycleCount,
      instructions: this.instructionCount,
      stalls: this.stallCount,
      ipc: this.cycleCount > 0 ? this.instructionCount / this.cycleCount : 0,
      registers: Array.from(this.registers.getAll()),
      pipeline: this.pipeline.getState()
    };
  }
  
  // Get current PC
  public getPC(): number {
    return this.pc;
  }
  
  // Set PC
  public setPC(pc: number): void {
    this.pc = pc;
  }
  
  // Get core ID
  public getId(): number {
    return this.coreId;
  }
  
  // Get core name
  public getName(): string {
    return this.name;
  }
  
  // Check if core has reached a sync instruction
  public hasReachedSync(): boolean {
    return this.reachedSync;
  }
  
  // Set sync status
  public setAllCoresReachedSync(status: boolean): void {
    this.allCoresReachedSync = status;
  }
}

