import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pag.tsx'; // Import your HomePage component
import Navigation from './Navigation.js'; // Component with navigation links

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Homepage route */}
        <Route path="/navigation" element={<Navigation />} /> {/* Other route */}
        <Route path="/register" element={<page/>} /> 
      </Routes>
    </Router>
  );
}

export default App;
