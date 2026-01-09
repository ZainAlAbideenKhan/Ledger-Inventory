import { useState } from "react";
import api from "../../../../services/api";
import { useAlert } from "../../../../context/AlertContext";
import "./Modal.css";

export default function AddItemModal({ ledgerId, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("piece");
  const { showAlert } = useAlert();

  const handleAdd = async () => {
    try {
      await api.post(`/inventory/${ledgerId}/store`, {
        name,
        price,
        quantity,
        unit,
      });
      onSuccess();
      onClose();
    } catch(err) {
      showAlert(err.message, 'error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Add Item</h3>
        <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input placeholder="Price" onChange={(e) => setPrice(e.target.value)} />
        <input
          placeholder="Quantity"
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input placeholder="Unit" onChange={(e) => setUnit(e.target.value)} />

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
