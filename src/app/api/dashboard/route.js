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

export async function GET() {
  let clientInstance;
  try {
    clientInstance = await client.connect();
    const db = clientInstance.db('star-quiz');
    const scoresCollection = db.collection('scores');

    // จำนวนคนที่ทำแบบทดสอบทั้งหมด
    const totalParticipants = await scoresCollection.countDocuments();

    // คะแนนเฉลี่ย (totalScore)
    const averageScoreResult = await scoresCollection.aggregate([
      { $group: { _id: null, averageScore: { $avg: '$totalScore' } } }
    ]).toArray();
    const averageScore = averageScoreResult[0]?.averageScore || 0;

    // การกระจายของ starType
    const starTypeDistribution = await scoresCollection.aggregate([
      { $group: { _id: '$starType', count: { $sum: 1 } } }
    ]).toArray();

    // การกระจายของ totalScore
    const scoreDistribution = await scoresCollection.aggregate([
      {
        $bucket: {
          groupBy: '$totalScore',
          boundaries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          default: '10+',
          output: { count: { $sum: 1 } }
        }
      }
    ]).toArray();

    // การกระจายของ pagePoints (สำหรับ 5 หน้า)
    const pagePointsDistribution = await scoresCollection.aggregate([
      { $unwind: { path: '$pagePoints', includeArrayIndex: 'pageIndex' } },
      {
        $group: {
          _id: '$pageIndex',
          averagePoints: { $avg: '$pagePoints.points' }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // สร้าง pagePointsData โดยให้ครบ 5 หน้า
    const pagePointsData = {
      page1: pagePointsDistribution.find(item => item._id === 0)?.averagePoints || 0,
      page2: pagePointsDistribution.find(item => item._id === 1)?.averagePoints || 0,
      page3: pagePointsDistribution.find(item => item._id === 2)?.averagePoints || 0,
      page4: pagePointsDistribution.find(item => item._id === 3)?.averagePoints || 0,
      page5: pagePointsDistribution.find(item => item._id === 4)?.averagePoints || 0,
    };

    // Timeframe (จำนวนผู้ใช้ในแต่ละชั่วโมง)
    const timeFrameDistribution = await scoresCollection.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d %H:00',
              date: '$createdAt',
              timezone: '+00:00' // ปรับตาม timezone ที่ต้องการ
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    return new Response(JSON.stringify({
      success: true,
      data: {
        totalParticipants,
        averageScore: Number(averageScore.toFixed(2)),
        starTypeDistribution,
        scoreDistribution,
        pagePointsDistribution: pagePointsData,
        timeFrameDistribution,
      },
    }), { status: 200 });
  } catch (error) {
    console.error("MongoDB error in dashboard API:", error);
    return new Response(JSON.stringify({ success: false, message: 'Could not fetch dashboard data', error: error.message }), { status: 500 });
  } finally {
    if (clientInstance) await clientInstance.close();
  }
}
