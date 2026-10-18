const { MongoClient } = require('d:/Astittva Emergent version 4/backend/node/node_modules/mongodb');
require('d:/Astittva Emergent version 4/backend/node/node_modules/dotenv').config({ path: 'd:/Astittva Emergent version 4/backend/.env' });

(async () => {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  const db = client.db('astitva_realestate');
  const files = await db.collection('files').find({}).limit(10).toArray();
  console.log('Sample files in files collection:');
  console.log(JSON.stringify(files, null, 2));
  await client.close();
})();
