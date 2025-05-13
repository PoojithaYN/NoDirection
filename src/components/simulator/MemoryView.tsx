import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { SimulatorResult } from "@/lib/riscv/simulator";

interface MemoryViewProps {
  memoryDump?: Uint32Array;
  simulationResult?: SimulatorResult;
}

export default function MemoryView({ memoryDump, simulationResult }: MemoryViewProps) {
  const [startAddress, setStartAddress] = useState(0);
  const [searchAddress, setSearchAddress] = useState("");
  const [activeTab, setActiveTab] = useState("main-memory");
  
  const memory = memoryDump || new Uint32Array(0);
  
  // Handle address navigation
  const navigateToAddress = (address: number) => {
    // Round to nearest row start
    const rowStart = Math.floor(address / 16) * 16;
    setStartAddress(rowStart);
  };
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const address = parseInt(searchAddress, 16);
    if (!isNaN(address) && address >= 0 && address < memory.length * 4) {
      navigateToAddress(address);
    }
  };
  
  // Navigate forward/backward
  const navigateMemory = (direction: number) => {
    const newAddress = Math.max(0, startAddress + direction * 64);
    if (newAddress < memory.length * 4) {
      setStartAddress(newAddress);
    }
  };
  
  // Render main memory view
  const renderMemory = () => {
    if (!memory || memory.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No memory data available. Run the simulation first.
        </div>
      );
    }
    
    const rows = [];
    const wordsPerRow = 4;
    
    // Display a certain number of rows starting from startAddress
    for (let i = 0; i < 16; i++) {
      const rowAddress = startAddress + i * 16;
      if (rowAddress >= memory.length * 4) break;
      
      const rowWordIndex = rowAddress / 4;
      const cells = [];
      
      // For each row, show up to 4 words (16 bytes)
      for (let j = 0; j < wordsPerRow; j++) {
        const wordIndex = rowWordIndex + j;
        if (wordIndex >= memory.length) break;
        
        const value = memory[wordIndex];
        cells.push(
          <TableCell key={`word-${j}`} className="font-mono text-right">
            {value !== undefined ? 
              `0x${value.toString(16).padStart(8, '0')}` : 
              "--------"}
          </TableCell>
        );
      }
      
      rows.push(
        <TableRow key={`row-${i}`}>
          <TableCell className="font-mono">
            0x{rowAddress.toString(16).padStart(8, '0')}
          </TableCell>
          {cells}
        </TableRow>
      );
    }
    
    return (
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Address</TableHead>
              <TableHead className="text-right">+0x0</TableHead>
              <TableHead className="text-right">+0x4</TableHead>
              <TableHead className="text-right">+0x8</TableHead>
              <TableHead className="text-right">+0xC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  // Render cache statistics
  const renderCacheStats = () => {
    if (!simulationResult) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No cache statistics available. Run the simulation first.
        </div>
      );
    }
    
    const { cacheMissRates } = simulationResult;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-md">L1 Instruction Cache</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Miss Rate:</span>
                  <span className="font-mono">{(cacheMissRates.l1i * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hit Rate:</span>
                  <span className="font-mono">{((1 - cacheMissRates.l1i) * 100).toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-md">L1 Data Cache</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Miss Rate:</span>
                  <span className="font-mono">{(cacheMissRates.l1d * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hit Rate:</span>
                  <span className="font-mono">{((1 - cacheMissRates.l1d) * 100).toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-md">L2 Cache</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Miss Rate:</span>
                  <span className="font-mono">{(cacheMissRates.l2 * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hit Rate:</span>
                  <span className="font-mono">{((1 - cacheMissRates.l2) * 100).toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-medium mb-2">Memory Hierarchy Analysis</h3>
          <p className="text-sm">
            {renderMemoryAnalysis(cacheMissRates)}
          </p>
        </div>
      </div>
    );
  };
  
  // Generate memory hierarchy analysis text based on miss rates
  const renderMemoryAnalysis = (cacheMissRates: { l1i: number, l1d: number, l2: number }) => {
    if (cacheMissRates.l1i > 0.1 && cacheMissRates.l1d > 0.1) {
      return "Both instruction and data caches are experiencing high miss rates. This suggests poor spatial and temporal locality in the code execution pattern. Consider optimizing memory access patterns or increasing cache sizes.";
    } else if (cacheMissRates.l1i > 0.1) {
      return "The instruction cache is experiencing a high miss rate. This suggests the code may have many jumps or a working set that exceeds the L1I cache size. Consider code restructuring to improve instruction locality.";
    } else if (cacheMissRates.l1d > 0.1) {
      return "The data cache is experiencing a high miss rate. This suggests irregular data access patterns. Consider using the scratchpad memory for frequently accessed data or restructuring data access patterns.";
    } else if (cacheMissRates.l2 > 0.3) {
      return "The L2 cache has a high miss rate while L1 caches perform well. This suggests that when data misses in L1, it often also misses in L2. Consider increasing the L2 cache size or associativity.";
    } else {
      return "The cache hierarchy is performing efficiently with low miss rates. The program exhibits good locality and the current cache configuration appears suitable for the workload.";
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Memory Hierarchy</CardTitle>
        <CardDescription>Main memory contents and cache statistics</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="main-memory">Main Memory</TabsTrigger>
            <TabsTrigger value="cache-stats">Cache Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="main-memory" className="mt-0">
            <div className="flex items-center gap-4 mb-4">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Address (hex)"
                    className="pl-8"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                  />
                </div>
                <Button type="submit" size="sm">Go</Button>
              </form>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateMemory(-1)}
                  disabled={startAddress === 0}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateMemory(1)}
                  disabled={!memory || startAddress >= (memory.length * 4 - 64)}
                >
                  Next
                </Button>
              </div>
            </div>
            
            {renderMemory()}
          </TabsContent>
          
          <TabsContent value="cache-stats" className="mt-0">
            {renderCacheStats()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

