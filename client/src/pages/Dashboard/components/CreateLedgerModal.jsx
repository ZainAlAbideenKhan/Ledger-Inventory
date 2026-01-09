import { useState } from 'react';
import api from '../../../services/api';
import { useAlert } from '../../../context/AlertContext';

export default function CreateLedgerModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [subNote, setSubNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleCreate = async () => {
    
    if (!name) return;
    
    try {
      setLoading(true);
      await api.post('/ledgers', { name, subNote });
      onCreated();
      onClose();
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Create Ledger</h3>

        <input
          placeholder="Ledger name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Sub note (optional)"
          value={subNote}
          onChange={(e) => setSubNote(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={handleCreate} disabled={loading}>
            Create
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
