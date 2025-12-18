># WMS project - Warehouse Management System

WMS Central is a high-performance, responsive web application designed to streamline inventory operations, manage warehouse staff, and provide actionable analytics for supply chain management.

## Features

  📦 Inventory Management

    Full CRUD Operations: Add, edit, and remove products with ease.

    Stock Tracking: Monitor quantities, unit costs, and warehouse locations.

    Location Mapping: Organize items across Aisles, Cold Storage, and Zones.

    Expiration Tracking: Integrated date management for perishable goods.

  🔐 Security & Roles

    Role-Based Access Control (RBAC):

    Admin: Full system control, user management, and report access.

    Manager: Inventory control and reporting.

    Staff: Viewing and updating stock levels.

    JWT Authentication: Secure login and persistent sessions.

  📊 Analytics & Alerts

    Dashboard: High-level overview of total stock and active alerts.

    Low Stock Alerts: Automated visual cues when items fall below reorder points.

    Movement Logs: Audit trail of every stock change (who moved what and when).

  🛠️ Tech Stack

    Frontend: React 19, Vite, Tailwind CSS

    Icons: Lucide React

    State Management: React Context API (Auth Hooks)

    API Client: Axios with Interceptors

    Backend (Required): Node.js/Express API (connected via baseURL in useAuth.jsx)
    
  📦 Installation & Setup

   Clone the repository:

    git clone [https://github.com/YOUR_USERNAME/warehouse-management.git](https://github.com/YOUR_USERNAME/warehouse-management.git)

    Install dependencies:

      cd warehouse management system/wims-backend
      npm install
      run: npm start
      
      cd warehouse management system/wims-frontend
      npm install
      npm run dev

    Import database:
      wims_database.sql

Configure the API:
Ensure your backend server is running. Update the baseURL in src/hooks/useAuth.jsx if your server uses a port other than 3001.

Start the development server:

npm run dev


📂 Project Structure

    /src/components: Reusable UI components (Modals, Buttons, Headers).

    /src/hooks: Custom React hooks (Authentication and API wrappers).

    /src/pages: Main view components (Inventory, Admin, Reports).

    /src/assets: Static assets and global styles.

📝 License

Distributed under the MIT License. See LICENSE for more information.

Built with ❤️ and stress by [Khim & Hafsah]
