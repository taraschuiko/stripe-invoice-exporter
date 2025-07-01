require('dotenv').config();
const fs = require('fs');
const https = require('https');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Downloads invoices from Stripe for the specified month
 * @param {number} year - Year (e.g., 2025)
 * @param {number} month - Month (1-12)
 */
async function downloadInvoices(year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1)).getTime() / 1000;
  const end = new Date(Date.UTC(year, month, 1)).getTime() / 1000;

  const invoices = await stripe.invoices.list({
    created: { gte: start, lt: end },
    limit: 100,
  });

  if (!invoices.data.length) {
    console.log('No invoices found for this month.');
    return;
  }

  for (const invoice of invoices.data) {
    if (!invoice.invoice_pdf) {
      console.log(`Invoice ${invoice.id} has no PDF yet.`);
      continue;
    }

    const url = invoice.invoice_pdf;

    const monthFolder = `${year}-${month.toString().padStart(2, '0')}`;
    const monthPath = `./invoices/${monthFolder}`;
    fs.mkdirSync(monthPath, { recursive: true });

    const filePath = `${monthPath}/${invoice.number || invoice.id}.pdf`;
    const file = fs.createWriteStream(filePath);

    const download = (url, filePath, resolve, reject) => {
      https.get(url, (response) => {
        if (response.statusCode === 302 && response.headers.location) {
          download(response.headers.location, filePath, resolve, reject);
          return;
        }
        if (response.statusCode !== 200) {
          console.error(`Failed to download ${url}: ${response.statusCode}`);
          file.close();
          fs.unlinkSync(filePath);
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Saved invoice to ${filePath}`);
          resolve();
        });
      }).on('error', (err) => {
        console.error(`Error downloading ${url}: ${err.message}`);
        file.close();
        fs.unlinkSync(filePath);
        reject(err);
      });
    };

    await new Promise((resolve, reject) => {
      download(url, filePath, resolve, reject);
    });
  }
}

(async () => {
  const args = process.argv.slice(2);
  const year = parseInt(args[0], 10);
  const month = parseInt(args[1], 10);
  if (!year || !month) {
    console.error('Usage: node index.js <year> <month>');
    process.exit(1);
  }
  fs.mkdirSync('./invoices', { recursive: true });
  await downloadInvoices(year, month);
})();
