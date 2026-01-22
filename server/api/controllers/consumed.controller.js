const pool = require('../db/connection');

exports.getConsumed = async (req, res) => {
  const ledgerId = req.params.ledgerId;

  const [rows] = await pool.query(
    `SELECT
      c.id,
      s.name,
      c.ledger_id,
      c.store_item_id,
      c.item_code,
      c.quantity_before,
      c.quantity_consumed,
      c.unit,
      c.responsible,
      c.reason,
      u.full_name AS responsible_name,
      u.username AS responsible_username
    FROM consumed_items c 
    JOIN users u on u.id = c.responsible
    JOIN store_items s on s.id = c.store_item_id
    WHERE c.ledger_id = ? AND c.is_deleted = 0`,
    [ledgerId]
  );

  res.json(rows);
};

exports.consumeItem = async (req, res) => {
  const { itemId, quantity, reason } = req.body;
  const ledgerId = req.params.ledgerId;
  const userId = req.user.id;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let [[item]] = await conn.query(
      `SELECT * FROM store_items WHERE id = ? FOR UPDATE`,
      [itemId]
    );

    if (parseFloat(quantity) > parseFloat(item.quantity)) {
      throw new Error('Insufficient quantity');
    }

    await conn.query(
      `INSERT INTO consumed_items
       (ledger_id, store_item_id, item_code,
        quantity_before, quantity_consumed,
        unit, responsible, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ledgerId,
        item.id,
        item.item_code,
        item.quantity,
        quantity,
        item.unit,
        userId,
        reason,
      ]
    );

    await conn.query(
      `UPDATE store_items
       SET quantity = quantity - ?
       WHERE id = ?`,
      [quantity, item.id]
    );

    await conn.commit();
    res.json({ message: 'Item consumed' });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};

exports.deleteConsumed = async (req, res) => {
  const { consumedId, ledgerId } = req.params;
  const userId = req.user.id;
  const role = req.ledgerRole;

  const [[entry]] = await pool.query(
    `SELECT responsible FROM consumed_items
     WHERE id = ? AND ledger_id = ?`,
    [consumedId, ledgerId]
  );

  if (!entry) {
    return res.status(404).json({ message: 'Entry not found' });
  }

  if (role !== 'admin' && entry.responsible !== userId) {
    return res.status(403).json({ message: 'Not allowed to delete this entry' });
  }

  await pool.query(
    `UPDATE consumed_items SET is_deleted = 1 WHERE id = ?`,
    [consumedId]
  );

  res.json({ message: 'Entry deleted' });
};
