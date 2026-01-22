const pool = require('../db/connection');

exports.getFaulty = async (req, res) => {
  const { ledgerId } = req.params;

  const [rows] = await pool.query(
    `SELECT
      f.id,
      f.ledger_id,
      f.store_item_id,
      f.item_code,
      f.quantity_before,
      f.quantity_faulty,
      f.unit,
      f.reported_by,
      f.reason,
      u.username AS reporter_userid,
      u.full_name AS reporter_name
     FROM faulty_items f
     JOIN users u on u.id = f.reported_by
     WHERE f.ledger_id = ? AND f.is_deleted = 0
     ORDER BY f.created_at DESC`,
    [ledgerId]
  );

  res.json(rows);
};

exports.addFaulty = async (req, res) => {
  const conn = await pool.getConnection();

  const { ledgerId } = req.params;
  const { itemId, quantity, reason } = req.body;
  const userId = req.user.id;

  try {
    await conn.beginTransaction();

    const [[item]] = await conn.query(
      `SELECT * FROM store_items
       WHERE id = ? AND ledger_id = ? AND is_deleted = 0
       FOR UPDATE`,
      [itemId, ledgerId]
    );

    if (!item) {
      throw new Error('Item not found');
    }

    if (Number(quantity) <= 0 || Number(quantity) > item.quantity) {
      throw new Error('Invalid faulty quantity');
    }

    await conn.query(
      `INSERT INTO faulty_items
       (ledger_id, store_item_id, item_code,
        quantity_before, quantity_faulty,
        unit, reported_by, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ledgerId,
        item.id,
        item.item_code,
        item.quantity,
        quantity,
        item.unit,
        userId,
        reason || null,
      ]
    );

    await conn.query(
      `UPDATE store_items
       SET quantity = quantity - ?
       WHERE id = ?`,
      [quantity, item.id]
    );

    await conn.commit();
    res.json({ message: 'Faulty item recorded' });

  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};

exports.removeFaulty = async (req, res) => {
  const conn = await pool.getConnection();

  const { ledgerId, faultyId } = req.params;
  const userId = req.user.id;
  const role = req.ledgerRole;

  try {
    await conn.beginTransaction();

    const [[entry]] = await conn.query(
      `SELECT * FROM faulty_items
       WHERE id = ? AND ledger_id = ? AND is_deleted = 0
       FOR UPDATE`,
      [faultyId, ledgerId]
    );

    if (!entry) {
      throw new Error('Faulty entry not found');
    }

    if (role !== 'admin' && entry.reported_by !== userId) {
      throw new Error('Not allowed to remove this entry');
    }

    await conn.query(
      `UPDATE store_items
       SET quantity = quantity + ?
       WHERE id = ?`,
      [entry.quantity_faulty, entry.store_item_id]
    );

    await conn.query(
      `UPDATE faulty_items
       SET is_deleted = 1
       WHERE id = ?`,
      [faultyId]
    );

    await conn.commit();
    res.json({ message: 'Faulty record removed and stock restored' });

  } catch (err) {
    await conn.rollback();
    res.status(403).json({ message: err.message });
  } finally {
    conn.release();
  }
};