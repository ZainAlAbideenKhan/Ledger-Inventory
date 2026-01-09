import React from "react";
import "./LedgerCard.css";

export default function LedgerCard({ ledger, onSelect }) {
  return (
    <div className="ledger-card" onClick={() => onSelect(ledger)}>
      <div className="ledger-card-header">
        <h3 className="ledger-name">{ledger.name}</h3>
        <span className={`ledger-role ${ledger.role}`}>{ledger.role}</span>
      </div>

      {ledger.subNote && <p className="ledger-subnote">{ledger.subNote}</p>}

      <div className="ledger-meta">
        <div>
          <span className="meta-label">Admin</span>
          <span className="meta-value">{ledger.admin}</span>
        </div>
        <div>
          <span className="meta-label">Created</span>
          <span className="meta-value">{ledger.createdAt}</span>
        </div>
      </div>
    </div>
  );
}
