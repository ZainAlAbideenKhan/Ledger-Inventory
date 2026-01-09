const express = require('express');
const cors = require('cors');

const authRoutes = require("./api/routes/auth.routes");
const inventoryRoutes = require("./api/routes/ledger.routes");
const ledgerRoutes = require("./api/routes/inventory.routes");
const initSchema = require("./api/db/initSchema");

(async () => {
  await initSchema();
})();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/ledgers', ledgerRoutes);

module.exports = app;
