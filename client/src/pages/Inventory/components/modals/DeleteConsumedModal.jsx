import api from "../../../../services/api";
import { useAlert } from "../../../../context/AlertContext";
import "./Modal.css";

export default function DeleteConsumedModal({ ledgerId, entry, onClose }) {
  const { showAlert } = useAlert();
  const handleDelete = async () => {
    try {
      await api.delete(`/inventory/${ledgerId}/consumed/${entry.id}`);
      onClose();
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Delete Entry</h3>
        <p>Delete this consumption record?</p>
        <button className="button delete-btn" onClick={handleDelete}>
          Delete
        </button>
        <button className="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
