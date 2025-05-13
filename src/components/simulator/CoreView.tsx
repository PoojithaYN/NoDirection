import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Core } from "@/lib/riscv/demo-simulator";

// Direct import with relative path to avoid path resolution issues
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../components/ui/table";

interface CoreViewProps {
  cores: Core[];
}

export default function CoreView({ cores }: CoreViewProps) {
  const [activeTab, setActiveTab] = useState("core-0");
  
  // Get statistics for each core
  const coreStats = cores.map(core => core.getStats());
  
  // Render register values for a specific core
  const renderRegisters = (coreId: number) => {
    if (!coreStats[coreId]) return null;
    
    const registers = coreStats[coreId].registers;
    const rows = [];
    
    // Display registers in rows of 4
    for (let i = 0; i < 32; i += 4) {
      rows.push(
        <TableRow key={i}>
          {/* Use array of cells instead of fragments */}
          {[0, 1, 2, 3].flatMap(offset => {
            const regIndex = i + offset;
            return [
              <TableCell key={`reg-${regIndex}`} className="font-mono text-sm py-1">x{regIndex}</TableCell>,
              <TableCell key={`val-${regIndex}`} className="font-mono text-sm py-1 text-right">
                {registers[regIndex] !== undefined ? 
                  regIndex === 31 ? 
                    <span className="text-primary font-bold">{registers[regIndex]}</span> : 
                    registers[regIndex]
                  : "N/A"}
              </TableCell>
            ];
          })}
        </TableRow>
      );
    }
    
    return (
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Reg</TableHead>
              <TableHead className="w-20 text-right">Value</TableHead>
              <TableHead className="w-12">Reg</TableHead>
              <TableHead className="w-20 text-right">Value</TableHead>
              <TableHead className="w-12">Reg</TableHead>
              <TableHead className="w-20 text-right">Value</TableHead>
              <TableHead className="w-12">Reg</TableHead>
              <TableHead className="w-20 text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  // Render core status (PC, IPC, stalls)
  const renderCoreStatus = (coreId: number) => {
    if (!coreStats[coreId]) return null;
    
    const stats = coreStats[coreId];
    
    return (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted p-3 rounded-md">
          <div className="text-sm text-muted-foreground">Program Counter</div>
          <div className="font-mono text-lg">0x{(cores[coreId].getStats().cycles * 4).toString(16).padStart(8, '0')}</div>
        </div>
        
        <div className="bg-muted p-3 rounded-md">
          <div className="text-sm text-muted-foreground">Core ID</div>
          <div className="font-mono text-lg">{coreId}</div>
        </div>
        
        <div className="bg-muted p-3 rounded-md">
          <div className="text-sm text-muted-foreground">Instructions</div>
          <div className="font-mono">{stats.instructions}</div>
        </div>
        
        <div className="bg-muted p-3 rounded-md">
          <div className="text-sm text-muted-foreground">Stalls</div>
          <div className="font-mono">{stats.stalls}</div>
        </div>
        
        <div className="bg-muted p-3 rounded-md">
          <div className="text-sm text-muted-foreground">Cycles</div>
          <div className="font-mono">{stats.cycles}</div>
        </div>
        
        <div className="bg-muted p-3 rounded-md">
          <div className="text-sm text-muted-foreground">IPC</div>
          <div className="font-mono">{stats.ipc.toFixed(3)}</div>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Core Status</CardTitle>
        <CardDescription>Register contents and statistics for each core</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            {cores.map((core, index) => (
              <TabsTrigger key={index} value={`core-${index}`}>
                Core {index}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {cores.map((core, index) => (
            <TabsContent key={index} value={`core-${index}`} className="mt-0">
              {renderCoreStatus(index)}
              <h3 className="font-medium mb-2">Registers</h3>
              {renderRegisters(index)}
              <div className="mt-2 text-sm text-muted-foreground">
                <strong>Note:</strong> x31 (highlighted) is the special-purpose register containing the Core ID.
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

