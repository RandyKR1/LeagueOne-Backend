// verifyHash.js
const bcrypt = require('bcrypt');

const plainTextPassword = '123456';
const hashedPassword = '$$2b$10$GcU1Lu9M65IjCYl55RUkYOFdRzmk3dGegu0CP1MdziQ2FXZsEcLd6';

bcrypt.compare(plainTextPassword, hashedPassword, (err, isMatch) => {
  if (err) {
    console.error("Error comparing passwords:", err);
  } else {
    console.log("Password match:", isMatch);
  }
});
