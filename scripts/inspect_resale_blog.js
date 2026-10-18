const { connectToDatabase, getDb } = require('../backend/node/db');

async function main() {
  await connectToDatabase();
  const db = getDb();
  const blog = await db.collection('blogs').findOne({
    title: { $regex: 'Resale vs Under-Construction', $options: 'i' }
  });
  console.log('Blog found:', JSON.stringify(blog, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
