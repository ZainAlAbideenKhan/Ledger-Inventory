import api from "../../../../services/api";
import { useAlert } from "../../../../context/AlertContext";
import "./Modal.css";

export default function DeleteItemModal({
  ledgerId,
  item,
  onClose,
  onSuccess,
}) {
  const { showAlert } = useAlert();
  
  const handleDelete = async () => {
    try {
      await api.delete(`/inventory/${ledgerId}/store/${item.id}`);
      onSuccess();
      onClose();
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Delete Item</h3>
        <p>Delete {item.name}?</p>
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
