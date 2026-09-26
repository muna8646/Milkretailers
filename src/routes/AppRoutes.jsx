import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import AdminDashboard from "../pages/admin/Dashboard";
import Retailers from "../pages/admin/Retailers";
import CreateRetailer from "../pages/admin/CreateRetailer";
import RetailerDetails from "../pages/admin/RetailerDetails";
import Payments from "../pages/admin/Payments";
import Reports from "../pages/admin/Reports";
import RetailerDashboard from "../pages/retailer/Dashboard";
import RetailerFarmers from "../pages/retailer/Farmers";
import RetailerMilkCollection from "../pages/retailer/MilkCollection";
import RetailerPayments from "../pages/retailer/Payments";
import RetailerReports from "../pages/retailer/Reports";
import RetailerSettings from "../pages/retailer/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/retailers" element={<Retailers />} />
      <Route path="/admin/retailers/new" element={<CreateRetailer />} />
      <Route path="/admin/retailers/:id" element={<RetailerDetails />} />
      <Route path="/admin/payments" element={<Payments />} />
      <Route path="/admin/reports" element={<Reports />} />

      <Route path="/retailer" element={<RetailerDashboard />} />
      <Route path="/retailer/dashboard" element={<RetailerDashboard />} />
      <Route path="/retailer/farmers" element={<RetailerFarmers />} />
      <Route path="/retailer/collections" element={<RetailerMilkCollection />} />
      <Route path="/retailer/payments" element={<RetailerPayments />} />
      <Route path="/retailer/reports" element={<RetailerReports />} />
      <Route path="/retailer/settings" element={<RetailerSettings />} />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}