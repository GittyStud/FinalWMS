import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import InventoryManagementPage from "./pages/InventoryManagementPage";
import AdminUserManagementPage from "./pages/AdminUserManagementPage";
import ReportsAndAnalyticsPage from "./pages/ReportsAndAnalyticsPage";
import DashboardPage from "./pages/DashboardPage";
import UnauthorizedView from "./components/ui/UnauthorizedView";

import {
  LogIn,
  Package,
  Users,
  BarChart2,
  Menu,
  LayoutDashboard,
  X,
} from "lucide-react";

// --- COMPONENTS ---

const NavButton = ({ isActive, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-indigo-600 text-white shadow-md"
        : "text-gray-400 hover:bg-slate-800 hover:text-white"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </button>
);

const Header = ({ user, handleLogout, toggleSidebar }) => (
  <header className="flex items-center justify-between p-4 bg-white shadow-md border-b border-gray-100 md:hidden">
    <div className="flex items-center gap-3">
      <button
        onClick={toggleSidebar}
        className="text-gray-500 hover:text-indigo-600"
      >
        <Menu className="w-6 h-6" />
      </button>
      <div>
        <h1 className="text-lg font-bold text-gray-800 leading-tight">WIMS</h1>
        <p className="text-xs text-gray-500">
          {user?.first_name
            ? `${user.first_name} ${user.last_name}`
            : user?.username}
        </p>
      </div>
    </div>
    <button onClick={handleLogout} className="text-red-600 hover:text-red-800">
      <LogIn className="w-5 h-5" />
    </button>
  </header>
);

const Sidebar = ({
  user,
  currentView,
  setView,
  handleLogout,
  isOpen,
  toggleSidebar,
}) => {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["Admin", "Manager", "Staff"],
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Package,
      roles: ["Admin", "Manager", "Staff"],
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart2,
      roles: ["Admin", "Manager"],
    },
    { id: "users", label: "Users", icon: Users, roles: ["Admin"] },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => toggleSidebar(false)}
        />
      )}
      <aside
        className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-indigo-400">
              WIMS
            </h1>
            <p className="text-xs text-slate-400 mt-1">Inventory System</p>
          </div>
          <button
            onClick={() => toggleSidebar(false)}
            className="md:hidden text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 mb-8">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Logged in as
          </div>
          <div className="font-medium text-gray-200">
            {user.first_name
              ? `${user.first_name} ${user.last_name}`
              : user.username}
          </div>
          <div className="text-sm text-indigo-400 capitalize">{user.role}</div>
        </div>

        <nav className="px-4 space-y-2">
          {navItems.map(
            (item) =>
              item.roles.includes(user?.role) && (
                <NavButton
                  key={item.id}
                  isActive={currentView === item.id}
                  onClick={() => {
                    setView(item.id);
                    toggleSidebar(false);
                  }}
                  icon={item.icon}
                  label={item.label}
                />
              )
          )}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogIn className="w-4 h-4 transform rotate-180" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const App = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return <LoginPage />;

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardPage />;
      case "inventory":
        return <InventoryManagementPage />;
      case "users":
        return user.role === "Admin" ? (
          <AdminUserManagementPage />
        ) : (
          <UnauthorizedView />
        );
      case "reports":
        return ["Admin", "Manager"].includes(user.role) ? (
          <ReportsAndAnalyticsPage />
        ) : (
          <UnauthorizedView />
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        user={user}
        currentView={currentView}
        setView={setCurrentView}
        handleLogout={logout}
        isOpen={isSidebarOpen}
        toggleSidebar={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          handleLogout={logout}
          toggleSidebar={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto bg-gray-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
