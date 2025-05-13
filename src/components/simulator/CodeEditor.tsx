import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { examples } from "./examples";

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onLoadExample: (code: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({ 
  code, 
  onCodeChange, 
  onLoadExample,
  readOnly = false 
}: CodeEditorProps) {
  const [selectedExample, setSelectedExample] = useState("");
  
  const handleExampleChange = (value: string) => {
    setSelectedExample(value);
    const example = examples.find(ex => ex.id === value);
    if (example) {
      onLoadExample(example.code);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">RISC-V Assembly Code</CardTitle>
          <Select value={selectedExample} onValueChange={handleExampleChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Load Example" />
            </SelectTrigger>
            <SelectContent>
              {examples.map(example => (
                <SelectItem key={example.id} value={example.id}>
                  {example.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <Textarea
          className="font-mono h-full resize-none"
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="Enter RISC-V assembly code here..."
          readOnly={readOnly}
        />
      </CardContent>
      <CardFooter className="pt-2 text-xs text-muted-foreground italic">
        Supports: ADD/SUB, BNE, JAL, LW/SW, SYNC, LW_SPM/SW_SPM instructions
      </CardFooter>
    </Card>
  );
}

