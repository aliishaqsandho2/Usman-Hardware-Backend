const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => { success(res, [], 'Settings list'); };
exports.getOne = async (req, res) => { success(res, {}, 'Setting value'); };
exports.create = async (req, res) => { success(res, null, 'Setting created'); };
exports.update = async (req, res) => { success(res, null, 'Setting updated'); };
