import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Plan from './pages/Plan';
import Layout from './layout/Plan';
import PlanPage from './pages/Plan'; 
import Home from './pages/Home'; 
import Dashboard from './components/dashboard/Dashboard';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/" element={<Plan />} /> */}
          {/* Layout wrapper for specific routes */}
          <Route
            path="/plan/:planId"
            element={
              <Layout>
                <Plan />
              </Layout>
            }
          />      
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}