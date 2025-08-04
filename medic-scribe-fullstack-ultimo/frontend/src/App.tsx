
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SOAPNotesProvider } from "@/contexts/SOAPNotesContext";
import { PageTransition } from "@/components/PageTransition";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Profile } from "./pages/Profile";
import { Templates } from "./pages/Templates";

const queryClient = new QueryClient();


const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Add error boundary for PWA context
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('PWA Runtime Error:', event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SOAPNotesProvider>
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
            <BrowserRouter>
              <Routes>
              <Route path="/" element={
                <PageTransition>
                  <Index theme={theme} onToggleTheme={toggleTheme} />
                </PageTransition>
              } />
              <Route path="/profile" element={
                <PageTransition>
                  <Profile theme={theme} onToggleTheme={toggleTheme} onBack={() => window.history.back()} />
                </PageTransition>
              } />
              <Route path="/templates" element={
                <PageTransition>
                  <Templates theme={theme} onToggleTheme={toggleTheme} onBack={() => window.history.back()} />
                </PageTransition>
              } />
              <Route path="*" element={
                <PageTransition>
                  <NotFound />
                </PageTransition>
              } />
              </Routes>
            </BrowserRouter>
          </SOAPNotesProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
