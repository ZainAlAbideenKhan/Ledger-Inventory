import { useState } from "react";
import api from "../../../../services/api";
import { useAlert } from "../../../../context/AlertContext";
import "./Modal.css";

export default function EditItemModal({ ledgerId, item, onClose, onSuccess }) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const { showAlert } = useAlert();
  const handleSave = async () => {
    try {
      await api.put(`/inventory/${ledgerId}/store/${item.id}`, { name, price });
      onSuccess();
      onClose();
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Edit Item</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <input value={price} onChange={(e) => setPrice(e.target.value)} />
        <button className="button" onClick={handleSave}>
          Save
        </button>
        <button className="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
