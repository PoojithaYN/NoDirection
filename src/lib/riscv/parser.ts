import { Instruction, InstructionType, Operation } from './instruction';

export class Parser {
  private instructions: Instruction[] = [];
  private labels: Map<string, number> = new Map();
  private currentAddress: number = 0;
  
  constructor() {
    this.reset();
  }
  
  // Reset parser state
  public reset(): void {
    this.instructions = [];
    this.labels = new Map();
    this.currentAddress = 0;
  }
  
  // Parse assembly code
  public parse(code: string): Instruction[] {
    this.reset();
    
    // Split code into lines
    const lines = code.split('\n');
    
    // First pass: collect labels
    this.collectLabels(lines);
    
    // Second pass: parse instructions
    this.parseInstructions(lines);
    
    // Resolve label references
    this.resolveLabels();
    
    return this.instructions;
  }
  
  // First pass: collect labels and their addresses
  private collectLabels(lines: string[]): void {
    let address = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and comments
      if (line === '' || line.startsWith('#')) {
        continue;
      }
      
      // Check if line contains a label
      const labelMatch = line.match(/^([a-zA-Z0-9_]+)\s*:/);
      if (labelMatch) {
        const label = labelMatch[1];
        this.labels.set(label, address);
        
        // If line only contains a label, continue
        if (line.replace(labelMatch[0], '').trim() === '') {
          continue;
        }
      }
      
      // Each instruction is 4 bytes
      address += 4;
    }
  }
  
  // Second pass: parse instructions
  private parseInstructions(lines: string[]): void {
    this.currentAddress = 0;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Skip empty lines and comments
      if (line === '' || line.startsWith('#')) {
        continue;
      }
      
      // Remove label from line
      const labelMatch = line.match(/^([a-zA-Z0-9_]+)\s*:/);
      if (labelMatch) {
        line = line.replace(labelMatch[0], '').trim();
        if (line === '') {
          continue;
        }
      }
      
      // Remove comments
      const commentIndex = line.indexOf('#');
      if (commentIndex !== -1) {
        line = line.substring(0, commentIndex).trim();
      }
      
      // Parse instruction
      const instruction = this.parseInstruction(line, i + 1);
      if (instruction) {
        instruction.address = this.currentAddress;
        this.instructions.push(instruction);
        this.currentAddress += 4; // Each instruction is 4 bytes
      }
    }
  }
  
  // Parse a single instruction
  private parseInstruction(line: string, lineNumber: number): Instruction | null {
    const instruction = new Instruction(line, lineNumber);
    
    // Match the instruction format
    // Format: OPCODE rd, rs1, rs2  or  OPCODE rd, imm(rs1)  or  OPCODE rd, label
    const parts = line.split(/[\s,]+/).filter(part => part !== '');
    
    if (parts.length === 0) {
      return null;
    }
    
    const opcode = parts[0].toUpperCase();
    
    switch (opcode) {
      case 'ADD':
        this.parseRTypeInstruction(instruction, parts, Operation.ADD);
        break;
      case 'SUB':
        this.parseRTypeInstruction(instruction, parts, Operation.SUB);
        break;
      case 'ADDI':
        this.parseITypeInstruction(instruction, parts, Operation.ADDI);
        break;
      case 'LW':
        this.parseLoadInstruction(instruction, parts, Operation.LW);
        break;
      case 'SW':
        this.parseStoreInstruction(instruction, parts, Operation.SW);
        break;
      case 'BNE':
        this.parseBranchInstruction(instruction, parts, Operation.BNE);
        break;
      case 'JAL':
        this.parseJumpInstruction(instruction, parts, Operation.JAL);
        break;
      case 'JALR':
        // Handle JALR instruction (Jump and Link Register)
        if (parts.length >= 3) {
          instruction.type = InstructionType.J_TYPE;
          instruction.operation = Operation.JALR;
          instruction.rd = this.parseRegister(parts[1]);
          
          // Parse offset(rs1) format for JALR
          const addrMatch = parts[2].match(/(\d+)\(x(\d+)\)/);
          if (addrMatch) {
            instruction.immediate = parseInt(addrMatch[1]);
            instruction.rs1 = parseInt(addrMatch[2]);
          } else {
            instruction.immediate = 0;
            instruction.rs1 = this.parseRegister(parts[2]);
          }
          
          instruction.targetLabel = ""; // No label for JALR
        }
        break;
      case 'MUL':
        this.parseRTypeInstruction(instruction, parts, Operation.MUL); // Now we support MUL operation
        break;
      case 'LW_SPM':
        this.parseLoadInstruction(instruction, parts, Operation.LW_SPM);
        break;
      case 'SW_SPM':
        this.parseStoreInstruction(instruction, parts, Operation.SW_SPM);
        break;
      case 'SYNC':
        instruction.type = InstructionType.SPECIAL;
        instruction.operation = Operation.SYNC;
        break;
      default:
        console.warn(`Unknown opcode: ${opcode} at line ${lineNumber}`);
        return null;
    }
    
    return instruction;
  }
  
  // Parse R-type instruction (ADD, SUB)
  private parseRTypeInstruction(instruction: Instruction, parts: string[], operation: Operation): void {
    if (parts.length !== 4) {
      console.warn(`Invalid R-type instruction format: ${instruction.raw}`);
      return;
    }
    
    instruction.type = InstructionType.R_TYPE;
    instruction.operation = operation;
    instruction.rd = this.parseRegister(parts[1]);
    instruction.rs1 = this.parseRegister(parts[2]);
    instruction.rs2 = this.parseRegister(parts[3]);
  }
  
  // Parse I-type instruction (ADDI)
  private parseITypeInstruction(instruction: Instruction, parts: string[], operation: Operation): void {
    if (parts.length !== 4) {
      console.warn(`Invalid I-type instruction format: ${instruction.raw}`);
      return;
    }
    
    instruction.type = InstructionType.I_TYPE;
    instruction.operation = operation;
    instruction.rd = this.parseRegister(parts[1]);
    instruction.rs1 = this.parseRegister(parts[2]);
    instruction.immediate = parseInt(parts[3]);
  }
  
  // Parse load instruction (LW, LW_SPM)
  private parseLoadInstruction(instruction: Instruction, parts: string[], operation: Operation): void {
    if (parts.length !== 3) {
      console.warn(`Invalid load instruction format: ${instruction.raw}`);
      return;
    }
    
    instruction.type = InstructionType.I_TYPE;
    instruction.operation = operation;
    instruction.rd = this.parseRegister(parts[1]);
    
    // Parse offset(rs1) format
    const addrMatch = parts[2].match(/(-?\d+)\(x(\d+)\)/);
    if (addrMatch) {
      instruction.immediate = parseInt(addrMatch[1]);
      instruction.rs1 = parseInt(addrMatch[2]);
    } else {
      console.warn(`Invalid addressing mode: ${parts[2]}`);
    }
  }
  
  // Parse store instruction (SW, SW_SPM)
  private parseStoreInstruction(instruction: Instruction, parts: string[], operation: Operation): void {
    if (parts.length !== 3) {
      console.warn(`Invalid store instruction format: ${instruction.raw}`);
      return;
    }
    
    instruction.type = InstructionType.S_TYPE;
    instruction.operation = operation;
    instruction.rs2 = this.parseRegister(parts[1]); // Source register (value to store)
    
    // Parse offset(rs1) format
    const addrMatch = parts[2].match(/(-?\d+)\(x(\d+)\)/);
    if (addrMatch) {
      instruction.immediate = parseInt(addrMatch[1]);
      instruction.rs1 = parseInt(addrMatch[2]); // Base address register
    } else {
      console.warn(`Invalid addressing mode: ${parts[2]}`);
    }
  }
  
  // Parse branch instruction (BNE)
  private parseBranchInstruction(instruction: Instruction, parts: string[], operation: Operation): void {
    if (parts.length !== 4) {
      console.warn(`Invalid branch instruction format: ${instruction.raw}`);
      return;
    }
    
    instruction.type = InstructionType.B_TYPE;
    instruction.operation = operation;
    instruction.rs1 = this.parseRegister(parts[1]);
    instruction.rs2 = this.parseRegister(parts[2]);
    instruction.targetLabel = parts[3];
  }
  
  // Parse jump instruction (JAL)
  private parseJumpInstruction(instruction: Instruction, parts: string[], operation: Operation): void {
    if (parts.length !== 3) {
      console.warn(`Invalid jump instruction format: ${instruction.raw}`);
      return;
    }
    
    instruction.type = InstructionType.J_TYPE;
    instruction.operation = operation;
    instruction.rd = this.parseRegister(parts[1]);
    instruction.targetLabel = parts[2];
  }
  
  // Parse register (x0, x1, etc.)
  private parseRegister(reg: string): number {
    const match = reg.match(/x(\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
    console.warn(`Invalid register format: ${reg}`);
    return 0;
  }
  
  // Resolve label references
  private resolveLabels(): void {
    for (const instruction of this.instructions) {
      if (instruction.targetLabel) {
        const targetAddress = this.labels.get(instruction.targetLabel);
        if (targetAddress !== undefined) {
          instruction.targetAddress = targetAddress;
          
          // For branch instructions, calculate PC-relative offset
          if (instruction.type === InstructionType.B_TYPE) {
            instruction.immediate = targetAddress - instruction.address;
          }
        } else {
          console.warn(`Undefined label: ${instruction.targetLabel}`);
        }
      }
    }
  }
  
  // Get all labels
  public getLabels(): Map<string, number> {
    return new Map(this.labels);
  }
  
  // Get all instructions
  public getInstructions(): Instruction[] {
    return [...this.instructions];
  }
}

