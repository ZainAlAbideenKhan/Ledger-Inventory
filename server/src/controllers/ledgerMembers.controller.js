const pool = require('../db/connection');

exports.getMembers = async (req, res) => {
  const ledgerId = req.params.ledgerId;

  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.username, lu.role
     FROM ledger_users lu
     JOIN users u ON u.id = lu.user_id
     WHERE lu.ledger_id = ? AND lu.is_active = 1`,
    [ledgerId]
  );

  res.json(rows);
};

exports.addMember = async (req, res) => {
  const ledgerId = req.params.ledgerId;
  const { identifier, role } = req.body;

  const [[user]] = await pool.query(
    `SELECT id FROM users
     WHERE username = ? OR email = ? OR phone = ?`,
    [identifier, identifier, identifier]
  );

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  await pool.query(
    `INSERT INTO ledger_users (ledger_id, user_id, role)
     VALUES (?, ?, ?)`,
    [ledgerId, user.id, role || 'reader']
  );

  res.json({ message: 'Member added' });
};

exports.changeRole = async (req, res) => {
  const { role } = req.body;
  const { ledgerId, userId } = req.params;

  await pool.query(
    `UPDATE ledger_users SET role = ?
     WHERE ledger_id = ? AND user_id = ?`,
    [role, ledgerId, userId]
  );

  res.json({ message: 'Role updated' });
};

exports.removeMember = async (req, res) => {
  const { ledgerId, userId } = req.params;

  await pool.query(
    `UPDATE ledger_users SET is_active = 0
     WHERE ledger_id = ? AND user_id = ?`,
    [ledgerId, userId]
  );

  res.json({ message: 'Member removed' });
};
