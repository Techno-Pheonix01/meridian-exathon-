import { Routes, Route, Navigate } from "react-router-dom"; import { useAuth } from "./context/AuthContext";
import EmployeeLayout from "./layouts/EmployeeLayout"; import ManagerLayout from "./layouts/ManagerLayout"; import FinanceLayout from "./layouts/FinanceLayout"; import AdminLayout from "./layouts/AdminLayout";
import EmployeeDashboard from "./pages/EmployeeDashboard"; import ManagerDashboard from "./pages/ManagerDashboard"; import FinanceDashboard from "./pages/FinanceDashboard"; import AdminDashboard from "./pages/AdminDashboard"; import Login from "./pages/Login"; import Lists from "./pages/Lists";
import TravelRequest from "./pages/TravelRequest"; import TravelDetails from "./pages/TravelDetails"; import ExpenseClaim from "./pages/ExpenseClaim"; import ExpenseDetails from "./pages/ExpenseDetails";
import Landing from "./pages/Landing"; import OAuthCallback from "./pages/OAuthCallback"; import Reports from "./pages/Reports"; import Notifications from "./pages/Notifications"; import Admin from "./pages/Admin";
const Guard = ({ roles, children }) => { const { user, loading } = useAuth(); if (loading) return <div className="p-10">Loading Meridian…</div>;
  if (!user) return <Navigate to="/login" replace />; if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />; return children; };
const Home = () => { const { user, loading } = useAuth(); if (loading) return null; return user ? <Navigate to="/dashboard" replace /> : <Landing />; };
const LAYOUT = { employee: EmployeeLayout, manager: ManagerLayout, finance: FinanceLayout, admin: AdminLayout };
const DASH = { employee: EmployeeDashboard, manager: ManagerDashboard, finance: FinanceDashboard, admin: AdminDashboard };
const RoleLayout = ({ children }) => { const { user } = useAuth(); const L = LAYOUT[user.role]; return <L>{children}</L>; };
const RoleDash = () => { const { user } = useAuth(); const D = DASH[user.role]; return <D />; };
const P = (roles, el) => <Guard roles={roles}><RoleLayout>{el}</RoleLayout></Guard>;
export default function App() { return (<Routes>
  <Route path="/login" element={<Login />} /><Route path="/oauth/callback" element={<OAuthCallback />} /><Route path="/" element={<Home />} />
  <Route path="/dashboard" element={P(null, <RoleDash />)} />
  <Route path="/travel" element={P(null, <Lists kind="travel" />)} />
  <Route path="/travel/new" element={P(["employee"], <TravelRequest />)} />
  <Route path="/travel/:id/edit" element={P(["employee"], <TravelRequest />)} />
  <Route path="/travel/:id" element={P(null, <TravelDetails />)} />
  <Route path="/claims" element={P(null, <Lists kind="claims" />)} />
  <Route path="/claims/new" element={P(["employee"], <ExpenseClaim />)} />
  <Route path="/claims/:id" element={P(null, <ExpenseDetails />)} />
  <Route path="/reports" element={P(["manager", "finance", "admin"], <Reports />)} />
  <Route path="/notifications" element={P(null, <Notifications />)} />
  <Route path="/users" element={P(["admin"], <Admin tab="users" />)} />
  <Route path="/policies" element={P(["admin"], <Admin tab="policies" />)} />
  <Route path="*" element={<Navigate to="/" />} /></Routes>); }
