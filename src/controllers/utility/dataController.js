const { success, error } = require('../../utils/response');

exports.importData = async (req, res) => { success(res, null, 'Imported'); };
exports.exportData = async (req, res) => { success(res, 'url', 'Exported'); };
exports.getTemplates = async (req, res) => { success(res, [], 'Templates'); };
