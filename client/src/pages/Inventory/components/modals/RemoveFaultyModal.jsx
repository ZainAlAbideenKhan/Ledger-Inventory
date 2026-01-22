import api from "../../../../services/api";
import { useAlert } from "../../../../context/AlertContext";
import "./Modal.css";

export default function RemoveFaultyModal({ ledgerId, entry, onClose }) {
  const { showAlert } = useAlert();

  const handleRemove = async () => {
    try {
      await api.delete(`/inventory/${ledgerId}/faulty/${entry.id}`);
      onClose();
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Remove Faulty Record</h3>

        <p>
          Removing this will add <strong>{entry.quantity_faulty}</strong> back
          to store.
        </p>

        <button className="button danger" onClick={handleRemove}>
          Confirm Remove
        </button>
        <button className="button" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
