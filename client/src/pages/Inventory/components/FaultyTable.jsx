import { useEffect, useState } from 'react';
import api from '../../../services/api';
import AddFaultyModal from './modals/AddFaultyModal';
import RemoveFaultyModal from './modals/RemoveFaultyModal';
import "./Table.css";

export default function FaultyTable({
  ledgerId,
  currentUser,
  role,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const canWrite = role === "admin" || role === "writer";

  const fetchFaulty = async () => {
    setLoading(true);
    const res = await api.get(`/inventory/${ledgerId}/faulty`);
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFaulty();
  }, [ledgerId]);

  if (loading) return <p>Loading faulty items…</p>;

  return (
    <>
      {canWrite && (
        <button onClick={() => setShowAdd(true)} className="button">
          + Mark Item as Faulty
        </button>
      )}

      {items.length === 0 && <p>No faulty items recorded.</p>}

      {items.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Before</th>
              <th>Faulty Qty</th>
              <th>Unit</th>
              <th>Reported By</th>
              <th>Reason</th>
              {canWrite && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((f) => {
              const canRemove =
                role === 'admin' ||
                f.reporter_userid === currentUser;
                
              return (
                <tr key={f.id}>
                  <td>{f.item_code}</td>
                  <td>{f.quantity_before}</td>
                  <td>{f.quantity_faulty}</td>
                  <td>{f.unit}</td>
                  <td>{f.reporter_name}</td>
                  <td>{f.reason}</td>

                  {canWrite && (
                    <td>
                      {canRemove && (
                        <button
                          onClick={() => setSelected(f)}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showAdd && (
        <AddFaultyModal
          ledgerId={ledgerId}
          onClose={() => {
            setShowAdd(false);
            fetchFaulty();
          }}
        />
      )}

      {selected && (
        <RemoveFaultyModal
          ledgerId={ledgerId}
          entry={selected}
          onClose={() => {
            setSelected(null);
            fetchFaulty();
          }}
        />
      )}
    </>
  );
}
