import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import Wallet from "./pages/Wallet";
import Referrals from "./pages/Referrals";
import SpinWin from "./pages/SpinWin";
import VIP from "./pages/VIP";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminSettings from "./pages/admin/AdminSettings";
import BusinessDashboard from "./pages/business/BusinessDashboard";
import BusinessTasks from "./pages/business/BusinessTasks";
import BusinessCreateTask from "./pages/business/BusinessCreateTask";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path={"/"} component={Home} />
      
      {/* User routes */}
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/tasks"} component={Tasks} />
      <Route path={"/tasks/:id"} component={TaskDetail} />
      <Route path={"/wallet"} component={Wallet} />
      <Route path={"/referrals"} component={Referrals} />
      <Route path={"/spin"} component={SpinWin} />
      <Route path={"/vip"} component={VIP} />
      <Route path={"/profile"} component={Profile} />
      
      {/* Admin routes */}
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/users"} component={AdminUsers} />
      <Route path={"/admin/tasks"} component={AdminTasks} />
      <Route path={"/admin/withdrawals"} component={AdminWithdrawals} />
      <Route path={"/admin/settings"} component={AdminSettings} />
      
      {/* Business routes */}
      <Route path={"/business"} component={BusinessDashboard} />
      <Route path={"/business/tasks"} component={BusinessTasks} />
      <Route path={"/business/tasks/create"} component={BusinessCreateTask} />
      
      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
