const app = require("./app");
const db = require("./models"); // Adjust path as per your project structure
require('dotenv').config();


app.listen(3001, () => {
    console.log('Server Running on port 3001');
});

