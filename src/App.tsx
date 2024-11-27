import React from 'react';
import { FixedElements } from './components/FixedElements';
import { ScrollContent } from './components/ScrollContent';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <FixedElements />
      <ScrollContent />
    </div>
  );
}

export default App;