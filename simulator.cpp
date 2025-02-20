#include "simulator.h"
#include <iostream>
#include <fstream>
#include "core.h"
#include "memory.h"
#include <vector>


Simulator::Simulator() : memory(4096) {
    for (int i = 0; i < 4; ++i) {
        cores.emplace_back(i, &memory); // Pass shared memory to each core
    }
}

void Simulator::loadProgram(const std::string& filename) {
    std::ifstream file(filename);
    if (!file) {
        std::cerr << "Error opening file: " << filename << std::endl;
        return;
    }

    std::string line;
    while (getline(file, line)) {
        for (auto& core : cores) {
            core.executeInstruction(line);
        }
    }
}

void Simulator::run() {
    for (auto& core : cores) {
        core.printRegisters();
    }
}

