import { useState, useCallback } from "react";
import SimulatorLayout from "@/components/simulator/SimulatorLayout";
import { useToast } from "@/hooks/use-toast";
import { RISCVSimulator, SimulatorConfig, SimulatorStatus } from "@/lib/riscv/demo-simulator";
import { CacheReplacementPolicy } from "@/lib/riscv/cache";
import { Operation } from "@/lib/riscv/instruction";

export default function Simulator() {
  const { toast } = useToast();
  const [simulator, setSimulator] = useState<RISCVSimulator | null>(null);
  const [counter, setCounter] = useState(0); // Counter to force re-renders
  
  // Force a re-render without changing the simulator object
  const forceUpdate = useCallback(() => {
    setCounter(prev => prev + 1);
  }, []);
  
  // Create default simulator configuration
  const createDefaultConfig = useCallback((): SimulatorConfig => {
    const instructionLatencies = new Map<Operation, number>();
    instructionLatencies.set(Operation.ADD, 1);
    instructionLatencies.set(Operation.SUB, 1);
    instructionLatencies.set(Operation.MUL, 3); // Added MUL with latency 3
    instructionLatencies.set(Operation.ADDI, 1);
    instructionLatencies.set(Operation.LW, 1);
    instructionLatencies.set(Operation.SW, 1);
    instructionLatencies.set(Operation.BNE, 1);
    instructionLatencies.set(Operation.JAL, 1);
    instructionLatencies.set(Operation.JALR, 1); // Added JALR
    instructionLatencies.set(Operation.LW_SPM, 1);
    instructionLatencies.set(Operation.SW_SPM, 1);
    instructionLatencies.set(Operation.SYNC, 1);
    
    return {
      memorySizeBytes: 4096,
      mainMemoryLatency: 100,
      
      l1InstructionCacheConfig: {
        sizeBytes: 1024,
        blockSizeBytes: 64,
        associativity: 2,
        accessLatency: 1,
        replacementPolicy: CacheReplacementPolicy.LRU
      },
      
      l1DataCacheConfig: {
        sizeBytes: 1024,
        blockSizeBytes: 64,
        associativity: 2,
        accessLatency: 1,
        replacementPolicy: CacheReplacementPolicy.LRU
      },
      
      l2CacheConfig: {
        sizeBytes: 4096,
        blockSizeBytes: 64,
        associativity: 8,
        accessLatency: 10,
        replacementPolicy: CacheReplacementPolicy.LRU
      },
      
      scratchpadSizeBytes: 1024,
      scratchpadLatency: 1,
      
      forwardingEnabled: true,
      instructionLatencies
    };
  }, []);
  
  // Initialize simulator
  const initializeSimulator = useCallback((code: string, config: SimulatorConfig) => {
    try {
      console.log("Initializing simulator with code:", code);
      const sim = new RISCVSimulator(config);
      sim.loadProgram(code);
      setSimulator(sim);
      
      toast({
        title: "Simulator initialized",
        description: "The program has been loaded successfully."
      });
    } catch (error) {
      console.error("Error initializing simulator:", error);
      toast({
        title: "Initialization error",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  }, [toast]);
  
  // Run simulation
  const runSimulation = useCallback(async (maxCycles: number = 1000) => {
    if (!simulator) return;
    
    try {
      console.log("Running simulation with max cycles:", maxCycles);
      await simulator.run(maxCycles);
      
      // Check simulation status
      const status = simulator.getStatus();
      console.log("Simulation status after run:", status);
      
      if (status === SimulatorStatus.COMPLETED) {
        toast({
          title: "Simulation completed",
          description: `Completed in ${simulator.getCycleCount()} cycles.`
        });
      } else if (status === SimulatorStatus.ERROR) {
        const error = simulator.getError();
        toast({
          title: "Simulation error",
          description: error ? error.message : "Unknown error",
          variant: "destructive"
        });
      } else if (status === SimulatorStatus.PAUSED) {
        toast({
          title: "Simulation paused",
          description: `Paused after ${simulator.getCycleCount()} cycles.`
        });
      }
      
      // Force update to re-render component
      forceUpdate();
    } catch (error) {
      console.error("Error running simulation:", error);
      toast({
        title: "Simulation error",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  }, [simulator, toast, forceUpdate]);
  
  // Reset simulation
  const resetSimulation = useCallback((code: string, config: SimulatorConfig) => {
    if (!simulator) return;
    
    try {
      console.log("Resetting simulator");
      simulator.reset();
      simulator.loadProgram(code);
      
      toast({
        title: "Simulator reset",
        description: "The program has been reloaded."
      });
      
      // Force update to re-render component
      forceUpdate();
    } catch (error) {
      console.error("Error resetting simulator:", error);
      toast({
        title: "Reset error",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  }, [simulator, toast, forceUpdate]);
  
  // Step through simulation
  const stepSimulation = useCallback(async () => {
    if (!simulator) return;
    
    try {
      console.log("Stepping simulation");
      await simulator.runCycle();
      
      // Check if simulation completed or errored
      const status = simulator.getStatus();
      console.log("Simulation status after step:", status);
      
      if (status === SimulatorStatus.COMPLETED) {
        toast({
          title: "Simulation completed",
          description: `Completed in ${simulator.getCycleCount()} cycles.`
        });
      } else if (status === SimulatorStatus.ERROR) {
        const error = simulator.getError();
        toast({
          title: "Simulation error",
          description: error ? error.message : "Unknown error",
          variant: "destructive"
        });
      }
      
      // Force update to re-render component
      forceUpdate();
    } catch (error) {
      console.error("Error stepping simulation:", error);
      toast({
        title: "Step error",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  }, [simulator, toast, forceUpdate]);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">RISC-V Simulator</h1>
      
      <SimulatorLayout
        simulator={simulator}
        defaultConfig={createDefaultConfig()}
        onInitialize={initializeSimulator}
        onRun={runSimulation}
        onReset={resetSimulation}
        onStep={stepSimulation}
      />
    </div>
  );
}
