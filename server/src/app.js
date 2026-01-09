const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const ledgerRoutes = require("./routes/ledger.routes");
app.use("/ledgers", ledgerRoutes);

const inventoryRoutes = require("./routes/inventory.routes");
app.use("/inventory", inventoryRoutes);

module.exports = app;
