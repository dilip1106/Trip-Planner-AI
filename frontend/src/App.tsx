import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Plan from './pages/Plan';
import Collaborator from './pages/Collaborator';
import Home from './pages/Home'; 
import Dashboard from './components/dashboard/Dashboard';
import { QueryClient, QueryClientProvider } from 'react-query';
import Join from './pages/JoinPlan';
import Settings from './pages/Settings';
import ExpenseTracker from './pages/ExpenseTracker';
import PrivatePlan from "./pages/PrivatePlan";
import ProtectedRoute from './components/auth/ProtectedRoute';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="dashboard/:token" element={<Join />} />
          
          {/* Protected Routes */}
          <Route
            path="/plan/:planId/plan/expense-tracker"
            element={
              <ProtectedRoute>
                <ExpenseTracker />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/plan/:planId/plan/collaborate"
            element={
              <ProtectedRoute>
                <Collaborator />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/plan/:planId/plan/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          
          {/* Other routes remain the same */}
          <Route path="/plan/:planId/community-plan" element={<Plan />} />
          <Route path="/plan/:planId/plan" element={<PrivatePlan />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}