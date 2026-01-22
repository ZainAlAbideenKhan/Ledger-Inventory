import { useEffect, useState } from "react";
import api from "../../../../services/api";
import { useAlert } from "../../../../context/AlertContext";
import "./Modal.css";

export default function AddFaultyModal({ ledgerId, onClose }) {
  const [items, setItems] = useState([]);
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const { showAlert } = useAlert();
  useEffect(() => {
    api.get(`/inventory/${ledgerId}/store`).then((res) => setItems(res.data));
  }, [ledgerId]);

  const selectedItem = items.find((i) => i.id === Number(itemId));

  const handleSubmit = async () => {
    try {
      await api.post(`/inventory/${ledgerId}/faulty`, {
        itemId,
        quantity: qty,
        reason,
      });
      onClose();
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Mark Item as Faulty</h3>

        <select onChange={(e) => setItemId(e.target.value)}>
          <option value="">Select Item</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.item_code} – {i.name} (Qty: {i.quantity})
            </option>
          ))}
        </select>

        <input
          placeholder="Faulty Quantity"
          onChange={(e) => setQty(e.target.value)}
        />

        <textarea
          placeholder="Reason / Description"
          onChange={(e) => setReason(e.target.value)}
        />

        <button onClick={handleSubmit} className="button">Mark Faulty</button>
        <button onClick={onClose} className="button">Cancel</button>
      </div>
    </div>
  );
}
