const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

//require both Schema
const User = require('../models/User');
const Contact = require('../models/Contact');

// get, get all users in contact, private
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.json(contacts);
  } catch (err) {
    console.error(err.msg);
    res.status(500).send('Server Error ');
  }
});

// post, add all contact, private
router.post(
  '/',
  [auth, [check('name', 'Name is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, phone, type } = req.body;
    try {
      const newContact = new Contact({
        name,
        email,
        phone,
        type,
        user: req.user.id,
      });

      const contact = await newContact.save();
      res.json(contact);
    } catch (err) {
      console.error(err.msg);
      status(500).send('Server Error');
    }
  }
);

// put api/contacts/:id, update contact, private
router.put('/:id', auth, async (req, res) => {
  const { name, email, phone, type } = req.body;
  //build contact objects
  const contactFields = {};
  if (name) contactFields.name = name;
  if (email) contactFields.email = email;
  if (phone) contactFields.phone = phone;
  if (type) contactFields.type = type;

  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: 'contacts not found' });

    if (contact.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not authorized' });

    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: contactFields },
      { new: true }
    );

    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// delete api/contacts/:id, delete contact, private
router.delete('/:id', auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: 'contacts not found' });

    if (contact.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not authorized' });

    await Contact.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Contact Removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
