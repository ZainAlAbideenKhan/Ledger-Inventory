import { useState } from 'react';
import api from '../../../../services/api';
import { useAlert } from '../../../../context/AlertContext';
import "./Modal.css";

export default function ChangeRoleModal({
  ledgerId,
  member,
  onClose,
  onRemove,
  onSuccess,
}) {
  const { showAlert } = useAlert();
  const [role, setRole] = useState(member.role);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put(
        `/inventory/${ledgerId}/members/${member.id}`,
        { role }
      );
      onSuccess();
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
        <h3>Change Role</h3>

        <p>
          {member.full_name} (@{member.username})
        </p>

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="writer">Writer</option>
          <option value="reader">Reader</option>
        </select>

        <div className="modal-actions">
          <button onClick={handleSave} disabled={loading}>
            Save
          </button>

          <button
            className="danger"
            onClick={onRemove}
          >
            Remove Member
          </button>

          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
