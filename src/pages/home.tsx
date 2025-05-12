import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Cpu, BookOpen, BarChart2 } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                RISC-V Multi-Core Simulator
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                A comprehensive RISC-V simulation environment with support for multiple cores, 
                pipelining, caches, and advanced memory hierarchies.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/simulator">
                <Button className="px-8 py-6 text-lg">Launch Simulator</Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" className="px-8 py-6 text-lg">View Documentation</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Cpu className="w-10 h-10 mb-2 text-primary" />
              <CardTitle>Four-Core Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Simulate four RISC-V cores with shared memory access and independent execution contexts.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Code className="w-10 h-10 mb-2 text-primary" />
              <CardTitle>RISC-V Instruction Set</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Support for essential RISC-V instructions including ADD/SUB, BNE, JAL, LW/SW, and custom extensions.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <BarChart2 className="w-10 h-10 mb-2 text-primary" />
              <CardTitle>Pipeline Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Visualize the 5-stage pipeline with data forwarding, hazard detection, and performance monitoring.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <BookOpen className="w-10 h-10 mb-2 text-primary" />
              <CardTitle>Memory Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Complete memory system with L1 instruction/data caches, L2 unified cache, and scratchpad memory.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-gray-900 rounded-lg my-12 p-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">Educational Tool</h2>
              <p className="mb-4">
                This simulator is designed as an educational tool to help students understand computer architecture concepts
                including multiple cores, pipelines, memory hierarchies, and cache designs.
              </p>
              <p>
                Visualize execution, track performance metrics, and experiment with different configurations
                to deepen your understanding of computer architecture.
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h3 className="font-bold mb-2">Supported Concepts:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Multi-core processing</li>
                  <li>Five-stage pipelining</li>
                  <li>Data hazards and forwarding</li>
                  <li>Memory hierarchies and caches</li>
                  <li>Scratchpad memory</li>
                  <li>Core synchronization</li>
                  <li>Performance metrics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Ready to Start?</h2>
          <p className="max-w-2xl mx-auto mb-8">
            Launch the simulator to experiment with RISC-V code execution across multiple cores.
            Configure memory hierarchies, analyze performance, and visualize the pipeline in action.
          </p>
          <Link href="/simulator">
            <Button size="lg">Go to Simulator</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

