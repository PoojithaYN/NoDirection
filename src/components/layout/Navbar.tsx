import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Cpu } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <Cpu className="h-6 w-6" />
          <span className="font-bold">RISC-V Simulator</span>
        </Link>
        
        <nav className="ml-auto flex items-center space-x-4">
          <Link href="/">
            <Button 
              variant={location === "/" ? "default" : "ghost"}
              className="text-sm font-medium"
            >
              Home
            </Button>
          </Link>
          
          <Link href="/simulator">
            <Button 
              variant={location === "/simulator" ? "default" : "ghost"}
              className="text-sm font-medium"
            >
              Simulator
            </Button>
          </Link>
          
          <Link href="/docs">
            <Button 
              variant={location === "/docs" ? "default" : "ghost"}
              className="text-sm font-medium"
            >
              Documentation
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

