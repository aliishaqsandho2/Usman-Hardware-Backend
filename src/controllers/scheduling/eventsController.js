const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => { success(res, [], 'Events list'); };
exports.getOne = async (req, res) => { success(res, {}, 'Event details'); };
exports.create = async (req, res) => { success(res, { id: 1, ...req.body }, 'Event created', 201); };
exports.update = async (req, res) => { success(res, { id: req.params.id, ...req.body }, 'Event updated'); };
exports.delete = async (req, res) => { success(res, null, 'Event deleted'); };
exports.getByDate = async (req, res) => { success(res, [], 'By Date'); };
exports.getByRange = async (req, res) => { success(res, [], 'By Range'); };
exports.getByType = async (req, res) => { success(res, [], 'By Type'); };
exports.getByCustomer = async (req, res) => { success(res, [], 'By Customer'); };
exports.getByPriority = async (req, res) => { success(res, [], 'By Priority'); };
exports.getByStatus = async (req, res) => { success(res, [], 'By Status'); };
exports.updateStatus = async (req, res) => { success(res, null, 'Status updated'); };
exports.getUpcoming = async (req, res) => { success(res, [], 'Upcoming'); };
exports.getToday = async (req, res) => { success(res, [], 'Today'); };
