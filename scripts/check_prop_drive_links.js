const { MongoClient } = require('d:/Astittva Emergent version 4/backend/node/node_modules/mongodb');
require('d:/Astittva Emergent version 4/backend/node/node_modules/dotenv').config({ path: 'd:/Astittva Emergent version 4/backend/.env' });
const https = require('https');

function checkHead(url) {
  return new Promise(resolve => {
    https.get(url, res => {
      resolve({ status: res.statusCode, location: res.headers.location, type: res.headers['content-type'] });
    }).on('error', e => resolve({ error: e.message }));
  });
}

(async () => {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  const db = client.db('astitva_realestate');
  const props = await db.collection('properties').find({}).toArray();
  
  console.log(`Checking ${props.length} properties...`);
  for (let i = 0; i < props.length; i++) {
    const p = props[i];
    const driveImg = (p.images || []).find(img => typeof img === 'string' && (img.includes('drive.google.com') || img.includes('/d/')));
    const driveIdMatch = driveImg?.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
    const driveId = driveIdMatch ? driveIdMatch[1] : null;
    
    let info = 'NO DRIVE LINK';
    if (driveId) {
      const res = await checkHead(`https://lh3.googleusercontent.com/d/${driveId}=w200`);
      info = `driveId: ${driveId} -> status: ${res.status} (${res.type})`;
    }
    console.log(`[${i+1}] ${p.project_name} | ${info}`);
  }
  await client.close();
})();
