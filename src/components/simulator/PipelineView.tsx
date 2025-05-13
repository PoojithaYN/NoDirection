import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Core, PipelineState } from "@/lib/riscv/demo-simulator";
import { Instruction, InstructionStatus } from "@/lib/riscv/instruction";

interface PipelineViewProps {
  cores: Core[];
  cycleCount: number;
}

export default function PipelineView({ cores, cycleCount }: PipelineViewProps) {
  const [activeTab, setActiveTab] = useState("core-0");
  
  // Get statistics for each core
  const coreStats = cores.map(core => core.getStats());
  
  // Helper to render an instruction in the pipeline
  const renderInstruction = (instruction: Instruction | null, stage: string) => {
    if (!instruction) {
      return <div className="text-center text-muted-foreground">-</div>;
    }
    
    // Get status badge variant based on instruction status
    const getStatusVariant = () => {
      switch (instruction.status) {
        case InstructionStatus.STALLED:
          return "destructive";
        case InstructionStatus.FLUSHED:
          return "destructive";
        default:
          return "outline";
      }
    };
    
    return (
      <div className="space-y-1">
        <div className="font-mono text-sm truncate" title={instruction.toString()}>
          {instruction.toString()}
        </div>
        <Badge variant={getStatusVariant()} className="text-xs">
          {InstructionStatus[instruction.status]}
        </Badge>
      </div>
    );
  };
  
  // Render pipeline visualization for a core
  const renderPipeline = (coreId: number) => {
    if (!coreStats[coreId]) return null;
    
    const pipelineState = coreStats[coreId].pipeline;
    
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fetch</TableHead>
                <TableHead>Decode</TableHead>
                <TableHead>Execute</TableHead>
                <TableHead>Memory</TableHead>
                <TableHead>Writeback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="min-w-[150px]">
                  {renderInstruction(pipelineState.fetch, "fetch")}
                </TableCell>
                <TableCell className="min-w-[150px]">
                  {renderInstruction(pipelineState.decode, "decode")}
                </TableCell>
                <TableCell className="min-w-[150px]">
                  {renderInstruction(pipelineState.execute, "execute")}
                </TableCell>
                <TableCell className="min-w-[150px]">
                  {renderInstruction(pipelineState.memory, "memory")}
                </TableCell>
                <TableCell className="min-w-[150px]">
                  {renderInstruction(pipelineState.writeback, "writeback")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted p-3 rounded-md">
            <div className="text-sm text-muted-foreground">Cycle Count</div>
            <div className="font-mono text-lg">{cycleCount}</div>
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <div className="text-sm text-muted-foreground">Instructions Executed</div>
            <div className="font-mono text-lg">{coreStats[coreId].instructions}</div>
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <div className="text-sm text-muted-foreground">Pipeline Stalls</div>
            <div className="font-mono text-lg">{coreStats[coreId].stalls}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Recently Completed Instructions</h3>
          <div className="max-h-[200px] overflow-y-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>Instruction</TableHead>
                  <TableHead>Fetch</TableHead>
                  <TableHead>Complete</TableHead>
                  <TableHead>Cycles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {([]).map((instr: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs py-1">
                      0x{instr.address.toString(16).padStart(8, '0')}
                    </TableCell>
                    <TableCell className="font-mono text-xs py-1">
                      {instr.toString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs py-1">
                      {instr.fetchCycle}
                    </TableCell>
                    <TableCell className="font-mono text-xs py-1">
                      {instr.writebackCycle}
                    </TableCell>
                    <TableCell className="font-mono text-xs py-1">
                      {instr.writebackCycle - instr.fetchCycle + 1}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Pipeline Visualization</CardTitle>
        <CardDescription>Current state of the 5-stage pipeline for each core</CardDescription>
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
              {renderPipeline(index)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

