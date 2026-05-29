import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace literal .png/.jpg/.jpeg strings for /images/ and /gambar/
  const newContent = content.replace(/(\/images\/|\/gambar\/)([\w\-\s()]+)\.(png|jpe?g)/gi, '$1$2.webp');
  
  if (newContent !== content) {
    content = newContent;
    changed = true;
  }

  // Also catch API responses like item.image_url by appending .replace
  // In Home.jsx
  if (filePath.includes('Home.jsx')) {
    if (content.includes('bg: item.image_url,')) {
      content = content.replace(/bg: item\.image_url,/g, "bg: item.image_url?.replace(/\\.(png|jpe?g)$/i, '.webp'),");
      content = content.replace(/cardImg: item\.image_url,/g, "cardImg: item.image_url?.replace(/\\.(png|jpe?g)$/i, '.webp'),");
      changed = true;
    }
    // Also lazy loading for specials
    if (content.includes('<img alt={item.name} className="w-full h-full')) {
      content = content.replace('<img alt={item.name} className="w-full h-full', '<img loading="lazy" alt={item.name} className="w-full h-full');
      changed = true;
    }
    if (content.includes('<img alt={item.title} className="w-full h-full')) {
      content = content.replace('<img alt={item.title} className="w-full h-full', '<img loading="lazy" alt={item.title} className="w-full h-full');
      changed = true;
    }
  }

  // Cart.jsx and MyOrders.jsx and Reservation.jsx dynamically use API data, 
  // but they have fallbacks like `/images/booking_fee.png` that are caught by the regex above.
  // Wait, if item.img in Cart.jsx is from DB, it might be .jpg. Let's fix that.
  if (filePath.includes('Cart.jsx')) {
    if (content.includes('src={item.img}')) {
       // it actually does:
       // src={
       //   ...
       //   (item.img || '/images/booking_fee.png')
       // }
       content = content.replace(/\(item\.img \|\|/g, "(item.img?.replace(/\\.(png|jpe?g)$/i, '.webp') ||");
       changed = true;
    }
  }

  if (filePath.includes('MyOrders.jsx')) {
     if (content.includes('item.item_image ||')) {
       content = content.replace(/item\.item_image \|\|/g, "item.item_image?.replace(/\\.(png|jpe?g)$/i, '.webp') ||");
       changed = true;
     }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      fixFile(fullPath);
    }
  }
}

walkDir('./src');
