import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = "mongodb+srv://TPC-game-2:20359212389@tpc-game-2.twsfr.mongodb.net/?retryWrites=true&w=majority&appName=TPC-game-2";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
});

export async function POST(req) {
  let clientInstance;
  try {
    const body = await req.json();
    if (!body.points || !body.pagePoints) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required data' }), { status: 400 });
    }

    console.log("Connecting to MongoDB with URI:", uri);
    clientInstance = await client.connect();
    console.log("Connected to MongoDB");

    const db = clientInstance.db('star-quiz');
    const scoresCollection = db.collection('scores');

    const scoreData = {
      points: body.points,
      pagePoints: body.pagePoints,
      totalScore: body.points.reduce((sum, point) => sum + point, 0),
      starType: body.starType || 'Unknown',
      createdAt: new Date(),
    };

    const result = await scoresCollection.insertOne(scoreData);
    return new Response(JSON.stringify({ success: true, message: 'Score saved', id: result.insertedId }), { status: 200 });
  } catch (error) {
    console.error("MongoDB connection or operation error:", error);
    return new Response(JSON.stringify({ success: false, message: 'Could not save to database', error: error.message }), { status: 500 });
  } finally {
    if (clientInstance) await clientInstance.close();
  }
}
