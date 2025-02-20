#ifndef CORE_H
#define CORE_H

#include "memory.h"
#include <vector>
#include <string>
#include <unordered_map>

class Core {
public:
    int core_id;
    int pc = 0;
   
    std::vector<int> registers; // 32 general-purpose registers
   
    Memory* memory; // Pointer to shared memory
    std::vector<std::string> instruction_memory;
    std::unordered_map<std::string, int> instruction_set;
    Core(int id, Memory* shared_memory);
    void executeInstruction(const std::string& instr);
    void printRegisters() const;
};

#endif

