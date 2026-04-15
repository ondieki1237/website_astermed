import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environmental variables
dotenv.config();

// Apply stealth plugin to avoid Cloudflare/Bot blocks
puppeteer.use(StealthPlugin());

const url = 'https://www.vimeldental.com/dental-materials.html';

async function run() {
  console.log('Connecting to MongoDB...');
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('No MONGODB_URI in .env');

  let dbConnected = false;
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully.');
    dbConnected = true;
  } catch (err) {
    console.error('⚠️ Database connection failed (EHOSTUNREACH). Are you sure your IP is whitelisted in MongoDB Atlas?');
    console.warn('⚠️ PROCEEDING WITHOUT DB: We will save the scraped data to a local file instead.');
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new', // Use the new headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log(`Navigating to ${url}...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch(e) {
    console.error('Failed to load page:', e.message);
    await browser.close();
    process.exit(1);
  }
  
  console.log('Page loaded, parsing content...');
  const html = await page.content();
  const $ = cheerio.load(html);
  
  // We'll try common e-commerce CSS classes (Magento/Shopify)
  const products = [];
  
  // Try to find product blocks
  $('.product-item, .product.type-product, .grid-item, [class*="product"]').each((i, el) => {
    // Attempt standard selectors
    let name = $(el).find('.product-item-name, .product-title, h2, h3').text().trim();
    let image = $(el).find('img').attr('src');
    let priceStr = $(el).find('.price, .amount').first().text().trim();
    
    // Fallbacks
    if (!image) {
      image = $(el).find('img').attr('data-src');
    }

    if (name && image) {
      // Remove excessive whitespace/newlines
      name = name.replace(/\s+/g, ' ');

      // prevent duplicates in our rough array
      if (!products.some(p => p.name === name)) {
        products.push({ name, image, priceStr, category: 'Dental Materials' });
      }
    }
  });

  if (products.length === 0) {
    console.log('⚠️ Could not extract products using generic selectors. Saving HTML to /tmp/vimel_debug.html to inspect specific class names.');
    fs.writeFileSync('/tmp/vimel_debug.html', html);
  } else {
    console.log(`✅ Extracted ${products.length} products visually from the main page!`);
    console.log('Example target:', products[0]);
    console.log('Writing raw extracted JSON to /tmp/vimel_products.json for preview...');
    fs.writeFileSync('/tmp/vimel_products.json', JSON.stringify(products, null, 2));
    
    
    if (dbConnected) {
      // In the next phase: Use Mongoose to save `products`
      console.log('Database connected: ready to map and insert products.');
    } else {
      console.log('Skipping DB insert due to missing connection.');
    }
  }
  
  await browser.close();
  if (dbConnected) {
    await mongoose.disconnect();
  }
}

run().catch(err => {
  console.error("Unhandled error in scraper:", err);
  process.exit(1);
});
