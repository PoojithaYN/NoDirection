import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Play, 
  Square, 
  SkipForward, 
  Save, 
  Settings, 
  AlertTriangle,
  MemoryStick, 
  Cpu,
  PieChart,
  Code
} from "lucide-react";
import CodeEditor from "./CodeEditor";
import ConfigPanel from "./ConfigPanel";
import CoreView from "./CoreView";
import MemoryView from "./MemoryView";
import PipelineView from "./PipelineView";
import StatisticsView from "./StatisticsView";
import { RISCVSimulator, SimulatorConfig, SimulatorStatus } from "@/lib/riscv/demo-simulator";
import { getDefaultCode } from "./examples";

interface SimulatorLayoutProps {
  simulator: RISCVSimulator | null;
  defaultConfig: SimulatorConfig;
  onInitialize: (code: string, config: SimulatorConfig) => void;
  onRun: (maxCycles?: number) => Promise<void>;
  onReset: (code: string, config: SimulatorConfig) => void;
  onStep: () => Promise<void>;
}

export default function SimulatorLayout({
  simulator,
  defaultConfig,
  onInitialize,
  onRun,
  onReset,
  onStep
}: SimulatorLayoutProps) {
  const [code, setCode] = useState(getDefaultCode());
  const [config, setConfig] = useState<SimulatorConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState("code");
  const [runMaxCycles, setRunMaxCycles] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };
  
  const handleConfigChange = (newConfig: SimulatorConfig) => {
    setConfig(newConfig);
  };
  
  const handleInitialize = () => {
    onInitialize(code, config);
  };
  
  const handleRun = async () => {
    if (!simulator) return;
    
    setIsRunning(true);
    try {
      await onRun(runMaxCycles);
    } finally {
      setIsRunning(false);
    }
  };
  
  const handleReset = () => {
    if (!simulator) return;
    onReset(code, config);
  };
  
  const handleStep = async () => {
    if (!simulator) return;
    await onStep();
  };
  
  const handleLoadExample = (exampleCode: string) => {
    setCode(exampleCode);
  };
  
  // Determine simulator status
  let simulatorStatus = SimulatorStatus.READY;
  
  try {
    simulatorStatus = simulator ? simulator.getStatus() : SimulatorStatus.READY;
  } catch (error) {
    console.error("Error getting simulator status:", error);
  }
  
  const isInitialized = simulator !== null;
  const hasCompleted = simulatorStatus === SimulatorStatus.COMPLETED;
  const hasError = simulatorStatus === SimulatorStatus.ERROR;
  
  // Get simulator results if available
  let simulationResults = undefined;
  try {
    simulationResults = simulator && (hasCompleted || simulatorStatus === SimulatorStatus.PAUSED) 
      ? simulator.getResults() 
      : undefined;
  } catch (error) {
    console.error("Error getting simulation results:", error);
  }
  
  // Get cores if available
  const cores = simulator ? simulator.getCores() : [];
  
  // Get cycle count
  const cycleCount = simulator ? simulator.getCycleCount() : 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">RISC-V Simulator</h1>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleInitialize}
            disabled={isRunning}
          >
            <Settings className="w-4 h-4 mr-2" />
            Initialize
          </Button>
          
          <Button 
            onClick={handleRun}
            disabled={!isInitialized || isRunning || hasCompleted || hasError}
            variant="default"
          >
            <Play className="w-4 h-4 mr-2" />
            Run
          </Button>
          
          <Button 
            onClick={handleStep}
            disabled={!isInitialized || isRunning || hasCompleted || hasError}
            variant="outline"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Step
          </Button>
          
          <Button 
            onClick={handleReset}
            disabled={!isInitialized || isRunning}
            variant="outline"
          >
            <Square className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
      
      {hasError && simulator && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Error</AlertTitle>
          <AlertDescription>
            {simulator.getError()?.message || "An unknown error occurred during simulation."}
          </AlertDescription>
        </Alert>
      )}
      
      {hasCompleted && (
        <Alert className="mb-6">
          <PieChart className="h-4 w-4" />
          <AlertTitle>Simulation Complete</AlertTitle>
          <AlertDescription>
            The simulation has completed after {cycleCount} cycles with {simulationResults?.instructions || 0} instructions executed.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="code">
                <Code className="w-4 h-4 mr-2" />
                Code
              </TabsTrigger>
              <TabsTrigger value="config">
                <Settings className="w-4 h-4 mr-2" />
                Configuration
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="mt-0">
              <div className="h-[600px]">
                <CodeEditor 
                  code={code} 
                  onCodeChange={handleCodeChange}
                  onLoadExample={handleLoadExample}
                  readOnly={isRunning}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="config" className="mt-0">
              <div className="h-[600px]">
                <ConfigPanel 
                  config={config} 
                  onConfigChange={handleConfigChange} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="h-[600px]">
          <Tabs defaultValue="pipeline">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="pipeline">
                <Cpu className="w-4 h-4 mr-2" />
                Pipeline
              </TabsTrigger>
              <TabsTrigger value="statistics">
                <PieChart className="w-4 h-4 mr-2" />
                Statistics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pipeline" className="mt-0">
              <PipelineView 
                cores={cores} 
                cycleCount={cycleCount} 
              />
            </TabsContent>
            
            <TabsContent value="statistics" className="mt-0">
              <StatisticsView 
                simulationResult={simulationResults} 
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="h-[600px]">
          <Tabs defaultValue="cores">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="cores">
                <Cpu className="w-4 h-4 mr-2" />
                Cores
              </TabsTrigger>
              <TabsTrigger value="memory">
                <MemoryStick className="w-4 h-4 mr-2" />
                Memory
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="cores" className="mt-0">
              <CoreView cores={cores} />
            </TabsContent>
            
            <TabsContent value="memory" className="mt-0">
              <MemoryView 
                memoryDump={simulationResults?.memoryDump}
                simulationResult={simulationResults}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

