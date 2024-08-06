require('dotenv').config();  // Load environment variables from .env file

// Set the port for the application to listen on. Default to 3001 if not specified.
const PORT = +process.env.PORT || 3001;

// Retrieve the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Function to get the database URI based on the current environment.
 * If the NODE_ENV is 'test', it will return the test database URI.
 * Otherwise, it returns the production or development database URI.
 * 
 * @returns {string} Database URI
 */
function getDatabaseUri() {
  return (process.env.NODE_ENV === 'test') 
    ? process.env.TEST_DATABASE_URL || `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME_TEST}`
    : process.env.DATABASE_URL || `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
}

// Export configuration for different environments
module.exports = {
  development: {
    username: process.env.DB_USERNAME,    // Database username for development
    password: process.env.DB_PASSWORD,    // Database password for development
    database: process.env.DB_NAME,        // Database name for development
    host: process.env.DB_HOST,            // Database host for development
    dialect: process.env.DB_DIALECT || 'postgres'  // Database dialect (default to 'postgres')
  },
  test: {
    username: process.env.DB_USERNAME,    // Database username for testing
    password: process.env.DB_PASSWORD,    // Database password for testing
    database: process.env.DB_NAME_TEST,   // Database name for testing
    host: process.env.DB_HOST,            // Database host for testing
    dialect: process.env.DB_DIALECT || 'postgres'  // Database dialect (default to 'postgres')
  },
  production: {
    username: process.env.DB_USERNAME,    // Database username for production
    password: process.env.DB_PASSWORD,    // Database password for production
    database: process.env.DB_NAME_PROD,   // Database name for production
    host: process.env.DB_HOST,            // Database host for production
    dialect: process.env.DB_DIALECT || 'postgres'  // Database dialect (default to 'postgres')
  },
  PORT,  // Port number for the application to listen on
  JWT_SECRET,  // JWT secret key
  getDatabaseUri  // Function to get the database URI based on environment
};
