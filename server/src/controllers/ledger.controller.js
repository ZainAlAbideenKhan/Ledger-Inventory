const pool = require('../db/connection');

/* =========================
   CREATE LEDGER
========================= */
exports.createLedger = async (req, res) => {
  const { name, subNote } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: 'Ledger name is required' });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [ledgerResult] = await conn.query(
      `INSERT INTO ledgers (name, sub_note, created_by)
       VALUES (?, ?, ?)`,
      [name, subNote || null, userId]
    );

    const ledgerId = ledgerResult.insertId;

    // Creator is always admin
    await conn.query(
      `INSERT INTO ledger_users (ledger_id, user_id, role)
       VALUES (?, ?, 'admin')`,
      [ledgerId, userId]
    );

    await conn.commit();

    return res.status(201).json({
      message: 'Ledger created successfully',
      ledgerId,
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

/* =========================
   GET USER LEDGERS
========================= */
exports.getMyLedgers = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        l.id,
        l.name,
        l.sub_note AS subNote,
        lu.role,
        u.username AS admin,
        l.created_at AS createdAt
      FROM ledger_users lu
      JOIN ledgers l ON l.id = lu.ledger_id
      JOIN users u ON u.id = l.created_by
      WHERE
        lu.user_id = ?
        AND lu.is_active = 1
        AND l.is_deleted = 0
      ORDER BY l.created_at DESC
      `,
      [userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyRoleInLedger = async (req, res) => {
  const userId = req.user.id;
  const { ledgerId } = req.params;

  const [[row]] = await pool.query(
    `SELECT 
       l.id,
       l.name,
       lu.role,
       u.username
     FROM ledger_users lu
     JOIN ledgers l ON l.id = lu.ledger_id
     JOIN users u ON u.id = lu.user_id
     WHERE lu.ledger_id = ?
       AND lu.user_id = ?
       AND lu.is_active = 1
       AND l.is_deleted = 0`,
    [ledgerId, userId]
  );

  if (!row) {
    return res.status(403).json({ message: 'Not part of this ledger' });
  }

  res.json(row);
};
