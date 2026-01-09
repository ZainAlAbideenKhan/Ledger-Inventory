const express = require('express');
const cors = require('cors');

const authRoutes = require("./routes/auth.routes");
const inventoryRoutes = require("./routes/ledger.routes");
const ledgerRoutes = require("./routes/inventory.routes");
const initSchema = require("./db/initSchema");

const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});


app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/ledgers', ledgerRoutes);

(async () => {
  await initSchema();
})();

module.exports = app;