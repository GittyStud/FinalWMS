import React from "react";

const PageHeader = ({ icon: Icon, title, description, user, children }) => {
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white shadow-sm rounded-xl mb-6 border-l-4 border-indigo-500 gap-4">
      <div className="flex items-center">
        {Icon && (
          <div className="p-3 mr-4 bg-indigo-50 rounded-full text-indigo-600">
            <Icon size={24} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 self-start md:self-center">
        {/* User Info Badge */}
        {user && (
          <div className="text-right hidden md:block">
            <div className="text-sm font-bold text-gray-800">{displayName}</div>
            <div className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
              {user.role}
            </div>
          </div>
        )}

        {/* Action Buttons (e.g. Add Product) */}
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
