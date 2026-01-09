import { useState } from 'react';
import api from '../../../../services/api';
import { useAlert } from '../../../../context/AlertContext';
import "./Modal.css";

export default function AddMemberModal({ ledgerId, onClose, onSuccess }) {
  const { showAlert } = useAlert();
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!identifier.trim()) {
      setError('Enter username, email, or phone');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/inventory/${ledgerId}/members`, {
        identifier,
        role: 'reader',
      });
      onSuccess();
      onClose();
    } catch (err) {
      showAlert(err.message || 'User not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Add Member</h3>

        {error && <p className="error-text">{error}</p>}

        <input
          placeholder="Username / Email / Phone"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={handleAdd} disabled={loading}>
            Add
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
