import React from 'react';

export default function PlaceholderPage({ title, message, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center space-y-4">
      <div className="bg-gray-50 p-6 rounded-full border border-gray-100 mb-4">
        <Icon size={48} className="text-gray-400" />
      </div>
      <h1 className="text-2xl font-bold text-textPrimary">{title}</h1>
      <p className="text-textSecondary max-w-md">{message}</p>
    </div>
  );
}
