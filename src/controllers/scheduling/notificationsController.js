const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => { success(res, [], 'Notifications list'); };
exports.getOne = async (req, res) => { success(res, {}, 'Details'); };
exports.create = async (req, res) => { success(res, { id: 1, ...req.body }, 'Created', 201); };
exports.delete = async (req, res) => { success(res, null, 'Deleted'); };
exports.getByType = async (req, res) => { success(res, [], 'By Type'); };
exports.getUnread = async (req, res) => { success(res, [], 'Unread'); };
exports.markRead = async (req, res) => { success(res, null, 'Read'); };
exports.markAllRead = async (req, res) => { success(res, null, 'All Read'); };
exports.getByRelated = async (req, res) => { success(res, [], 'Related'); };
