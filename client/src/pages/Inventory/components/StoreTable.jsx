import { useEffect, useState } from 'react';
import api from '../../../services/api';
import AddItemModal from './modals/AddItemModal';
import { useAlert } from '../../../context/AlertContext';
import EditItemModal from './modals/EditItemModal';
import DeleteItemModal from './modals/DeleteItemModal';
import AddQuantityModal from './modals/AddQuantityModal';
import "./Table.css";

export default function StoreTable({ ledgerId, role, username}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddQty, setShowAddQty] = useState(false);

  const canWrite = role === "admin" || role === "writer";

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/inventory/${ledgerId}/store`);
      setItems(res.data);
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [ledgerId]);

  if (loading) return <p>Loading store items…</p>;

  return (
    <>
      {canWrite && (
        <button onClick={() => setShowAdd(true)} className='button'>+ Add Item</button>
      )}

      {items.length === 0 && <p>No items in store.</p>}

      {items.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Created By</th>
              {canWrite && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.item_code}</td>
                <td>{item.name}</td>
                <td>{item.price}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>{item.created_by_name}</td>
                {(username === item.creator_username || role === 'admin') && (
                  <td>
                    <button onClick={() => {
                      setSelectedItem(item);
                      setShowEdit(true);
                    }}>
                      Edit
                    </button>

                    <button onClick={() => {
                      setSelectedItem(item);
                      setShowAddQty(true);
                    }}>
                      +Qty
                    </button>

                    <button onClick={() => {
                      setSelectedItem(item);
                      setShowDelete(true);
                    }}>
                      Delete
                    </button>
                  </td>
                )}
                {(username !== item.creator_username && role !== 'admin') && (
                  <td className='cst-no-action'>No Action</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODALS */}
      {showAdd && (
        <AddItemModal
          ledgerId={ledgerId}
          onClose={() => setShowAdd(false)}
          onSuccess={fetchItems}
        />
      )}

      {showEdit && selectedItem && (
        <EditItemModal
          ledgerId={ledgerId}
          item={selectedItem}
          onClose={() => setShowEdit(false)}
          onSuccess={fetchItems}
        />
      )}

      {showAddQty && selectedItem && (
        <AddQuantityModal
          ledgerId={ledgerId}
          item={selectedItem}
          onClose={() => setShowAddQty(false)}
          onSuccess={fetchItems}
        />
      )}

      {showDelete && selectedItem && (
        <DeleteItemModal
          ledgerId={ledgerId}
          item={selectedItem}
          onClose={() => setShowDelete(false)}
          onSuccess={fetchItems}
        />
      )}
    </>
  );
}
