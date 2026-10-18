const { MongoClient } = require('d:/Astittva Emergent version 4/backend/node/node_modules/mongodb');
require('d:/Astittva Emergent version 4/backend/node/node_modules/dotenv').config({ path: 'd:/Astittva Emergent version 4/backend/.env' });

(async () => {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  const db = client.db('astitva_realestate');
  const props = await db.collection('properties').find({}).toArray();
  props.slice(0, 16).forEach((p, i) => {
    console.log(`[${i+1}] ID: ${p._id} | project_name: "${p.project_name}"`);
    console.log('    featured_image:', p.featured_image);
    console.log('    images:', p.images);
  });
  await client.close();
})();
