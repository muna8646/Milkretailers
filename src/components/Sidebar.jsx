import {
  LayoutDashboard,
  Store,
  Users,
  Milk,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ownerMenu = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Retailers",
    path: "/admin/retailers",
    icon: Store,
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: BarChart3,
  },
];

const retailerMenu = [
  {
    label: "Dashboard",
    path: "/retailer/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Farmers",
    path: "/retailer/farmers",
    icon: Users,
  },
  {
    label: "Milk Collection",
    path: "/retailer/collections",
    icon: Milk,
  },
  {
    label: "Weekly Payments",
    path: "/retailer/payments",
    icon: CreditCard,
  },
  {
    label: "Reports",
    path: "/retailer/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    path: "/retailer/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.role === "OWNER";
  const menu = isOwner ? ownerMenu : retailerMenu;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">🥛</div>

        <div>
          <strong>MilkCollect</strong>
          <span>{isOwner ? "Owner" : "Retailer"}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} />

              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="avatar">{user?.name?.charAt(0) || "O"}</div>

          <div>
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={19} />
          Sign out
        </button>
      </div>
    </aside>
  );
}