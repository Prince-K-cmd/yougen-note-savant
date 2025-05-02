
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Youtube className="h-6 w-6 text-brand-purple" />
          <h1 className="text-xl font-semibold tracking-tight">
            YouGen <span className="text-brand-teal">Note Savant</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm">
            Settings
          </Button>
        </div>
      </div>
    </header>
  );
}
