const pool = require('../db/connection');

module.exports = (allowedRoles = []) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const ledgerId = req.params.ledgerId;

    const [rows] = await pool.query(
      `SELECT role FROM ledger_users
       WHERE ledger_id = ? AND user_id = ? AND is_active = 1`,
      [ledgerId, userId]
    );

    if (!rows.length) {
      return res.status(403).json({ message: 'Not a member of this ledger' });
    }

    if (!allowedRoles.includes(rows[0].role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    req.ledgerRole = rows[0].role;
    next();
  };
};