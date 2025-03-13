const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://TPC-game-2:20359212389@tpc-game-2.twsfr.mongodb.net/?retryWrites=true&w=majority&appName=TPC-game-2";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
