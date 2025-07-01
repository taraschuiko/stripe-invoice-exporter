# Stripe Invoice Exporter

This tool downloads all Stripe invoices for a specified month and saves them as PDF files locally.

## Features
- Downloads all invoices for a given year and month from your Stripe account
- Saves each invoice as a PDF in the `invoices/` directory

## Prerequisites
- Node.js (v14 or higher recommended)
- A Stripe account and API Secret Key

## Setup
1. Clone this repository or copy the files to your project directory.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory and add your Stripe secret key:
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   ```

## Usage
Run the script with optional arguments for year and month:

```sh
node index.js [year] [month]
```
- `year`: The year for which to download invoices (e.g., 2025).
- `month`: The month (1-12) for which to download invoices.

Example:
```sh
node index.js 2025 6
```
This will download all invoices from June 2025.

## Output
- All downloaded invoices are saved as PDF files in the `invoices/` directory.

## Notes
- If an invoice does not have a PDF available, it will be skipped.
- The script creates the `invoices/` directory if it does not exist.

## License
MIT
