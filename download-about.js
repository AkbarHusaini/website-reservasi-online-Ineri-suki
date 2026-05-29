import https from 'https';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const urls = [
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgKAOzBaUVcmpYxQoihpdqJdx7KxNA7JWmbM1ef6sAuUpJhM9Cm1lSQZSNDLYzlcHMMjEFFABXVtA-tmV-8i8OmSeMJW49osuspjFxlsfFe0BzDzMRF9JFn6iMhSPWNBgec4OS923lJjs-UKFBtontRDjaUqpO48JTVQa2qbEGScMaDMoyfj1HT4zcM5yoONjPjA83Jsnnh9qVRG6avW_CSJgSl2Iss3UqL_vE6wOvPMUlMYp-bkEfHVYPbI_NwZJ0V6dCjQpn11d8',
    dest: './public/gambar/about-hero.webp',
    width: 1200
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuubmmh6cjl6mQPSmYs2R3K9tN66aYHsPFO2W6QX4H5py72NK7B5FNH5Mc0BRxQBNIX7PWrE2BF64UOx_zSUd4dm11tXladzVYgh0XVFE70LaRyy7ZWIn1ZfnAM-bTr2PR0CAg7o5KIKgB3GFJwwylKB9Swz20vzYrqTR1a_kKFOOMqnar98-WUA1TTJc0Rsr64Re09nn8sD1dPVGV51Oq32t9mgMSe5CX7MUGr_aVclnii2S6y9-6RVGoTV8BRitpxA1LuYjFMr8K',
    dest: './public/gambar/about-story.webp',
    width: 800
  }
];

async function downloadAndCompress({ url, dest, width }) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading and processing ${dest}...`);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }

      const transform = sharp()
        .resize({ width: width, withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 });

      response
        .pipe(transform)
        .pipe(fs.createWriteStream(dest))
        .on('finish', () => {
          console.log(`Saved ${dest}`);
          resolve();
        })
        .on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  for (const item of urls) {
    try {
      await downloadAndCompress(item);
    } catch (err) {
      console.error(err);
    }
  }
}

run();
