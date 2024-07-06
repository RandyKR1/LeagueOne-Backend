require('dotenv').config(); // Load environment variables from .env file

function getDatabaseUri() {
  if (process.env.NODE_ENV === 'test') {
    return process.env.TEST_DATABASE_URL || `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME_TEST}`;
  }
  // For development or production, use DATABASE_URL environment variable or default to local database
  return process.env.DATABASE_URL || `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
}

module.exports = {
  getDatabaseUri
};
