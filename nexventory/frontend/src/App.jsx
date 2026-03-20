import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { NexventoryProvider } from './context/NexventoryContext';

// Placeholder components until real ones are implemented
const Placeholder = ({ title }) => (
  <div className="card">
    <h2>{title}</h2>
    <p>This feature is coming soon.</p>
  </div>
);

function App() {
  // Lifted state could go here, or contexts
  return (
    <NexventoryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="billing" element={<Billing />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </NexventoryProvider>
  );
}

export default App;
