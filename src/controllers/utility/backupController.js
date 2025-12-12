const { success, error } = require('../../utils/response');

exports.createBackup = async (req, res) => { success(res, { id: 1 }, 'Backup created'); };
exports.getBackups = async (req, res) => { success(res, [], 'Backups list'); };
exports.restore = async (req, res) => { success(res, null, 'System restored'); };
exports.deleteBackup = async (req, res) => { success(res, null, 'Backup deleted'); };
