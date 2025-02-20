#ifndef SIMULATOR_H
#define SIMULATOR_H

#include <vector>
#include <string>
#include "memory.h"
#include "core.h"

class Simulator {
public:
    Simulator();
    void loadProgram(const std::string& filename);
    void run();
    
private:
    Memory memory;
    std::vector<Core> cores;
};

#endif // SIMULATOR_H

