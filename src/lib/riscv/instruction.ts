// Represents RISC-V instruction types
export enum InstructionType {
  R_TYPE, // Register-Register operations (ADD, SUB, etc.)
  I_TYPE, // Immediate operations (ADDI, LW, etc.)
  S_TYPE, // Store operations (SW)
  B_TYPE, // Branch operations (BNE)
  J_TYPE, // Jump operations (JAL)
  SPECIAL, // Special instructions (SYNC, etc.)
}

// Supported RISC-V operations
export enum Operation {
  // R-Type
  ADD,
  SUB,
  MUL, // Added MUL operation
  
  // I-Type (immediate)
  ADDI,
  LW,
  LW_SPM, // Special load from scratchpad memory
  
  // S-Type (store)
  SW,
  SW_SPM, // Special store to scratchpad memory
  
  // B-Type (branch)
  BNE,
  
  // J-Type (jump)
  JAL,
  JALR, // Added JALR operation
  
  // Special instructions
  SYNC, // Synchronize cores
  
  // Invalid operation
  INVALID,
}

// Status of an instruction in the pipeline
export enum InstructionStatus {
  FETCHED,
  DECODED,
  EXECUTED,
  MEMORY_ACCESSED,
  WRITTEN_BACK,
  COMPLETED,
  FLUSHED, // For branch mispredictions
  STALLED, // When instruction is stalled due to hazards
}

// Represents a decoded RISC-V instruction
export class Instruction {
  // Original instruction representation
  public raw: string = "";
  public lineNumber: number = 0;
  public address: number = 0;
  
  // Decoded fields
  public type: InstructionType = InstructionType.R_TYPE;
  public operation: Operation = Operation.INVALID;
  
  // Register operands
  public rd: number = 0; // Destination register
  public rs1: number = 0; // Source register 1
  public rs2: number = 0; // Source register 2
  
  // Immediate value for I-type, S-type, B-type
  public immediate: number = 0;
  
  // For branch/jump instructions
  public targetLabel: string = "";
  public targetAddress: number = 0;
  
  // For tracking instruction through pipeline
  public status: InstructionStatus = InstructionStatus.FETCHED;
  public coreId: number = 0; // The core executing this instruction
  
  // Pipeline timing information
  public fetchCycle: number = 0;
  public decodeCycle: number = 0;
  public executeCycle: number = 0;
  public memoryCycle: number = 0;
  public writebackCycle: number = 0;
  public completionCycle: number = 0;
  
  constructor(raw: string = "", lineNumber: number = 0) {
    this.raw = raw;
    this.lineNumber = lineNumber;
  }
  
  // Clone the instruction for pipeline simulation
  public clone(): Instruction {
    const copy = new Instruction(this.raw, this.lineNumber);
    copy.type = this.type;
    copy.operation = this.operation;
    copy.rd = this.rd;
    copy.rs1 = this.rs1;
    copy.rs2 = this.rs2;
    copy.immediate = this.immediate;
    copy.targetLabel = this.targetLabel;
    copy.targetAddress = this.targetAddress;
    copy.address = this.address;
    copy.coreId = this.coreId;
    return copy;
  }
  
  // Check if this instruction writes to a register
  public writesToRegister(): boolean {
    return this.operation !== Operation.SW && 
           this.operation !== Operation.SW_SPM &&
           this.operation !== Operation.BNE &&
           this.operation !== Operation.SYNC;
  }
  
  // Check if this is a memory access instruction
  public isMemoryAccess(): boolean {
    return this.operation === Operation.LW || 
           this.operation === Operation.SW ||
           this.operation === Operation.LW_SPM || 
           this.operation === Operation.SW_SPM;
  }
  
  // Check if this is a branch instruction
  public isBranch(): boolean {
    return this.operation === Operation.BNE;
  }
  
  // Check if this is a jump instruction
  public isJump(): boolean {
    return this.operation === Operation.JAL;
  }
  
  // Check if this instruction is affected by a data hazard
  public hasDataDependencyOn(other: Instruction): boolean {
    // This instruction needs to read from registers that the other instruction writes to
    if (other.writesToRegister() && other.rd !== 0) {
      if (this.rs1 === other.rd) return true;
      if (this.rs2 === other.rd && 
          this.type !== InstructionType.I_TYPE && 
          this.type !== InstructionType.J_TYPE) return true;
    }
    return false;
  }
  
  // Get user-friendly representation of instruction
  public toString(): string {
    switch (this.operation) {
      case Operation.ADD:
        return `ADD x${this.rd}, x${this.rs1}, x${this.rs2}`;
      case Operation.SUB:
        return `SUB x${this.rd}, x${this.rs1}, x${this.rs2}`;
      case Operation.ADDI:
        return `ADDI x${this.rd}, x${this.rs1}, ${this.immediate}`;
      case Operation.LW:
        return `LW x${this.rd}, ${this.immediate}(x${this.rs1})`;
      case Operation.SW:
        return `SW x${this.rs2}, ${this.immediate}(x${this.rs1})`;
      case Operation.BNE:
        return `BNE x${this.rs1}, x${this.rs2}, ${this.targetLabel}`;
      case Operation.JAL:
        return `JAL x${this.rd}, ${this.targetLabel}`;
      case Operation.LW_SPM:
        return `LW_SPM x${this.rd}, ${this.immediate}(x${this.rs1})`;
      case Operation.SW_SPM:
        return `SW_SPM x${this.rs2}, ${this.immediate}(x${this.rs1})`;
      case Operation.SYNC:
        return `SYNC`;
      default:
        return "INVALID";
    }
  }
}

