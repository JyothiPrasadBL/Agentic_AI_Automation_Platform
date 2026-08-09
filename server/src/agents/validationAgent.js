function validate({ node, output }) {
  if (output === undefined || output === null) return { valid: false, missingFields: ['output'] };
  const config = node.data?.config || {};
  const requiredFields = Array.isArray(config.requiredOutputFields) ? config.requiredOutputFields : [];
  const missingFields = requiredFields.filter((field) => output[field] === undefined || output[field] === null || output[field] === '');
  return { valid: missingFields.length === 0, missingFields };
}
module.exports = { validate };
