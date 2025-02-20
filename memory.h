#ifndef MEMORY_H
#define MEMORY_H

#include <vector>
#include <cstdint>

class Memory {
public:
    std::vector<uint8_t> mem; 

    Memory(size_t size) : mem(size, 0) {}

    uint32_t loadWord(uint32_t address) {
    
        if (address + 3 < mem.size()) {
            return mem[address] | (mem[address + 1] << 8) |
                   (mem[address + 2] << 16) | (mem[address + 3] << 24);
        }
        return 0;
    }

    void storeWord(uint32_t address, uint32_t value) {
      
        if (address + 3 < mem.size()) {
            mem[address] = value & 0xFF;
            mem[address + 1] = (value >> 8) & 0xFF;
            mem[address + 2] = (value >> 16) & 0xFF;
            mem[address + 3] = (value >> 24) & 0xFF;
        }
    }
};

#endif 

