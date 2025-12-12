const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount all routes
app.use("/", routes);

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});