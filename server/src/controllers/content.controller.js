const Content = require('../models/Content');

exports.create = async (req, res) => {
  try {
    const { contentType, youtubeLink, fileUrl, fileName, fileType, fileSize, title, className, section } = req.body;
    
    if (!contentType) {
      return res.status(400).json({ success: false, message: 'Content Type is required' });
    }

    const newContent = await Content.create({
      contentType,
      youtubeLink,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      title,
      className,
      section,
      uploadedBy: req.user._id
    });

    const populated = await Content.findById(newContent._id).populate('uploadedBy', 'firstName lastName username');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getList = async (req, res) => {
  try {
    const contents = await Content.find().populate('uploadedBy', 'firstName lastName username').lean().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Content.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

