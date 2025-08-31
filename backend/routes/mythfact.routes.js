const express = require('express');
const router = express.Router();
const mythFactController = require('../controllers/mythfact.controller');

// CREATE
router.post('/', mythFactController.createMythFact);

// READ ALL
router.get('/', mythFactController.getAllMythFacts);

// READ SINGLE
router.get('/:id', mythFactController.getMythFactById);

// UPDATE
router.put('/:id', mythFactController.updateMythFact);

// DELETE
router.delete('/:id', mythFactController.deleteMythFact);

module.exports = router;
