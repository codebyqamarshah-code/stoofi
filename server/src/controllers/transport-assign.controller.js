const TransportAssignVehicle = require('../models/TransportAssignVehicle');
const TransportRoute = require('../models/TransportRoute');
const TransportVehicle = require('../models/TransportVehicle');

exports.getAll = async (req, res) => {
  try {
    const assigns = await TransportAssignVehicle.find().sort({ createdAt: -1 }).lean();
    const routeIds = assigns.map(a => a.routeId).filter(Boolean);
    const vehicleIds = assigns.map(a => a.vehicleId).filter(Boolean);

    const [routes, vehicles] = await Promise.all([
      TransportRoute.find({ _id: { $in: routeIds } }).lean(),
      TransportVehicle.find({ _id: { $in: vehicleIds } }).lean()
    ]);

    const routeMap = new Map(routes.map(r => [String(r._id), r]));
    const vehicleMap = new Map(vehicles.map(v => [String(v._id), v]));

    const data = assigns.map(a => {
      const r = routeMap.get(String(a.routeId));
      const v = vehicleMap.get(String(a.vehicleId));
      return {
        ...a,
        routeTitle: r?.title || a.routeTitle || 'Unknown Route',
        fare: r?.fare !== undefined ? r.fare : (a.fare || 0),
        vehicleNo: v?.vehicleNo || a.vehicleNo || 'Unknown Vehicle',
        driverName: v?.driverName || a.driverName || 'Unassigned',
        capacity: v?.capacity !== undefined ? v.capacity : (a.capacity || 0),
        contact: v?.contact || a.contact || 'N/A'
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { routeId, vehicleId } = req.body;
    if (!routeId || !vehicleId) {
      return res.status(400).json({ success: false, message: 'Route and Vehicle are required' });
    }

    const [route, vehicle] = await Promise.all([
      TransportRoute.findById(routeId).lean(),
      TransportVehicle.findById(vehicleId).lean()
    ]);

    const data = await TransportAssignVehicle.create({
      routeId,
      vehicleId,
      routeTitle: route?.title || '',
      fare: route?.fare || 0,
      vehicleNo: vehicle?.vehicleNo || '',
      driverName: vehicle?.driverName || '',
      capacity: vehicle?.capacity || 0,
      contact: vehicle?.contact || ''
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await TransportAssignVehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await TransportAssignVehicle.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
