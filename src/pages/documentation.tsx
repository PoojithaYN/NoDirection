import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "lucide-react";

export default function Documentation() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">RISC-V Simulator Documentation</h1>
      
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="memory">Memory Hierarchy</TabsTrigger>
          <TabsTrigger value="pipeline">Pipelining</TabsTrigger>
          <TabsTrigger value="examples">Example Programs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RISC-V Multi-Core Simulator</CardTitle>
              <CardDescription>A comprehensive simulator for RISC-V architecture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This simulator is designed to help understand and visualize the operation of a RISC-V processor
                with multiple cores, pipelining, and a complete memory hierarchy.
              </p>
              <h3 className="text-lg font-semibold">Key Features:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Four compute cores with shared memory access</li>
                <li>5-stage pipeline with data forwarding and hazard detection</li>
                <li>Configurable instruction latencies</li>
                <li>Complete memory hierarchy with L1I, L1D, and L2 caches</li>
                <li>Scratchpad memory with special instructions</li>
                <li>Core synchronization using SYNC instruction</li>
                <li>Performance metrics (stalls, IPC, cache miss rates)</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="architecture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
              <CardDescription>Multi-core design with shared memory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Core Design</h3>
              <p>
                The simulator features four RISC-V cores, each with:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>32 registers (x0-x31, with x31 storing core ID)</li>
                <li>5-stage pipeline: Fetch, Decode, Execute, Memory, Writeback</li>
                <li>Private L1 instruction and data caches</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-4">Memory Organization</h3>
              <p>
                The memory system includes:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>4kB main memory (1kB per core)</li>
                <li>Two-level cache hierarchy</li>
                <li>Scratchpad memory for high-performance direct memory access</li>
                <li>Shared L2 cache connecting to main memory</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-4">Fetch Unit</h3>
              <p>
                The simulator has a single fetch unit that fetches instructions for all cores. 
                Each core has its own decode, execute, memory, and writeback stages.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supported Instructions</CardTitle>
              <CardDescription>RISC-V instruction set implementation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>The simulator supports the following RISC-V instructions:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Core Instructions</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><code>ADD rd, rs1, rs2</code> - Add registers</li>
                    <li><code>SUB rd, rs1, rs2</code> - Subtract registers</li>
                    <li><code>ADDI rd, rs1, imm</code> - Add immediate</li>
                    <li><code>BNE rs1, rs2, label</code> - Branch if not equal</li>
                    <li><code>JAL rd, label</code> - Jump and link</li>
                    <li><code>LW rd, offset(rs1)</code> - Load word</li>
                    <li><code>SW rs2, offset(rs1)</code> - Store word</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Special Instructions</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><code>SYNC</code> - Synchronize cores</li>
                    <li><code>LW_SPM rd, offset(rs1)</code> - Load from scratchpad</li>
                    <li><code>SW_SPM rs2, offset(rs1)</code> - Store to scratchpad</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Special Purpose Register</h3>
                <p>
                  Each core has a special purpose register that stores the core ID (0 to 3).
                  This register is accessible as <code>x31</code> and is read-only.
                </p>
                <p className="mt-2">
                  You can use this register in BNE instructions to create core-specific code paths:
                </p>
                <pre className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded overflow-x-auto">
                  <code>BNE x31, 1, label  # Branch if not core 1</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Hierarchy</CardTitle>
              <CardDescription>Cache organization and memory system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Memory Organization</h3>
              <p>
                The memory system is organized in a hierarchical structure:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>4KB main memory shared by all cores</li>
                <li>L1 instruction cache (L1I) per core</li>
                <li>L1 data cache (L1D) per core</li>
                <li>Shared L2 unified cache</li>
                <li>Scratchpad memory (programmer-controlled)</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-4">Cache Configuration</h3>
              <p>
                All caches are configurable with the following parameters:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Size (in bytes)</li>
                <li>Block size (in bytes)</li>
                <li>Associativity</li>
                <li>Access latency (in cycles)</li>
                <li>Replacement policy (LRU, FIFO, or RANDOM)</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-4">Scratchpad Memory</h3>
              <p>
                The scratchpad memory is a fast, programmer-controlled memory with the following characteristics:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Direct access (no automatic replacement)</li>
                <li>Low latency (configurable)</li>
                <li>Accessible via special instructions (LW_SPM, SW_SPM)</li>
                <li>Can significantly improve performance for predictable access patterns</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-4">Memory Access</h3>
              <p>
                Memory access follows this pattern:
              </p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Check appropriate L1 cache (instruction or data)</li>
                <li>On L1 miss, check L2 cache</li>
                <li>On L2 miss, access main memory</li>
                <li>For scratchpad, direct access without caching</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipelining</CardTitle>
              <CardDescription>Pipeline stages and hazard handling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Pipeline Stages</h3>
              <p>
                Each core implements a classic 5-stage RISC-V pipeline:
              </p>
              <ol className="list-decimal pl-6 space-y-1">
                <li><strong>Fetch (IF):</strong> Retrieve instruction from memory</li>
                <li><strong>Decode (ID):</strong> Decode instruction and read registers</li>
                <li><strong>Execute (EX):</strong> Perform ALU operations</li>
                <li><strong>Memory (MEM):</strong> Access data memory if needed</li>
                <li><strong>Writeback (WB):</strong> Write results back to registers</li>
              </ol>
              
              <h3 className="text-lg font-semibold mt-4">Hazard Handling</h3>
              <p>
                The pipeline handles several types of hazards:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Data Hazards:</strong> Dependencies between instructions</li>
                <li><strong>Control Hazards:</strong> From branches and jumps</li>
                <li><strong>Structural Hazards:</strong> Resource conflicts</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-4">Data Forwarding</h3>
              <p>
                The simulator supports data forwarding to reduce pipeline stalls:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Forward from EX/MEM to ID/EX</li>
                <li>Forward from MEM/WB to ID/EX</li>
                <li>Can be enabled or disabled in configuration</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-4">Variable Instruction Latencies</h3>
              <p>
                Different instructions can have different execution latencies:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Memory operations (LW, SW) may take multiple cycles</li>
                <li>Complex arithmetic operations can have longer latencies</li>
                <li>Each operation's latency is configurable</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-4">Performance Metrics</h3>
              <p>
                The simulator tracks various performance metrics:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Instruction count</li>
                <li>Cycle count</li>
                <li>Stall count (by type)</li>
                <li>Instructions Per Cycle (IPC)</li>
                <li>Cache hit/miss rates</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Example Programs</CardTitle>
              <CardDescription>Sample RISC-V code for the simulator</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Code size={20} /> Basic Array Sum
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 mb-2">
                    Compute the sum of an array, with each core handling a portion
                  </p>
                  <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto">
                    <code>{`# Initialize memory with array
# Core 0 sums elements 0-24
# Core 1 sums elements 25-49
# Core 2 sums elements 50-74
# Core 3 sums elements 75-99

# Constants
ADDI x5, x0, 0      # Loop counter i = 0
ADDI x6, x0, 25     # Elements per core = 25
ADDI x7, x0, 100    # Array size = 100
ADDI x8, x0, 4      # Word size = 4
ADDI x9, x0, 400    # Base address of array = 400
ADDI x10, x0, 0     # Sum = 0

# Calculate start index for each core
MUL x11, x31, x6    # start = coreId * elementsPerCore
MUL x11, x11, x8    # start = start * wordSize
ADD x11, x11, x9    # start = start + baseAddress

# Calculate end address
ADDI x12, x6, 0     # count = elementsPerCore
MUL x12, x12, x8    # count = count * wordSize
ADD x12, x12, x11   # end = start + count

LOOP:
  LW x13, 0(x11)    # Load array element
  ADD x10, x10, x13 # Add to sum
  ADDI x11, x11, 4  # Increment address
  BNE x11, x12, LOOP # Continue if not done

# Store partial sum in designated location
ADDI x14, x0, 100   # Base address for partial sums = 100
MUL x15, x31, x8    # offset = coreId * wordSize
ADD x14, x14, x15   # address = base + offset
SW x10, 0(x14)      # Store partial sum

# Synchronize all cores
SYNC

# Core 0 combines partial sums
BNE x31, x0, END    # Only core 0 executes this part
ADDI x16, x0, 0     # finalSum = 0
ADDI x17, x0, 0     # j = 0
ADDI x18, x0, 4     # numCores = 4

COMBINE_LOOP:
  ADDI x14, x0, 100  # Base address for partial sums = 100
  MUL x15, x17, x8   # offset = j * wordSize
  ADD x14, x14, x15  # address = base + offset
  LW x19, 0(x14)     # Load partial sum
  ADD x16, x16, x19  # Add to final sum
  ADDI x17, x17, 1   # j++
  BNE x17, x18, COMBINE_LOOP

# Store final result
ADDI x20, x0, 96     # Address for final sum = 96
SW x16, 0(x20)       # Store final sum

END:
  # Program end
`}</code>
                  </pre>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Code size={20} /> Scratchpad Memory Usage
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 mb-2">
                    Demonstrates the use of scratchpad memory for improved performance
                  </p>
                  <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto">
                    <code>{`# Fill scratchpad with data from main memory
ADDI x5, x0, 0       # i = 0
ADDI x6, x0, 100     # count = 100
ADDI x7, x0, 400     # src = 400 (main memory)
ADDI x8, x0, 0       # dst = 0 (scratchpad)
ADDI x9, x0, 4       # wordSize = 4

FILL_LOOP:
  MUL x10, x5, x9    # offset = i * wordSize
  ADD x11, x7, x10   # srcAddr = src + offset
  ADD x12, x8, x10   # dstAddr = dst + offset
  LW x13, 0(x11)     # Load from main memory
  SW_SPM x13, 0(x12) # Store to scratchpad
  ADDI x5, x5, 1     # i++
  BNE x5, x6, FILL_LOOP

# Process data in scratchpad
ADDI x5, x0, 0       # i = 0
ADDI x14, x0, 0      # sum = 0

PROCESS_LOOP:
  MUL x10, x5, x9    # offset = i * wordSize
  ADD x12, x8, x10   # addr = base + offset
  LW_SPM x13, 0(x12) # Load from scratchpad
  ADD x14, x14, x13  # sum += value
  ADDI x5, x5, 1     # i++
  BNE x5, x6, PROCESS_LOOP

# Store result
ADDI x15, x0, 96     # resultAddr = 96
SW x14, 0(x15)       # Store result
`}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

