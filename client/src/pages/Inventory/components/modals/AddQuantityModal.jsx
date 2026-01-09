import { useState } from "react";
import api from "../../../../services/api";
import { useAlert } from "../../../../context/AlertContext";
import "./Modal.css";

export default function AddQuantityModal({
  ledgerId,
  item,
  onClose,
  onSuccess,
}) {
  const { showAlert } = useAlert();
  const [qty, setQty] = useState("");

  const handleAdd = async () => {
    try {
      await api.put(`/inventory/${ledgerId}/store/${item.id}/quantity`, {
        quantity: qty,
      });
      onSuccess();
      onClose();
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Add Quantity</h3>
        <p>
          {item.name} (Current: {item.quantity})
        </p>
        <input
          placeholder="Quantity"
          onChange={(e) => setQty(e.target.value)}
        />
        <button className="button" onClick={handleAdd}>
          Add
        </button>
        <button className="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
