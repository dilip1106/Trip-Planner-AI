import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Plan from './pages/Plan';
import Collaborator from './pages/Collaborator';
import Layout from './layout/Plan';
import PlanPage from './pages/Plan'; 
import Home from './pages/Home'; 
import Dashboard from './components/dashboard/Dashboard';
import { QueryClient, QueryClientProvider } from 'react-query';
import Join from './pages/JoinPlan';
import Settings from './pages/Settings';
import ExpenseTracker from './pages/ExpenseTracker';
import PrivatePlan from "./pages/PrivatePlan";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="dashboard/:token" element={<Join />} />
          {/* <Route path="/" element={<Plan />} /> */}
          {/* Layout wrapper for specific routes */}
          <Route
            path="/plan/:planId/community-plan"
            element={
              // <Layout>
                <Plan />
              // </Layout>
            }
          />
          <Route
            path="/plan/:planId/plan"
            element={
              // <Layout>
                <PrivatePlan />
              // </Layout>
            }
          />
          <Route
            path="/plan/:planId/plan/expense-tracker"
            element={
              // <Layout>
                <ExpenseTracker />
              // </Layout>
            }
          />
          <Route path="/plan/:planId/plan/collaborate" element={
            // <Layout>
                <Collaborator />
              // </Layout>
            } />   
              <Route path="/plan/:planId/plan/settings" element={
                // <Layout>
                <Settings />
              // </Layout>
            } />     
        </Routes>
        
        
      </Router>
    </QueryClientProvider>
  )
}