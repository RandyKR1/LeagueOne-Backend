const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { validateSchema } = require('../middleware/validateSchema');
const {BadRequestError} = require('../expressError')
const {createToken} = require('../helpers/tokens')


const schemas = {
  UserRegister: require('../schemas/UserRegister.json'),
  UserAuth: require('../schemas/UserAuth.json'),
};

/**
 * @route POST /auth/register
 * @description Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    // Validate request body against UserRegister schema
    validateSchema(req.body, schemas.UserRegister);

    const { firstName, lastName, email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const user = await User.create({ firstName, lastName, email, username, password: hashedPassword });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, schemas.UserAuth);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
