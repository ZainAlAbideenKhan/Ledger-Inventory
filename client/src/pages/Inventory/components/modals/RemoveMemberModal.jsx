import api from '../../../../services/api';
import { useAlert } from '../../../../context/AlertContext';
import "./Modal.css";

export default function RemoveMemberModal({
  ledgerId,
  member,
  onClose,
  onSuccess,
}) {
  const { showAlert } = useAlert();
  const handleRemove = async () => {
    try {
      await api.delete(
        `/inventory/${ledgerId}/members/${member.id}`
      );
      onSuccess();
      onClose();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Remove Member</h3>

        <p>
          Remove <strong>{member.full_name}</strong> from this ledger?
        </p>

        <div className="modal-actions">
          <button className="danger" onClick={handleRemove}>
            Remove
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
