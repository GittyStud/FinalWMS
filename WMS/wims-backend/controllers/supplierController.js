const { Supplier, AuditLog } = require("../models");

// GET ALL
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({ order: [["name", "ASC"]] });
    res.json({ success: true, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE
exports.createSupplier = async (req, res) => {
  try {
    const { name, contact_person, email, phone, address } = req.body;
    const supplier = await Supplier.create({ name, contact_person, email, phone, address });

    await AuditLog.create({
      user_id: req.user.id,
      action: "CREATE_SUPPLIER",
      details: `Added supplier: ${name}`,
      ip_address: req.ip
    });

    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create supplier." });
  }
};

// UPDATE
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);
    if (!supplier) return res.status(404).json({ success: false, message: "Not found" });

    await supplier.update(req.body);

    await AuditLog.create({
      user_id: req.user.id,
      action: "UPDATE_SUPPLIER",
      details: `Updated supplier: ${supplier.name}`,
      ip_address: req.ip
    });

    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed." });
  }
};

// DELETE
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);
    if (!supplier) return res.status(404).json({ success: false, message: "Not found" });

    await supplier.destroy();

    await AuditLog.create({
      user_id: req.user.id,
      action: "DELETE_SUPPLIER",
      details: `Deleted supplier: ${supplier.name}`,
      ip_address: req.ip
    });

    res.json({ success: true, message: "Supplier deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed (check for linked orders)." });
  }
};