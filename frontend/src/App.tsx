
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import BoardNew from "./pages/BoardNew";
import BoardDetail from "./pages/BoardDetail";
import BoardEdit from "./pages/BoardEdit";
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";
import CodeManagement from "./pages/CodeManagement";
import TaskManagement from "./pages/TaskManagement";
import ProjectManagement from "./pages/ProjectManagement";
import ProjectCreate from "./pages/ProjectCreate";
import PrivacyConsent from "./pages/PrivacyConsent";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/board" element={
              <ProtectedRoute>
                <Layout>
                  <Board />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/board/new" element={
              <ProtectedRoute>
                <Layout>
                  <BoardNew />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/board/:id" element={
              <ProtectedRoute>
                <Layout>
                  <BoardDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/board/edit/:id" element={
              <ProtectedRoute>
                <Layout>
                  <BoardEdit />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <Layout>
                  <ProjectManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/projects/create" element={
              <ProtectedRoute>
                <Layout>
                  <ProjectCreate />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Layout>
                  <Calendar />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/code" element={
              <ProtectedRoute>
                <Layout>
                  <CodeManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <Layout>
                  <TaskManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/privacy-consent" element={<PrivacyConsent />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;