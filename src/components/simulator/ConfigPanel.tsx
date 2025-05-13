import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SimulatorConfig } from "@/lib/riscv/demo-simulator";
import { CacheReplacementPolicy } from "@/lib/riscv/cache";
import { Operation } from "@/lib/riscv/instruction";

interface ConfigPanelProps {
  config: SimulatorConfig;
  onConfigChange: (config: SimulatorConfig) => void;
  onSaveConfig?: () => void;
  onLoadConfig?: () => void;
}

export default function ConfigPanel({ 
  config, 
  onConfigChange,
  onSaveConfig,
  onLoadConfig
}: ConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<SimulatorConfig>({ ...config });
  
  // Update local config and propagate changes
  const updateConfig = (updates: Partial<SimulatorConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };
  
  // Handle cache config updates
  const updateCacheConfig = (cacheType: 'l1InstructionCacheConfig' | 'l1DataCacheConfig' | 'l2CacheConfig', updates: Partial<any>) => {
    const newCacheConfig = { ...localConfig[cacheType], ...updates };
    updateConfig({ [cacheType]: newCacheConfig });
  };
  
  // Handle instruction latency updates
  const updateInstructionLatency = (operation: Operation, latency: number) => {
    const newLatencies = new Map(localConfig.instructionLatencies);
    newLatencies.set(operation, latency);
    updateConfig({ instructionLatencies: newLatencies });
  };
  
  // Get latency for an operation
  const getLatency = (operation: Operation): number => {
    return localConfig.instructionLatencies.get(operation) || 1;
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Simulator Configuration</CardTitle>
        <CardDescription>Configure simulator parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 overflow-auto" style={{ maxHeight: "calc(100% - 90px)" }}>
        <Tabs defaultValue="general">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="memory" className="flex-1">Memory</TabsTrigger>
            <TabsTrigger value="pipeline" className="flex-1">Pipeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="memorySize">Memory Size (bytes)</Label>
                <Input 
                  id="memorySize" 
                  type="number" 
                  min="1024" 
                  max="65536" 
                  step="1024"
                  value={localConfig.memorySizeBytes}
                  onChange={(e) => updateConfig({ memorySizeBytes: parseInt(e.target.value) })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="mainMemoryLatency">Main Memory Latency (cycles)</Label>
                <Slider 
                  id="mainMemoryLatency"
                  min={10}
                  max={200}
                  step={5}
                  value={[localConfig.mainMemoryLatency]}
                  onValueChange={(value) => updateConfig({ mainMemoryLatency: value[0] })}
                />
                <div className="text-right text-sm text-muted-foreground">{localConfig.mainMemoryLatency} cycles</div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="scratchpadSize">Scratchpad Size (bytes)</Label>
                <Input 
                  id="scratchpadSize" 
                  type="number" 
                  min="256" 
                  max="4096" 
                  step="256"
                  value={localConfig.scratchpadSizeBytes}
                  onChange={(e) => updateConfig({ scratchpadSizeBytes: parseInt(e.target.value) })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="scratchpadLatency">Scratchpad Latency (cycles)</Label>
                <Slider 
                  id="scratchpadLatency"
                  min={1}
                  max={10}
                  step={1}
                  value={[localConfig.scratchpadLatency]}
                  onValueChange={(value) => updateConfig({ scratchpadLatency: value[0] })}
                />
                <div className="text-right text-sm text-muted-foreground">{localConfig.scratchpadLatency} cycles</div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="memory" className="space-y-6">
            <div>
              <h3 className="text-md font-medium mb-2">L1 Instruction Cache</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="l1i-size">Size (bytes)</Label>
                  <Input 
                    id="l1i-size" 
                    type="number" 
                    min="256" 
                    max="8192" 
                    step="256"
                    value={localConfig.l1InstructionCacheConfig.sizeBytes}
                    onChange={(e) => updateCacheConfig('l1InstructionCacheConfig', { sizeBytes: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="l1i-block">Block Size (bytes)</Label>
                  <Input 
                    id="l1i-block" 
                    type="number" 
                    min="16" 
                    max="256" 
                    step="16"
                    value={localConfig.l1InstructionCacheConfig.blockSizeBytes}
                    onChange={(e) => updateCacheConfig('l1InstructionCacheConfig', { blockSizeBytes: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="l1i-assoc">Associativity</Label>
                  <Input 
                    id="l1i-assoc" 
                    type="number" 
                    min="1" 
                    max="16" 
                    step="1"
                    value={localConfig.l1InstructionCacheConfig.associativity}
                    onChange={(e) => updateCacheConfig('l1InstructionCacheConfig', { associativity: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="l1i-latency">Latency (cycles)</Label>
                  <Input 
                    id="l1i-latency" 
                    type="number" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={localConfig.l1InstructionCacheConfig.accessLatency}
                    onChange={(e) => updateCacheConfig('l1InstructionCacheConfig', { accessLatency: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="grid gap-1 col-span-2">
                  <Label htmlFor="l1i-policy">Replacement Policy</Label>
                  <Select 
                    value={localConfig.l1InstructionCacheConfig.replacementPolicy} 
                    onValueChange={(value) => updateCacheConfig('l1InstructionCacheConfig', { replacementPolicy: value as CacheReplacementPolicy })}
                  >
                    <SelectTrigger id="l1i-policy">
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CacheReplacementPolicy.LRU}>LRU</SelectItem>
                      <SelectItem value={CacheReplacementPolicy.FIFO}>FIFO</SelectItem>
                      <SelectItem value={CacheReplacementPolicy.RANDOM}>RANDOM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">L1 Data Cache</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="l1d-size">Size (bytes)</Label>
                  <Input 
                    id="l1d-size" 
                    type="number" 
                    min="256" 
                    max="8192" 
                    step="256"
                    value={localConfig.l1DataCacheConfig.sizeBytes}
                    onChange={(e) => updateCacheConfig('l1DataCacheConfig', { sizeBytes: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="l1d-block">Block Size (bytes)</Label>
                  <Input 
                    id="l1d-block" 
                    type="number" 
                    min="16" 
                    max="256" 
                    step="16"
                    value={localConfig.l1DataCacheConfig.blockSizeBytes}
                    onChange={(e) => updateCacheConfig('l1DataCacheConfig', { blockSizeBytes: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="l1d-assoc">Associativity</Label>
                  <Input 
                    id="l1d-assoc" 
                    type="number" 
                    min="1" 
                    max="16" 
                    step="1"
                    value={localConfig.l1DataCacheConfig.associativity}
                    onChange={(e) => updateCacheConfig('l1DataCacheConfig', { associativity: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="l1d-latency">Latency (cycles)</Label>
                  <Input 
                    id="l1d-latency" 
                    type="number" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={localConfig.l1DataCacheConfig.accessLatency}
                    onChange={(e) => updateCacheConfig('l1DataCacheConfig', { accessLatency: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="grid gap-1 col-span-2">
                  <Label htmlFor="l1d-policy">Replacement Policy</Label>
                  <Select 
                    value={localConfig.l1DataCacheConfig.replacementPolicy} 
                    onValueChange={(value) => updateCacheConfig('l1DataCacheConfig', { replacementPolicy: value as CacheReplacementPolicy })}
                  >
                    <SelectTrigger id="l1d-policy">
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CacheReplacementPolicy.LRU}>LRU</SelectItem>
                      <SelectItem value={CacheReplacementPolicy.FIFO}>FIFO</SelectItem>
                      <SelectItem value={CacheReplacementPolicy.RANDOM}>RANDOM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">L2 Cache</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="l2-size">Size (bytes)</Label>
                  <Input 
                    id="l2-size" 
                    type="number" 
                    min="1024" 
                    max="16384" 
                    step="1024"
                    value={localConfig.l2CacheConfig.sizeBytes}
                    onChange={(e) => updateCacheConfig('l2CacheConfig', { sizeBytes: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="l2-block">Block Size (bytes)</Label>
                  <Input 
                    id="l2-block" 
                    type="number" 
                    min="16" 
                    max="256" 
                    step="16"
                    value={localConfig.l2CacheConfig.blockSizeBytes}
                    onChange={(e) => updateCacheConfig('l2CacheConfig', { blockSizeBytes: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="l2-assoc">Associativity</Label>
                  <Input 
                    id="l2-assoc" 
                    type="number" 
                    min="1" 
                    max="16" 
                    step="1"
                    value={localConfig.l2CacheConfig.associativity}
                    onChange={(e) => updateCacheConfig('l2CacheConfig', { associativity: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="l2-latency">Latency (cycles)</Label>
                  <Input 
                    id="l2-latency" 
                    type="number" 
                    min="2" 
                    max="20" 
                    step="1"
                    value={localConfig.l2CacheConfig.accessLatency}
                    onChange={(e) => updateCacheConfig('l2CacheConfig', { accessLatency: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="grid gap-1 col-span-2">
                  <Label htmlFor="l2-policy">Replacement Policy</Label>
                  <Select 
                    value={localConfig.l2CacheConfig.replacementPolicy} 
                    onValueChange={(value) => updateCacheConfig('l2CacheConfig', { replacementPolicy: value as CacheReplacementPolicy })}
                  >
                    <SelectTrigger id="l2-policy">
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CacheReplacementPolicy.LRU}>LRU</SelectItem>
                      <SelectItem value={CacheReplacementPolicy.FIFO}>FIFO</SelectItem>
                      <SelectItem value={CacheReplacementPolicy.RANDOM}>RANDOM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="pipeline" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="forwarding"
                checked={localConfig.forwardingEnabled}
                onCheckedChange={(checked) => updateConfig({ forwardingEnabled: checked })}
              />
              <Label htmlFor="forwarding" className="font-medium">Enable Data Forwarding</Label>
            </div>
            
            <div className="space-y-4 mt-4">
              <h3 className="text-md font-medium">Instruction Latencies (cycles)</h3>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="grid gap-1">
                  <Label htmlFor="lat-add">ADD</Label>
                  <Input 
                    id="lat-add" 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={getLatency(Operation.ADD)}
                    onChange={(e) => updateInstructionLatency(Operation.ADD, parseInt(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="lat-sub">SUB</Label>
                  <Input 
                    id="lat-sub" 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={getLatency(Operation.SUB)}
                    onChange={(e) => updateInstructionLatency(Operation.SUB, parseInt(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="lat-addi">ADDI</Label>
                  <Input 
                    id="lat-addi" 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={getLatency(Operation.ADDI)}
                    onChange={(e) => updateInstructionLatency(Operation.ADDI, parseInt(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="lat-lw">LW</Label>
                  <Input 
                    id="lat-lw" 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={getLatency(Operation.LW)}
                    onChange={(e) => updateInstructionLatency(Operation.LW, parseInt(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="lat-sw">SW</Label>
                  <Input 
                    id="lat-sw" 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={getLatency(Operation.SW)}
                    onChange={(e) => updateInstructionLatency(Operation.SW, parseInt(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="lat-bne">BNE</Label>
                  <Input 
                    id="lat-bne" 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={getLatency(Operation.BNE)}
                    onChange={(e) => updateInstructionLatency(Operation.BNE, parseInt(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="lat-jal">JAL</Label>
                  <Input 
                    id="lat-jal" 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={getLatency(Operation.JAL)}
                    onChange={(e) => updateInstructionLatency(Operation.JAL, parseInt(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="lat-sync">SYNC</Label>
                  <Input 
                    id="lat-sync" 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={getLatency(Operation.SYNC)}
                    onChange={(e) => updateInstructionLatency(Operation.SYNC, parseInt(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="lat-lw-spm">LW_SPM</Label>
                  <Input 
                    id="lat-lw-spm" 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={getLatency(Operation.LW_SPM)}
                    onChange={(e) => updateInstructionLatency(Operation.LW_SPM, parseInt(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="lat-sw-spm">SW_SPM</Label>
                  <Input 
                    id="lat-sw-spm" 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={getLatency(Operation.SW_SPM)}
                    onChange={(e) => updateInstructionLatency(Operation.SW_SPM, parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {(onSaveConfig || onLoadConfig) && (
          <div className="flex gap-2 mt-4">
            {onSaveConfig && (
              <Button variant="outline" size="sm" onClick={onSaveConfig}>
                Save Configuration
              </Button>
            )}
            {onLoadConfig && (
              <Button variant="outline" size="sm" onClick={onLoadConfig}>
                Load Configuration
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

