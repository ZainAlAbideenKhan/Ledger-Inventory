import { useEffect, useState } from "react";
import api from "../../../../services/api";
import { useAlert } from "../../../../context/AlertContext";
import "./Modal.css";

export default function ConsumeItemModal({ ledgerId, onClose }) {
  const [items, setItems] = useState([]);
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const { showAlert } = useAlert();

  const fetchItems = async () => {
    try {
      await api
        .get(`/inventory/${ledgerId}/store`)
        .then((res) => setItems(res.data));
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  useEffect(() => {
    fetchItems();
  }, [ledgerId]);

  // const selectedItem = items.find((i) => i.id === Number(itemId));

  const handleConsume = async () => {
    try {
      await api.post(`/inventory/${ledgerId}/consumed`, {
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
        <h3>Consume Item</h3>

        <select onChange={(e) => setItemId(e.target.value)}>
          <option value="">Select item</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.item_code} - {i.name} (Qty: {i.quantity})
            </option>
          ))}
        </select>

        <input
          placeholder="Quantity"
          onChange={(e) => setQty(e.target.value)}
        />
        <textarea
          placeholder="Reason"
          onChange={(e) => setReason(e.target.value)}
        />

        <button className="button" onClick={handleConsume}>
          Consume
        </button>
        <button className="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
