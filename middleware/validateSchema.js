const Ajv = require('ajv').default;
const ajv = new Ajv({ allErrors: true });

/**
 * Validates data against a JSON schema.
 * @param {object} data - The data object to validate.
 * @param {object} schema - The JSON schema to validate against.
 * @throws {Error} Throws an error if validation fails, containing error messages.
 */
function validateSchema(data, schema) {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
        const errors = validate.errors.map(e => ({
            field: e.instancePath.slice(1), // Remove leading slash
            message: e.message,
        }));
        throw new Error(`Invalid request data: ${JSON.stringify(errors)}`);
    }
}

module.exports = {
    validateSchema,
};
