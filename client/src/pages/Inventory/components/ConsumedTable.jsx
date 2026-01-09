import { useEffect, useState } from "react";
import api from "../../../services/api";
import { useAlert } from "../../../context/AlertContext";
import ConsumeItemModal from "./modals/ConsumeItemModal";
import DeleteConsumedModal from "./modals/DeleteConsumedModal";
import "./Table.css";
import "./ConsumedTable.css";

export default function ConsumedTable({ ledgerId, role, username }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConsume, setShowConsume] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const { showAlert } = useAlert();
  const canWrite = role === "admin" || role === "writer";

  const fetchConsumed = async () => {
    try {
      const res = await api.get(`/inventory/${ledgerId}/consumed`);
      setEntries(res.data);
      setLoading(false);
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  useEffect(() => {
    fetchConsumed();
  }, [ledgerId]);

  if (loading) return <p>Loading consumed items…</p>;

  return (
    <>
      {canWrite && (
        <button onClick={() => setShowConsume(true)} className="button">
          + Consume Item
        </button>
      )}

      {entries.length === 0 && <p>No consumption records.</p>}

      {entries.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Before</th>
              <th>Consumed</th>
              <th>Unit</th>
              <th>Responsible</th>
              <th>Reason</th>
              {canWrite && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td>{e.item_code}</td>
                <td>{e.quantity_before}</td>
                <td>{e.quantity_consumed}</td>
                <td>{e.unit}</td>
                <td>{e.responsible_name}</td>
                <td>{e.reason}</td>

                {(username === e.responsible_username || role === "admin") && (
                  <td>
                    <button onClick={() => setSelectedEntry(e)}>Delete</button>
                  </td>
                )}

                {username !== e.responsible_username && role !== "admin" && (
                  <td className="cst-no-action">No Action</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showConsume && (
        <ConsumeItemModal
          ledgerId={ledgerId}
          onClose={() => {
            setShowConsume(false);
            fetchConsumed();
          }}
        />
      )}

      {selectedEntry && (
        <DeleteConsumedModal
          ledgerId={ledgerId}
          entry={selectedEntry}
          onClose={() => {
            setSelectedEntry(null);
            fetchConsumed();
          }}
        />
      )}
    </>
  );
}
