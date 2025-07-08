const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const ejs = require('ejs');
const path = require('path');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');


// READ
router.get('/index', async (req, res) => {
  const items = await Item.find();
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  res.render('index', { items, date });
  //res.render('index');
});

//HOME
router.get('/', async (req, res) => {
  res.render('home');
});

//Read Home
router.post('/search', async (req, res) => {
  const searchTerm = req.body.product;
  try {
    const item = await Item.find({ product: searchTerm });
    if (item) {
      res.render('search', { item, searchTerm});
    } else {
      res.send('No product found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal error');
  }
});

//Add 
router.get('/create', async(req, res) => {
  //const product = req.body.product;
  res.render('insert');
});

// CREATE
router.post('/items', async (req, res) => {
  const { product, price, quantity, unit } = req.body;
  await Item.create({ product, price, quantity, unit });
  res.redirect('/index');
});

// UPDATE form
router.get('/items/:id/edit', async (req, res) => {
  const item = await Item.findById(req.params.id);
  res.render('edit', { item });
});

// UPDATE
router.put('/items/:id', async (req, res) => {
  const { product, price, quantity, unit } = req.body;
  await Item.findByIdAndUpdate(req.params.id, { product, price, quantity, unit });
  res.redirect('/index');
});

// DELETE
router.delete('/items/:id', async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.redirect('/index');
});

// PDF DOWNLOAD
router.get('/download-pdf', async (req, res) => {
  try {
    const items = await Item.find();
    const date = new Date().toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = await ejs.renderFile(
      path.join(__dirname, '../views/pdf-template.ejs'),
      { items, date }
    );

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '40px', bottom: '60px' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=stock-report.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('PDF generation failed');
  }
});

// EMAIL PDF
router.post('/email-pdf', async (req, res) => {
  const recipientEmail = req.body.recipientEmail;

  if (!recipientEmail) {
    return res.status(400).send('Recipient email is required.');
  }

  try {
    const items = await Item.find();
    const date = new Date().toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = await ejs.renderFile(
      path.join(__dirname, '../views/pdf-template.ejs'),
      { items, date }
    );

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '40px', bottom: '60px' },
    });

    await browser.close();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'youremail.com',
        pass: 'apppasskey', // use app password for Gmail
      },
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: recipientEmail,
      subject: 'Stock Report PDF',
      text: 'Attached is the stock report you requested.',
      attachments: [
        {
          filename: 'stock-report.pdf',
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.send(`<p>Email successfully sent to <strong>${recipientEmail}</strong>.</p><a href="/index">Back</a>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to send email');
  }
});


module.exports = router;
