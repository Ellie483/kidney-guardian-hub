const MythFact = require('../models/mythfact.model');

// CREATE
exports.createMythFact = async (req, res) => {
  try {
    const newContent = new MythFact(req.body);
    const savedContent = await newContent.save();
    res.status(201).json(savedContent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ ALL
exports.getAllMythFacts = async (req, res) => {
  try {
    const contents = await MythFact.find().sort({ createdAt: -1 });
    res.json(contents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ SINGLE
exports.getMythFactById = async (req, res) => {
  try {
    const content = await MythFact.findById(req.params.id);
    if (!content) return res.status(404).json({ error: "Not found" });
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateMythFact = async (req, res) => {
  try {
    const updated = await MythFact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
exports.deleteMythFact = async (req, res) => {
  try {
    const deleted = await MythFact.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
