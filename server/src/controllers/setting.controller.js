const Setting = require('../models/Setting');

const OFFICIAL_COLLEGE_ADDRESS = 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura';

// @desc    Get School General Settings
// @route   GET /api/setting
// @access  Public / Protected
exports.getSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({ address: OFFICIAL_COLLEGE_ADDRESS });
    } else if (
      !setting.address ||
      setting.address === 'Sharaqpur Sharif, Sheikhupura, Punjab, Pakistan' ||
      setting.address.includes('Model Town, Lahore') ||
      setting.address === 'Sharaqpur Sharif, District Sheikhupura'
    ) {
      setting.address = OFFICIAL_COLLEGE_ADDRESS;
      await setting.save();
    }
    res.status(200).json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update School General Settings
// @route   PUT /api/setting
// @access  Protected (Super Admin, Admin)
exports.updateSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create(req.body);
    } else {
      setting = await Setting.findByIdAndUpdate(setting._id, req.body, {
        new: true,
        runValidators: true
      });
    }
    res.status(200).json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
