const pool = require('../db/connection');

const generateItemCode = () =>
  'ITM-' + Math.floor(1000 + Math.random() * 9000);

exports.getItems = async (req, res) => {
  const ledgerId = req.params.ledgerId;

  const [rows] = await pool.query(
    `SELECT 
    s.id,
    s.ledger_id,
    s.item_code,
    s.name,
    s.price,
    s.quantity,
    s.unit,
    s.created_by,
    u.full_name AS created_by_name,
    u.username AS creator_username
  FROM store_items s
  JOIN users u on u.id = s.created_by
  WHERE s.ledger_id = ? AND s.is_deleted = 0;`,
    [ledgerId]
  );

  res.json(rows);
};

exports.addItem = async (req, res) => {
  const ledgerId = req.params.ledgerId;
  const userId = req.user.id;
  const { name, price, quantity, unit } = req.body;

  await pool.query(
    `INSERT INTO store_items
     (ledger_id, item_code, name, price, quantity, unit, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      ledgerId,
      generateItemCode(),
      name,
      price,
      quantity,
      unit,
      userId,
    ]
  );

  res.json({ message: 'Item added' });
};

exports.addQuantity = async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  await pool.query(
    `UPDATE store_items
     SET quantity = quantity + ?
     WHERE id = ?`,
    [quantity, itemId]
  );

  res.json({ message: 'Quantity added' });
};

exports.editItem = async (req, res) => {
  const { name, price } = req.body;
  const { itemId, ledgerId } = req.params;
  const userId = req.user.id;
  const role = req.ledgerRole;

  const [[item]] = await pool.query(
    `SELECT created_by FROM store_items
     WHERE id = ? AND ledger_id = ?`,
    [itemId, ledgerId]
  );

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (role !== 'admin' && item.created_by !== userId) {
    return res.status(403).json({ message: 'Not allowed to edit this item' });
  }

  await pool.query(
    `UPDATE store_items SET name = ?, price = ? WHERE id = ?`,
    [name, price, itemId]
  );

  res.json({ message: 'Item updated' });
};

exports.deleteItem = async (req, res) => {
  const { itemId, ledgerId } = req.params;
  const userId = req.user.id;
  const role = req.ledgerRole;

  const [[item]] = await pool.query(
    `SELECT created_by FROM store_items
     WHERE id = ? AND ledger_id = ?`,
    [itemId, ledgerId]
  );

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (role !== 'admin' && item.created_by !== userId) {
    return res.status(403).json({ message: 'Not allowed to delete this item' });
  }

  await pool.query(
    `UPDATE store_items SET is_deleted = 1 WHERE id = ?`,
    [itemId]
  );

  res.json({ message: 'Item deleted' });
};
