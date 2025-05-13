# NoDirection
COA Project - Multi-core RISC-V Simulator

## Meeting Notes

### Date: 12-05-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Finalized pipelining and data forwarding features.
- Implemented user-defined latencies for arithmetic instructions (e.g., ADD = 1, MUL = 3).
- Merged compute units and shared instruction/data memory. Each compute unit can now execute independently with a shared fetch unit.

**Tasks:**
- Poojitha: Finalize test cases for array addition and multi-core execution with forwarding.
- Ananyaa: Complete documentation for Phase 2 features and write additional test cases.

---

### Date: 10-05-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Successfully implemented the ability to enable/disable forwarding for all instructions, and validated with various test cases.
- Addressed and fixed pipeline stall issues, leading to improved IPC (instructions per cycle) in the simulation.
- Completed the merging of the four compute units. Each unit now fetches instructions from a shared memory, but executes based on its unique CID (compute unit identifier).

**Challenges:**
- Debugging branch misprediction when multiple cores tried to execute conditional branches. Handled using branch prediction strategies and stalls when necessary.
  
**Tasks:**
- Poojitha: Test performance of multi-core execution with forwarding on/off. Focus on IPC and stalls.
- Ananyaa: Write documentation for pipelining and the latencies interface.

---

### Date: 08-05-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Finalized array addition test case. Now, each compute unit computes parts of an array and core 1 aggregates the sum at the end.
- Shared instruction and data memory architecture is now fully integrated, and all cores work independently for non-shared instructions.
**Tasks:**
- Poojitha: Validate multi-core execution with array addition, focusing on the correct partitioning of work across cores.
- Ananyaa: Test and document the array addition implementation, particularly how compute units interact with shared data memory.

---

---

### Date: 23-04-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Implemented basic instruction pipeline for one compute unit.
- Created unit tests for basic RISC-V instructions (ADD, SUB, BNE, JAL, LW).

**Tasks:**
- Poojitha: Refine pipeline implementation, introduce forwarding for data hazards.
- Ananyaa: Begin working on the interface to switch between latencies for arithmetic instructions.

---



### Date: 15-04-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Merged pipeline stages (fetch, decode, execute, memory, writeback) for single-core operation.
- Discussed strategies for adding multi-core support in later phases.

**Tasks:**
- Poojitha: Implement multi-core execution logic and prepare initial test cases.
- Ananyaa: Test single-core execution and work on UI design.

---

### Date: 10-04-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Identified issues with memory access in multi-core execution.
- Planned to restructure the memory system for multi-core shared access.

**Tasks:**
- Poojitha: Research multi-core memory access and begin working on memory architecture.
- Ananyaa: Start creating the UI for displaying core states and memory access.

---

### Date: 30-03-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Discussed implementing shared instruction memory and individual data memory for each core.
- Planned the approach for merging compute units to share the fetch unit.

**Tasks:**
- Poojitha: Begin implementing shared instruction memory and memory hierarchies for multi-core.
- Ananyaa: Work on UI components for instruction visualization and setup.

---

### Date: 23-03-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Set up the initial framework for implementing pipelining and forwarding.
- Defined the interface to allow variable latencies for arithmetic instructions.

**Tasks:**
- Poojitha: Work on pipelining and forwarding logic.
- Ananyaa: Begin drafting documentation and feature details for Phase 2.

---

### Date: 18-03-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Finalized Phase 1 implementation, committed and tagged it as phase1 on GitHub.
- Confirmed that all basic instructions (ADD, SUB, BNE, JAL) work as expected.

**Tasks:**
- Poojitha: Prepare for Phase 2 by researching pipelining and data forwarding.
- Ananyaa: Review Phase 1 progress and start with initial testing for Phase 2.

---

### Date: 20-02-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Finalized implementation of memory allocation (1KB per core, 4KB shared).
- Debugged incorrect JAL instruction execution.

**Tasks:**
- Poojitha: Fix multi-core execution logic and memory allocation issues.
- Ananyaa: Update README and document architecture.

---

### Date: 18-02-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Fixed segmentation fault when accessing invalid memory.
- Implemented basic instruction set (ADD, SUB, BNE, JAL, LW, SW, AND).

**Tasks:**
- Poojitha: Fix branch misprediction handling, ensure BNE jumps correctly.
- Ananyaa: Test JAL and BNE instructions, check register updates after jumps.

---

### Date: 15-02-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Decided to use `unordered_map` for instruction set storage to simplify and optimize code.

**Tasks:**
- Poojitha: Implement multi-core execution with proper memory access and set up the Git repository.
- Ananyaa: Research Qt UI for instruction display.

---

### Date: 10-02-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Finalized roles and responsibilities for the project.
- Decided to use C++ and Qt for UI (if time permits).

**Tasks:**
- Get familiar with the RISC-V instruction set.
- Research existing RISC-V simulators for reference.
- Implement ADD and SUB as initial test instructions.

---

### Date: 05-02-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Brainstormed on splitting the compute unit logic and introducing individual pipelines for each unit.
- Settled on a shared fetch unit and distinct pipelines for decode, execute, memory, and write-back.

**Tasks:**
- Poojitha: Start researching multi-core systems and finalize simulator architecture.
- Ananyaa: Review basic instruction set and implement initial tests for ADD and SUB.

---

### Date: 02-02-2025
**Members**: Poojitha (CS23B043), Ananyaa (CS23B005)

**Decisions:**
- Decided to implement a basic single-core version first with basic RISC-V instructions (ADD, SUB, etc.) to test the core functionality.

**Tasks:**
- Poojitha: Start with the basic RISC-V instruction implementation and basic testing framework.
- Ananyaa: Research multi-core systems and how to extend the simulator to support them later.


