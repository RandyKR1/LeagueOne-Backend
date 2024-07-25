const app = require("./app");
require('dotenv').config();
const {PORT} = require('./config/config')

app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
});
