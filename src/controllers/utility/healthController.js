const { success, error } = require('../../utils/response');

exports.getHealth = async (req, res) => { success(res, { status: 'OK' }, 'System healthy'); };
exports.getStatus = async (req, res) => { success(res, { uptime: 100 }, 'System status'); };
exports.getLogs = async (req, res) => { success(res, [], 'System logs'); };
exports.getMetrics = async (req, res) => { success(res, {}, 'System metrics'); };
