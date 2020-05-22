const libxml = require('libxmljs');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

module.exports = {
  validateXML: async (data, xsdPath) => {
    try {
      const schemaPath = path.join(__dirname, `../assets/schema/${xsdPath}.xsd`);
      const schema = await readFileAsync(schemaPath, { encoding: 'utf8' });
      const xsdDoc = libxml.parseXml(schema);
      const xmlDocValid = libxml.parseXml(data);

      xmlDocValid.validate(xsdDoc);

      const validation = xmlDocValid.validationErrors;

      const result = validation.map(err => (err ? err.toString() : ''));

      if (!result || !result.length || result.length === 0) {
        return { status: true, validation: null };
      }

      return { status: true, validation: result };
    } catch (error) {
      return { status: false, error };
    }
  },
};
