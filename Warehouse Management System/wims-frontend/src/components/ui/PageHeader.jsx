import React from "react";

const PageHeader = ({ icon: Icon, title, description, role }) => (
  <div className="flex items-start justify-between p-4 bg-white shadow-lg rounded-xl mb-6 border-b-4 border-indigo-500">
    <div className="flex items-center">
      <div className="p-3 mr-4 bg-indigo-100 rounded-full text-indigo-600">
        <Icon size={24} />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <div className="px-3 py-1 text-xs font-medium text-white bg-indigo-500 rounded-full shadow-md self-center">
      Role: {role}
    </div>
  </div>
);

export default PageHeader;