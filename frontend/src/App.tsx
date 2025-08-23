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
import PasswordReset from "./pages/PasswordReset";
import Board from "./pages/Board";
import BoardNew from "./pages/BoardNew";
import BoardDetail from "./pages/BoardDetail";
import BoardEdit from "./pages/BoardEdit";
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";
import ProjectManagement from "./pages/ProjectManagement";
import ProjectCreate from "./pages/ProjectCreate";
import Swagger from "./pages/Swagger";
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
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route
              path="/board"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Board />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* 문서 작성 페이지: 헤더/푸터 숨김 */}
            <Route
              path="/board/new"
              element={
                <ProtectedRoute>
                  <BoardNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/board/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <BoardDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* 문서 수정 페이지: 헤더/푸터 숨김 */}
            <Route
              path="/board/edit/:id"
              element={
                <ProtectedRoute>
                  <BoardEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* 프로젝트 생성 페이지: 헤더/푸터 숨김 */}
            <Route
              path="/projects/create"
              element={
                <ProtectedRoute>
                  <ProjectCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/create/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Calendar />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/swagger"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Swagger />
                  </Layout>
                </ProtectedRoute>
              }
            />
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