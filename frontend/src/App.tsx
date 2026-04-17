import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import Scanner from "./pages/Scanner.tsx";
import History from "./pages/History.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Monitoring from "./pages/Monitoring.tsx";
import ApiDocs from "./pages/ApiDocs.tsx";
import Documentation from "./pages/Documentation.tsx";
import LoginPage from "./pages/Login.tsx";
import SignupPage from "./pages/Signup.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ScanProvider } from "@/context/ScanContext";
import { LanguageProvider } from "@/context/LanguageContext";
import FreeChatbot from "@/components/FreeChatbot";
import Report from "./pages/Report.tsx";
import Pricing from "./pages/Pricing.tsx";
import { Loader2 } from "lucide-react";

// Admin Imports
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/Overview";
import AdminLive from "./pages/admin/LiveFeed";
import AdminUsers from "./pages/admin/Users";
import AdminMessages from "./pages/admin/Messages";
import AdminVulns from "./pages/admin/VulnerabilityIntel";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";


const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
  
  if (!user || user.isAnonymous) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/auth" element={<Navigate to="/login" replace />} />
      
      <Route path="/scan" element={<Scanner />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route 
        path="/history" 
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/monitoring" 
        element={
          <ProtectedRoute>
            <Monitoring />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/api-docs" 
        element={
          <ProtectedRoute>
            <ApiDocs />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/report/:scanId" 
        element={<Report />} 
      />
      <Route 
        path="/docs" 
        element={<Documentation />} 
      />
      <Route 
        path="/documentation" 
        element={<Documentation />} 
      />
      
      {/* 🛡️ ADMIN DASHBOARD (SECURE) */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="live" element={<AdminLive />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="vulnerabilities" element={<AdminVulns />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

import PWAInstallBanner from './components/PWAInstallBanner';
import { Navbar } from './components/Navbar';


const AppContent = () => {
  return (
    <>
      <Toaster />
      <Sonner position="top-center" richColors />
      <BrowserRouter>
        <Navbar />
        <AppRoutes />
        <PWAInstallBanner />
      </BrowserRouter>
      {/* Floating chatbot with context from latest scan */}
      <FreeChatbot />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <ScanProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </ScanProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
