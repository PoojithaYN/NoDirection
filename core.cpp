#include "core.h"
#include <iostream>
#include <sstream>
#include "memory.h"

Core::Core(int id, Memory* shared_memory) : core_id(id), registers(32, 0), memory(shared_memory) {
    registers[0] = 0;  
    registers[31] = id; 

    instruction_set["ADD"] = 1;
    instruction_set["SUB"] = 2;
    instruction_set["BNE"] = 3;
    instruction_set["JAL"] = 4;
    instruction_set["LW"] = 5;
    instruction_set["SW"] = 6;
    instruction_set["AND"] = 7; // Additional instruction
}

void Core::executeInstruction(const std::string& instr) {
    std::istringstream iss(instr);
    std::string opcode;
    int rd, rs1, rs2, imm;

    iss >> opcode;

    if (instruction_set.find(opcode) == instruction_set.end()) {
        std::cerr << "Unknown instruction: " << opcode << std::endl;
        return;
    }

    if (opcode == "ADD") {
        iss >> rd >> rs1 >> rs2;
        registers[rd] = registers[rs1] + registers[rs2];
    }
    else if (opcode == "SUB") {
        iss >> rd >> rs1 >> rs2;
        registers[rd] = registers[rs1] - registers[rs2];
    }
    else if (opcode == "BNE") {
        iss >> rs1 >> rs2 >> imm;
        if (registers[rs1] != registers[rs2]) {
            std::cout << "BNE triggered, jumping to instruction " << imm << std::endl;
         if (imm < 0 || imm >= static_cast<int>(instruction_memory.size())) {
                std::cerr << "Invalid jump target: " << imm << std::endl;
                return;
            }   
         pc = imm;
         return;  
        }
    }
    else if (opcode == "JAL") {
        iss >> rd >> imm;
        registers[rd] = pc + 4; 
        if (imm < 0 || imm >= static_cast<int>(instruction_memory.size())) {
            std::cerr << "Invalid JAL jump target: " << imm << std::endl;
            return;
        } 
        pc = imm;  
        std::cout << "JAL executed, jumping to " << imm << std::endl;
    }
    else if (opcode == "LW") {
        iss >> rd >> rs1 >> imm;
        registers[rd] = memory->loadWord(registers[rs1] + imm);
    }
    else if (opcode == "SW") {
        iss >> rd >> rs1 >> imm;
        memory->storeWord(registers[rs1] + imm, registers[rd]);
    }
    else if (opcode == "AND") {
        iss >> rd >> rs1 >> rs2;
        registers[rd] = registers[rs1] & registers[rs2];
    }

   
    if (opcode != "JAL" && opcode != "BNE") {
        pc += 1;
    }
    if (pc >= static_cast<int>(instruction_memory.size())) {
        std::cerr << "Program finished execution.\n";
        return;
    }
}


void Core::printRegisters() const {
    std::cout << "Core " << core_id << " Registers:\n";
    for (size_t i = 0; i < registers.size(); ++i) {
        std::cout << "x" << i << ": " << registers[i] << "\n";
    }
}

