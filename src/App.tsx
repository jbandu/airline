import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Domains } from './pages/Domains';
import { Workflows } from './pages/Workflows';
import { WorkflowCreate } from './pages/WorkflowCreate';
import { WorkflowEdit } from './pages/WorkflowEdit';
import { WorkflowDetail } from './pages/WorkflowDetail';
import { Analytics } from './pages/Analytics';
import { AgentNetwork } from './pages/AgentNetwork';
import { Stakeholders } from './pages/Stakeholders';
import { Settings } from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/domains"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Domains />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflows"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Workflows />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflows/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <WorkflowCreate />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflows/:id/edit"
              element={
                <ProtectedRoute>
                  <Layout>
                    <WorkflowEdit />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflows/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <WorkflowDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agents"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AgentNetwork />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/stakeholders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Stakeholders />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
