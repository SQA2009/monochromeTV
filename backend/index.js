const express = require("express");
const cors = require("cors");
const { PORT } = require("./src/config");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const searchRoute = require("./src/routes/search");
const albumRoute = require("./src/routes/album");
const streamRoute = require("./src/routes/stream");
const stitchRoute = require("./src/routes/stitch");

app.get("/search/:category", searchRoute);
app.get("/album/:id", albumRoute);
app.get("/stream", streamRoute);
app.get("/stitch", stitchRoute);

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});