import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AlertProvider } from "./context/AlertContext";
import LoginPage from "./pages/Auth/Login";
import Dashbaord from "./pages/Dashboard/Dashboard";
import Inventory from "./pages/Inventory/Inventory";

function App() {
  return (
    <BrowserRouter>
      <AlertProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashbaord />} />
          <Route path="/ledger/:ledgerId/inventory" element={<Inventory />} />
        </Routes>
      </AlertProvider>
    </BrowserRouter>
  );
}

export default App;
