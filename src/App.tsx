import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ManageLinks from "./pages/ManageLinks";
import Statistics from "./pages/Statistics";
import Withdraw from "./pages/Withdraw";
import Referrals from "./pages/Referrals";
import Invoices from "./pages/Invoices";
import { ProfileSettings, ChangePassword } from "./pages/SettingsPages";
import Plans from "./pages/Plans";
import DevelopersAPI from "./pages/DevelopersAPI";
import Support, { EarnNow, QuickLink } from "./pages/MiscPages";
import RedirectFlow from "./pages/RedirectFlow";
import DashboardLayout from "./components/DashboardLayout";
import AdminLayout from "./components/AdminLayout";
import { RequireAuth } from "./components/RequireAuth";
import { GlobalAdScripts } from "./components/AdSlot";
import {
  AdminOverview, AdminUsers, AdminLinks, AdminWithdrawals, AdminAds, AdminSettings,
} from "./pages/AdminPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GlobalAdScripts />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/s/:code" element={<RedirectFlow />} />

          <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/earn" element={<EarnNow />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/links" element={<ManageLinks />} />
            <Route path="/links/new" element={<Navigate to="/dashboard" replace />} />
            <Route path="/links/hidden" element={<ManageLinks hidden />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/tools/api" element={<DevelopersAPI />} />
            <Route path="/tools/quick" element={<QuickLink />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
            <Route path="/settings/profile" element={<ProfileSettings />} />
            <Route path="/settings/password" element={<ChangePassword />} />
            <Route path="/support" element={<Support />} />
            <Route path="/plans" element={<Plans />} />
          </Route>

          <Route element={<RequireAuth admin><AdminLayout /></RequireAuth>}>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/links" element={<AdminLinks />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
            <Route path="/admin/ads" element={<AdminAds />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
