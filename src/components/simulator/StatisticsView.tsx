import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimulatorResult } from "@/lib/riscv/simulator";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface StatisticsViewProps {
  simulationResult?: SimulatorResult;
}

export default function StatisticsView({ simulationResult }: StatisticsViewProps) {
  if (!simulationResult) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle>Performance Statistics</CardTitle>
          <CardDescription>Run the simulation to see performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            No simulation data available. Run the simulation first.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { cycles, instructions, stalls, ipc, cacheMissRates, registerStates } = simulationResult;
  
  // Prepare data for IPC chart
  const ipcData = [
    { name: "Core 0", ipc: registerStates[0] ? instructions / cycles : 0 },
    { name: "Core 1", ipc: registerStates[1] ? instructions / cycles : 0 },
    { name: "Core 2", ipc: registerStates[2] ? instructions / cycles : 0 },
    { name: "Core 3", ipc: registerStates[3] ? instructions / cycles : 0 }
  ];
  
  // Prepare data for stall breakdown pie chart
  const stallPercentage = stalls / cycles * 100;
  const executionPercentage = 100 - stallPercentage;
  
  const stallData = [
    { name: "Execution", value: executionPercentage },
    { name: "Stalls", value: stallPercentage }
  ];
  
  // Prepare data for cache miss rates
  const cacheData = [
    { name: "L1I Cache", hitRate: (1 - cacheMissRates.l1i) * 100, missRate: cacheMissRates.l1i * 100 },
    { name: "L1D Cache", hitRate: (1 - cacheMissRates.l1d) * 100, missRate: cacheMissRates.l1d * 100 },
    { name: "L2 Cache", hitRate: (1 - cacheMissRates.l2) * 100, missRate: cacheMissRates.l2 * 100 }
  ];
  
  // Colors for pie chart
  const COLORS = ['#4CAF50', '#F44336'];
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Performance Statistics</CardTitle>
        <CardDescription>Metrics and charts from simulation results</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-muted p-3 rounded-md">
            <div className="text-sm text-muted-foreground">Total Cycles</div>
            <div className="font-mono text-lg">{cycles}</div>
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <div className="text-sm text-muted-foreground">Total Instructions</div>
            <div className="font-mono text-lg">{instructions}</div>
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <div className="text-sm text-muted-foreground">Pipeline Stalls</div>
            <div className="font-mono text-lg">{stalls}</div>
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <div className="text-sm text-muted-foreground">IPC (Instructions Per Cycle)</div>
            <div className="font-mono text-lg">{ipc.toFixed(3)}</div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Instructions Per Cycle (IPC) by Core</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ipcData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => value.toFixed(3)}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                  <Bar dataKey="ipc" fill="var(--chart-1, #4338ca)" name="IPC" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Execution vs. Stalls</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stallData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stallData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Cache Hit/Miss Rates</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cacheData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend />
                    <Bar dataKey="hitRate" fill="var(--chart-2, #4CAF50)" name="Hit Rate %" />
                    <Bar dataKey="missRate" fill="var(--chart-3, #F44336)" name="Miss Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Performance Analysis</h3>
            <p className="text-sm">
              {ipc > 0.8 ? 
                "The simulator is achieving good IPC performance. The pipeline is efficiently utilized with minimal stalling." :
                ipc > 0.5 ?
                "Moderate IPC performance. Consider optimizing code to reduce pipeline stalls or improving cache hit rates." :
                "Low IPC performance. High stall rates or cache misses may be reducing efficiency. Review memory access patterns and pipeline hazards."
              }
            </p>
            <p className="text-sm mt-2">
              {stallPercentage > 30 ?
                "A high percentage of cycles are spent on stalls. This indicates data hazards, control hazards, or memory latency issues." :
                "Pipeline stall rate is within reasonable limits, indicating good instruction flow through the pipeline."
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

