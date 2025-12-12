const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => { success(res, [], 'Employees list'); };
exports.getOne = async (req, res) => { success(res, {}, 'Details'); };
exports.create = async (req, res) => { success(res, { id: 1, ...req.body }, 'Created', 201); };
exports.update = async (req, res) => { success(res, { id: req.params.id, ...req.body }, 'Updated'); };
exports.delete = async (req, res) => { success(res, null, 'Deleted'); };
exports.search = async (req, res) => { success(res, [], 'Search'); };
exports.getByStatus = async (req, res) => { success(res, [], 'By Status'); };
exports.toggleStatus = async (req, res) => { success(res, null, 'Status toggled'); };
exports.updateSalary = async (req, res) => { success(res, null, 'Salary updated'); };
exports.export = async (req, res) => { success(res, 'url', 'Exported'); };
