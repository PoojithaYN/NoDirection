// Example RISC-V assembly code for the simulator

export interface CodeExample {
  id: string;
  name: string;
  description: string;
  code: string;
}

export const examples: CodeExample[] = [
  {
    id: "simple-add",
    name: "Simple Addition",
    description: "Basic arithmetic operations",
    code: `# Simple ADD/SUB operations
# Demonstrates basic register operations

# Initialize registers
ADDI x1, x0, 10    # x1 = 10
ADDI x2, x0, 20    # x2 = 20
ADDI x3, x0, 5     # x3 = 5

# Perform operations
ADD x4, x1, x2     # x4 = x1 + x2 = 30
SUB x5, x4, x3     # x5 = x4 - x3 = 25
ADD x6, x5, x5     # x6 = x5 + x5 = 50

# Store results in memory
ADDI x7, x0, 100   # Memory address 100
SW x4, 0(x7)       # Store x4 at address 100
SW x5, 4(x7)       # Store x5 at address 104
SW x6, 8(x7)       # Store x6 at address 108`
  },
  {
    id: "branch-jump",
    name: "Branches and Jumps",
    description: "Control flow with branching and jumping",
    code: `# Branch and Jump examples
# Demonstrates control flow operations

# Initialize loop counter and limit
ADDI x1, x0, 0     # Counter = 0
ADDI x2, x0, 5     # Limit = 5
ADDI x3, x0, 0     # Sum = 0

# Loop to sum numbers from 0 to 4
LOOP:
  ADD x3, x3, x1    # Sum += counter
  ADDI x1, x1, 1    # Counter++
  BNE x1, x2, LOOP  # If counter != limit, loop again

# Call a function via JAL
JAL x4, FUNCTION    # Jump to function, save return address in x4

# Store final result
ADDI x10, x0, 100   # Address 100
SW x3, 0(x10)       # Store sum at address 100
JAL x0, END         # Jump to end

# Simple function that doubles a value
FUNCTION:
  ADD x3, x3, x3     # Double the sum
  JALR x0, 0(x4)     # Return to caller

END:
  # Program end`
  },
  {
    id: "array-sum",
    name: "Array Sum (Multi-core)",
    description: "Sum array elements using multiple cores",
    code: `# Array Sum using multiple cores
# Each core processes 25 elements of a 100-element array

# Initialize constants
ADDI x1, x0, 100    # Base address of array
ADDI x2, x0, 25     # Elements per core
ADDI x3, x0, 0      # Loop counter
ADDI x4, x0, 0      # Sum

# Calculate start address for this core
MUL x5, x31, x2     # x5 = CoreID * ElementsPerCore 
                    # (x31 contains CoreID)
ADDI x6, x0, 4      # Word size = 4 bytes
MUL x5, x5, x6      # x5 = x5 * 4 (offset in bytes)
ADD x5, x5, x1      # x5 = Base address + offset

# Calculate end condition
ADD x7, x3, x2      # x7 = Elements to process

LOOP:
  LW x8, 0(x5)       # Load array element
  ADD x4, x4, x8     # Add to sum
  ADDI x5, x5, 4     # Next address
  ADDI x3, x3, 1     # Increment counter
  BNE x3, x7, LOOP   # Loop if not done

# Store partial sum in core-specific location
ADDI x9, x0, 200     # Base address for results
MUL x10, x31, x6     # x10 = CoreID * 4
ADD x9, x9, x10      # x9 = Result address for this core
SW x4, 0(x9)         # Store partial sum

# Synchronize all cores
SYNC

# Core 0 combines all partial sums
BNE x31, x0, END     # If not Core 0, skip this part

# Sum up partial results
ADDI x11, x0, 0      # Final sum
ADDI x12, x0, 0      # Loop counter
ADDI x13, x0, 4      # Number of cores

COMBINE_LOOP:
  ADDI x9, x0, 200    # Base address for results
  MUL x10, x12, x6    # x10 = Counter * 4
  ADD x9, x9, x10     # Address of partial sum
  LW x14, 0(x9)       # Load partial sum
  ADD x11, x11, x14   # Add to final sum
  ADDI x12, x12, 1    # Increment counter
  BNE x12, x13, COMBINE_LOOP

# Store final result
ADDI x15, x0, 300     # Final result address
SW x11, 0(x15)        # Store final sum

END:
  # Program end`
  },
  {
    id: "scratchpad-example",
    name: "Scratchpad Memory",
    description: "Using scratchpad memory for faster access",
    code: `# Scratchpad Memory Example
# Demonstrates the use of scratchpad memory for faster data access

# Initialize array in main memory (assume it's already populated)
ADDI x1, x0, 100    # Base address of array in main memory
ADDI x2, x0, 25     # Number of elements to process
ADDI x3, x0, 0      # Loop counter

# Copy data from main memory to scratchpad
COPY_LOOP:
  MUL x4, x3, x31    # Calculate offset based on CoreID
  ADDI x5, x0, 4     # Word size = 4 bytes
  MUL x4, x4, x5     # Byte offset
  ADD x6, x1, x4     # Source address in main memory
  LW x7, 0(x6)       # Load value from main memory
  
  # Store in scratchpad memory
  SW_SPM x7, 0(x3)   # Store at index in scratchpad
  ADDI x3, x3, 1     # Increment counter
  BNE x3, x2, COPY_LOOP

# Process data using scratchpad memory
ADDI x3, x0, 0      # Reset counter
ADDI x8, x0, 0      # Initialize sum

PROCESS_LOOP:
  LW_SPM x9, 0(x3)   # Load from scratchpad (much faster)
  ADD x8, x8, x9     # Add to sum
  ADDI x3, x3, 1     # Increment counter
  BNE x3, x2, PROCESS_LOOP

# Store result back to main memory
ADDI x10, x0, 200    # Result address base
MUL x11, x31, x5     # CoreID * word size
ADD x10, x10, x11    # Result address for this core
SW x8, 0(x10)        # Store result

# Synchronize cores
SYNC

# End of program`
  },
  {
    id: "cache-test",
    name: "Cache Performance Test",
    description: "Demonstrates different memory access patterns",
    code: `# Cache Performance Test
# Tests different memory access patterns for cache behavior

# Sequential access pattern - good cache performance
ADDI x1, x0, 400    # Base address
ADDI x2, x0, 100    # Number of elements
ADDI x3, x0, 0      # Loop counter
ADDI x4, x0, 0      # Sum

SEQ_LOOP:
  MUL x5, x3, x31    # Offset based on CoreID
  ADDI x6, x0, 4     # Word size
  MUL x5, x5, x6     # Byte offset
  ADD x7, x1, x5     # Address to access
  LW x8, 0(x7)       # Load value (should have good hit rate)
  ADD x4, x4, x8     # Add to sum
  ADDI x3, x3, 1     # Increment counter
  BNE x3, x2, SEQ_LOOP

# Store sequential sum
ADDI x9, x0, 200     # Result address
SW x4, 0(x9)         # Store result

# Now try strided access - poor cache performance
ADDI x1, x0, 400     # Base address
ADDI x2, x0, 25      # Fewer elements due to stride
ADDI x3, x0, 0       # Loop counter
ADDI x4, x0, 0       # Sum
ADDI x10, x0, 16     # Stride (16 words = 64 bytes, typical cache line)

STRIDE_LOOP:
  MUL x5, x3, x10    # Stride offset
  MUL x6, x5, x31    # Apply CoreID
  ADDI x7, x0, 4     # Word size
  MUL x6, x6, x7     # Byte offset
  ADD x8, x1, x6     # Address to access
  LW x9, 0(x8)       # Load value (should cause more misses)
  ADD x4, x4, x9     # Add to sum
  ADDI x3, x3, 1     # Increment counter
  BNE x3, x2, STRIDE_LOOP

# Store strided sum
ADDI x11, x0, 204    # Result address
SW x4, 0(x11)        # Store result

# Synchronize cores
SYNC

# End of program`
  },
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    description: "Bubble sort implementation",
    code: `# Bubble Sort Implementation
# Each core sorts its own section of an array

# Constants
ADDI x1, x0, 400    # Base address of array
ADDI x2, x0, 25     # Elements per core
ADDI x3, x0, 4      # Word size

# Calculate start address for this core
MUL x4, x31, x2     # x4 = CoreID * ElementsPerCore
MUL x4, x4, x3      # Convert to byte offset
ADD x4, x4, x1      # x4 = Base address + offset

# Calculate end address
MUL x5, x2, x3      # Size in bytes
ADD x5, x5, x4      # End address

# Outer loop - number of passes
ADDI x6, x0, 0      # i = 0

OUTER_LOOP:
  BEQ x6, x2, OUTER_DONE  # if i == size, done
  
  # Inner loop - compare adjacent elements
  ADDI x7, x4, 0     # Current address = start
  SUB x8, x5, x3     # End address for inner loop
  SUB x8, x8, x6     # Adjust for already sorted elements
  
  INNER_LOOP:
    BEQ x7, x8, INNER_DONE  # if current == end, done with inner
    
    # Load adjacent elements
    LW x9, 0(x7)      # Load current element
    LW x10, 4(x7)     # Load next element
    
    # Compare and swap if needed
    BLE x9, x10, NO_SWAP  # If current <= next, no swap needed
    
    # Swap elements
    SW x10, 0(x7)     # Store next at current
    SW x9, 4(x7)      # Store current at next
    
    NO_SWAP:
    ADDI x7, x7, 4    # Move to next element
    BNE x7, x8, INNER_LOOP  # Continue inner loop
    
  INNER_DONE:
  ADDI x6, x6, 1      # i++
  BNE x6, x2, OUTER_LOOP  # Continue outer loop
  
OUTER_DONE:
  # Sorting complete for this core
  
  # Set a flag to indicate completion
  ADDI x11, x0, 300   # Flags base address
  MUL x12, x31, x3    # CoreID * word size
  ADD x11, x11, x12   # Flag address for this core
  ADDI x13, x0, 1     # Completion value
  SW x13, 0(x11)      # Set flag
  
  # Synchronize cores
  SYNC
  
  # End of program`
  }
];

export const getDefaultCode = (): string => {
  return `# Simple RISC-V program
# Demonstrates basic functionality

# Initialize registers
ADDI x1, x0, 10    # x1 = 10
ADDI x2, x0, 20    # x2 = 20

# Perform addition
ADD x3, x1, x2     # x3 = x1 + x2 = 30

# Store result in memory
ADDI x4, x0, 100   # Memory address 100
SW x3, 0(x4)       # Store result at address 100

# Branch example
BNE x31, x0, CORE_OTHER  # Branch if not Core 0

# Core 0 specific code
ADDI x5, x0, 40    # x5 = 40
JAL x0, END        # Jump to end

CORE_OTHER:
# Other cores specific code
ADDI x5, x0, 50    # x5 = 50

END:
# Program end`;
};

