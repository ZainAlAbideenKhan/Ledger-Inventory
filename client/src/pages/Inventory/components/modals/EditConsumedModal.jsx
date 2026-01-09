import { useState } from 'react';
import "./Modal.css";

export default function EditConsumedModal({ entry, onClose }) {
  const [qty, setQty] = useState(entry.quantity);
  const [reason, setReason] = useState(entry.reason);

  const handleSave = () => {
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Edit Consumption</h3>

        <input value={qty} onChange={(e) => setQty(e.target.value)} />
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} />

        <div className="modal-actions">
          <button className='button' onClick={handleSave}>Save</button>
          <button className='button' onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
