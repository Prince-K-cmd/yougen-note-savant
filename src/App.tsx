
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VideoView from "./pages/VideoView";
import PlaylistView from "./pages/PlaylistView";
import NotesView from "./pages/NotesView";
import HistoryView from "./pages/HistoryView";
import NotFound from "./pages/NotFound";
import { InitApp } from "@/components/layout/InitApp";
import "./AppStyles.css";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <InitApp />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/video/:id" element={<VideoView />} />
            <Route path="/playlist/:id" element={<PlaylistView />} />
            <Route path="/notes" element={<NotesView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
