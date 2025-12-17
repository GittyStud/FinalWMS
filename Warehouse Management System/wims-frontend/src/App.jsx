// src/App.jsx
import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import InventoryManagementPage from "./pages/InventoryManagementPage";
import AdminUserManagementPage from "./pages/AdminUserManagementPage";
import ReportsAndAnalyticsPage from "./pages/ReportsAndAnalyticsPage";

// --- ICON COMPONENTS (Re-use lucide-react names for consistency) ---
import { LogIn, Package, Users, BarChart2, Menu, X } from "lucide-react";

// --- LAYOUT COMPONENTS (Header, Sidebar) ---

const Header = ({ user, handleLogout, toggleSidebar }) => (
  <header className="flex items-center justify-between p-4 bg-white shadow-md border-b border-gray-100 md:hidden">
    <button
      onClick={toggleSidebar}
      className="text-gray-500 hover:text-indigo-600"
    >
      <Menu className="w-6 h-6" />
    </button>
    <h1 className="text-xl font-bold text-gray-800">WMS</h1>
    <button
      onClick={handleLogout}
      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
    >
      <LogIn className="w-4 h-4 transform rotate-180" />
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
      id: "inventory",
      label: "Inventory Management",
      icon: Package,
      roles: ["Admin", "Manager", "Staff"],
    },
    {
      id: "reports",
      label: "Reports & Audit",
      icon: BarChart2,
      roles: ["Admin", "Manager"],
    },
    { id: "users", label: "User Management", icon: Users, roles: ["Admin"] },
  ];

  const isAuthorized = (item) => item.roles.includes(user.role);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 md:hidden"
          onClick={() => toggleSidebar(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition duration-300 ease-in-out z-50 w-64 bg-gray-800 flex flex-col shadow-2xl`}
      >
        {/* Logo and Close Button */}
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            WMS Panel
          </h2>
          <button
            onClick={() => toggleSidebar(false)}
            className="text-gray-400 hover:text-white md:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow p-4 space-y-2">
          {navItems.map((item) => {
            const auth = isAuthorized(item);
            const activeClass =
              item.id === currentView
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-gray-300 hover:bg-gray-700 hover:text-white";
            const disabledClass = auth ? "" : "opacity-50 cursor-not-allowed";

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (auth) {
                    setView(item.id);
                    toggleSidebar(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition duration-150 ${activeClass} ${disabledClass}`}
                disabled={!auth}
                aria-current={item.id === currentView ? "page" : undefined}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Info and Logout */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Logged in as:{" "}
            <span className="font-semibold text-white">{user.username}</span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Role: <span className="font-semibold capitalize">{user.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition duration-150 ease-in-out shadow-md"
          >
            <LogIn className="w-4 h-4 transform rotate-180" /> Logout
          </button>
        </div>
      </div>
    </>
  );
};

const UnauthorizedView = () => (
  <div className="p-8 bg-red-100 border-2 border-red-300 rounded-xl shadow-lg">
    <h2 className="text-2xl font-bold text-red-800">Access Denied</h2>
    <p className="mt-2 text-red-700">
      You do not have the required permissions to view this page. Please contact
      an administrator.
    </p>
  </div>
);

// --- DASHBOARD CONTAINER COMPONENT (The App's main content wrapper) ---
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState("inventory");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = (forceClose = null) => {
    setIsSidebarOpen((v) => (forceClose !== null ? forceClose : !v));
  };

  const renderContent = () => {
    switch (currentView) {
      case "inventory":
        return <InventoryManagementPage />; // Use the imported component
      case "users":
        if (user.role === "Admin") {
          return <AdminUserManagementPage />;
        }
        return <UnauthorizedView />;
      case "reports":
        if (["Admin", "Manager"].includes(user.role)) {
          return <ReportsAndAnalyticsPage />;
        }
        return <UnauthorizedView />;
      default:
        return <InventoryManagementPage />;
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      <Sidebar
        user={user}
        currentView={currentView}
        setView={setCurrentView}
        handleLogout={logout}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          handleLogout={logout}
          toggleSidebar={() => toggleSidebar(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-600 font-semibold">
        Loading Application...
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  } else {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <LoginPage />
      </div>
    );
  }
};

export default App;
