const { success, error } = require('../../utils/response');

exports.bulkUpdate = async (req, res) => { success(res, null, 'Bulk update'); };
exports.bulkDelete = async (req, res) => { success(res, null, 'Bulk delete'); };
exports.bulkStatus = async (req, res) => { success(res, null, 'Bulk status update'); };
