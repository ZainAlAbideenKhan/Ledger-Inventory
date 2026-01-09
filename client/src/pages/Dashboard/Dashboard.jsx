import React from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import NavBar from "./components/Navbar";
import LedgerCard from "./components/LedgerCard";
import CreateLedgerModal from "./components/CreateLedgerModal";
import { useAlert } from '../../context/AlertContext';
import { useEffect, useState } from "react";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateLedger, setShowCreateLedger] = useState(false);
  const { showAlert } = useAlert();
  
  const handleLedgerSelect = (ledger) => {
    navigate(`/ledger/${ledger.id}/inventory`);
  };

  useEffect(() => {
    const fetchLedgers = async () => {
      try {
        const res = await api.get("/ledgers");
        setLedgers(res.data);
      } catch (err) {
        showAlert(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchLedgers();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-wrapper">
      <NavBar onLogout={handleLogout} />

      <div className="dashboard-content">
        <section className="user-info">
          <h2>Welcome, {user?.fullName || user?.username}</h2>
          <div className="user-meta">
            <span>{user?.username}</span>
            <span>{user?.email}</span>
          </div>
        </section>

        <div className="dashboard-actions">
          <button
            className="create-ledger-btn"
            onClick={() => setShowCreateLedger(true)}
          >
            + Create Ledger
          </button>
        </div>
        {showCreateLedger && (
          <CreateLedgerModal
            onClose={() => setShowCreateLedger(false)}
            onCreated={() => {
              // re-fetch ledgers
              window.location.reload();
            }}
          />
        )}

        <section className="ledger-grid">
          {loading && <p>Loading ledgers...</p>}

          {!loading && ledgers.length === 0 && (
            <p>No ledgers yet. Create one to get started.</p>
          )}

          {ledgers.map((ledger) => (
            <LedgerCard
              key={ledger.id}
              ledger={ledger}
              onSelect={handleLedgerSelect}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
