import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UIThemeProvider } from './contexts/UIThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Domains } from './pages/Domains';
import { Subdomains } from './pages/Subdomains';
import { Workflows } from './pages/Workflows';
import { WorkflowCreate } from './pages/WorkflowCreate';
import { WorkflowEdit } from './pages/WorkflowEdit';
import { WorkflowDetail } from './pages/WorkflowDetail';
import { AgentNetwork } from './pages/AgentNetwork';
import { KnowledgeGraphPage } from './pages/KnowledgeGraphPage';
import { OntologyTree } from './pages/OntologyTree';
import { CrossDomainBridges } from './pages/CrossDomainBridges';
import { SemanticMatrixPage } from './pages/SemanticMatrixPage';
import { Stakeholders } from './pages/Stakeholders';
import { Settings } from './pages/Settings';
import { DebugDashboard } from './pages/DebugDashboard';
import { DataEntities } from './pages/DataEntities';
import { DataFlows } from './pages/DataFlows';
import { DataArchitectureLayers } from './pages/DataArchitectureLayers';
import { DataLineage } from './pages/DataLineage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UIThemeProvider>
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
              path="/subdomains"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Subdomains />
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
              path="/knowledge-graph"
              element={
                <ProtectedRoute>
                  <Layout>
                    <KnowledgeGraphPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ontology"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OntologyTree />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bridges"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CrossDomainBridges />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/semantic-matrix"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SemanticMatrixPage />
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
            <Route
              path="/debug"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DebugDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/data/entities"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DataEntities />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/data/flows"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DataFlows />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/data/architecture"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DataArchitectureLayers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/data/lineage"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DataLineage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </UIThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
