#include "core.h"
#include "memory.h"
#include <iostream>
#include <fstream>
#include <vector>
#include <string>

void loadProgram(const std::string& filename, std::vector<std::string>& instructions) {
    std::ifstream file(filename);
    if (!file) {
        std::cerr << "Error: Cannot open file " << filename << std::endl;
        return;
    }
    std::string line;
    while (std::getline(file, line)) {
        if (!line.empty()) {
            instructions.push_back(line);
        }
    }
    file.close();
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <program.txt>" << std::endl;
        return 1;
    }
    
    const int NUM_CORES = 4;
    const size_t CORE_MEMORY_SIZE = 1024;  // 1KB per core
    const size_t SHARED_MEMORY_SIZE = 4096;  // 4KB shared memory

    Memory shared_memory(SHARED_MEMORY_SIZE);  
    std::vector<Memory> core_memories;

    for (int i = 0; i < NUM_CORES; ++i) {
        core_memories.emplace_back(CORE_MEMORY_SIZE);
    }

    std::vector<Core> cores;


    for (int i = 0; i < NUM_CORES; ++i) {
        cores.emplace_back(i, &shared_memory);
    }

    loadProgram(argv[1], cores[0].instruction_memory); 


    while (cores[0].pc < static_cast<int>(cores[0].instruction_memory.size())) {
        cores[0].executeInstruction(cores[0].instruction_memory[cores[0].pc]);
        cores[0].pc++;
    }


    for (const auto& core : cores) {
        core.printRegisters();
    }

    return 0;
}

