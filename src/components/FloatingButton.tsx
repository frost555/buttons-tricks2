import React from 'react';
import { ArrowUp } from 'lucide-react';

export const FloatingButton = () => {
  return (
    <div className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-green-500 text-white p-4 rounded-full shadow-lg z-50">
      <ArrowUp size={24} />
    </div>
  );
};