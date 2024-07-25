const app = require("./app");
const db = require("./models"); // Adjust path as per your project structure
require('dotenv').config();

// Retrieve the PORT from environment variables or default to 3001
const PORT = +process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
});
