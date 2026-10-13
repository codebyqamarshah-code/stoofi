const IssueBook = require('../models/IssueBook');
const Book = require('../models/Book');

exports.getAll = async (req, res) => {
  try {
    const data = await IssueBook.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await IssueBook.create(req.body);
    // Decrement available copies if bookId provided
    if (req.body.bookId) {
      await Book.findByIdAndUpdate(req.body.bookId, { $inc: { quantity: -1 } }).catch(() => {});
    }
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const prev = await IssueBook.findById(req.params.id);
    const data = await IssueBook.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });

    // If returned and was previously not returned, restore book quantity
    if (req.body.status === 'returned' && prev?.status !== 'returned' && data.bookId) {
      await Book.findByIdAndUpdate(data.bookId, { $inc: { quantity: 1 } }).catch(() => {});
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await IssueBook.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
