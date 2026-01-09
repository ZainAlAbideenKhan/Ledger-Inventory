import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import NavBar from "./components/NavBar";
import MembersSidebar from "./components/MembersSidebar";
import StoreTable from "./components/StoreTable";
import ConsumedTable from "./components/ConsumedTable";
import { useAlert } from '../../context/AlertContext';
import "./Inventory.css";

export default function Inventory() {
  const { showAlert } = useAlert();
  const { ledgerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("store");
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedgerContext = async () => {
      try {
        const res = await api.get(`/ledgers/${ledgerId}/me`);
        setLedger(res.data);
      } catch (err) {
        showAlert(err.message, 'error');
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLedgerContext();
  }, [ledgerId, navigate]);

  if (loading) {
    return <div className="page-loader">Loading ledger…</div>;
  }

  if (!ledger) return null;

  const role = ledger.role;
  const canManageMembers = role === "admin";
  
  return (
    <div className="inventory-wrapper">
      <NavBar
        ledgerName={ledger.name}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="inventory-body">
        <MembersSidebar ledgerId={ledgerId} canManage={canManageMembers} username={ledger.username} />

        <main className="inventory-main">
          {activeTab === "store" && (
            <StoreTable ledgerId={ledgerId} role={role} username={ledger.username} />
          )}

          {activeTab === "consumed" && (
            <ConsumedTable ledgerId={ledgerId} role={role} username={ledger.username} />
          )}
        </main>
      </div>
    </div>
  );
}
