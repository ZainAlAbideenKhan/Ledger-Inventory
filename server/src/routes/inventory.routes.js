const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/ledgerRole.middleware');

const members = require('../controllers/ledgerMembers.controller');
const store = require('../controllers/store.controller');
const consumed = require('../controllers/consumed.controller');

router.get( '/:ledgerId/members', auth, role(['admin', 'writer', 'reader']), members.getMembers );
router.post('/:ledgerId/members', auth, role(['admin']), members.addMember);
router.put('/:ledgerId/members/:userId', auth, role(['admin']), members.changeRole);
router.delete('/:ledgerId/members/:userId', auth, role(['admin']), members.removeMember);

router.get('/:ledgerId/store', auth, role(['admin', 'writer', 'reader']), store.getItems);
router.post('/:ledgerId/store', auth, role(['admin', 'writer']), store.addItem);
router.put('/:ledgerId/store/:itemId', auth, role(['admin', 'writer']), store.editItem);
router.put('/:ledgerId/store/:itemId/quantity', auth, role(['admin', 'writer']), store.addQuantity);
router.delete('/:ledgerId/store/:itemId', auth, role(['admin']), store.deleteItem);

router.get('/:ledgerId/consumed', auth, role(['admin', 'writer', 'reader']), consumed.getConsumed);
router.post('/:ledgerId/consumed', auth, role(['admin', 'writer']), consumed.consumeItem);
router.delete('/:ledgerId/consumed/:consumedId', auth, role(['admin']), consumed.deleteConsumed);

module.exports = router;
