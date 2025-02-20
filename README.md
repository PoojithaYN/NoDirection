# NoDirection
COA project - Multi-core RISC-V simulator
## Meeting notes

### Date: 20-02-2025
**Members** Poojitha(CS23B043), Ananyaa(CS23B005)
**Decisions:**
- Finalized implementation of memory allocation (1KB per core, 4KB shared)
-Debugged incorrect JAL instruction execution
 
**Tasks**
- Poojitha: Fix multi core execution logic
- Ananyaa: Update Readme


### Date: 18-02-2025
**Members** Poojitha(CS23B043), Ananyaa(CS23B005)
**Decisions:**
- Fixed segmentation fault when accessing invalid memory
-implemented basic instruction set (ADD, SUB, BNE, JAL, LW, SW, AND)
 
**Tasks**
- Poojitha: Fix branch misprediction handling, ensure BNE jumps correctly and Optimize memory access for multi-core execution, improve efficiency
- Ananyaa: Test JAL and BNE instructions, check register updates after jumps.


### Date: 15-02-2025
**Members** Poojitha(CS23B043), Ananyaa(CS23B005)
**Decisions:**
- Decided to use unordered_map for instruction set storage.
 
**Tasks**
- Poojitha: Implement multi-core execution with proper memory access.Set up Git repository and README structure.
- Ananyaa: Research Qt UI for instruction display.


### Date: 18-02-2025
**Members** Poojitha(CS23B043), Ananyaa(CS23B005)
**Decisions:**
- Fixed segmentation fault when accessing invalid memory
-implemented basic instruction set (ADD, SUB, BNE, JAL, LW, SW, AND)
 
**Tasks**
- Poojitha: Fix branch misprediction handling, ensure BNE jumps correctly and O
ptimize memory access for multi-core execution, improve efficiency
- Ananyaa: Test JAL and BNE instructions, check register updates after jumps.


### Date: 10-02-2025
**Members** Poojitha(CS23B043), Ananyaa(CS23B005)
**Decisions:**
- finalized our roles in the project.
-Decided to use C++ and qt for UI(if time permits)

**Tasks:**
-Get familiar with RISC-V instruction set
- Research existing RISC-V simulators for reference.
- Implement ADD and SUB as test instructions.

