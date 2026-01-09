const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const ledgerController = require('../controllers/ledger.controller');

router.post('/', authMiddleware, ledgerController.createLedger);
router.get('/', authMiddleware, ledgerController.getMyLedgers);
router.get( '/:ledgerId/me', authMiddleware, ledgerController.getMyRoleInLedger );

module.exports = router;
