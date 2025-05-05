
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { FileText as NoteIcon, Menu, Settings, History } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold tracking-tight">YouGen</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" className={navigationMenuTriggerStyle()}>
                  Home
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/notes" className={navigationMenuTriggerStyle()}>
                  <NoteIcon className="h-4 w-4 mr-2" />
                  Notes
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/history" className={navigationMenuTriggerStyle()}>
                  <History className="h-4 w-4 mr-2" />
                  History
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <Link to="/" className="flex items-center space-x-2 mb-8">
              <span className="text-xl font-bold tracking-tight">YouGen</span>
            </Link>
            <nav className="flex flex-col gap-4">
              <Link 
                to="/" 
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/notes" 
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <NoteIcon className="h-4 w-4 mr-2" />
                Notes
              </Link>
              <Link 
                to="/history" 
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        </div>
      </div>
    </header>
  );
}
