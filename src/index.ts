import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = process.env.MONGO_DB_URI;

if (!uri) {
  throw new Error('MONGO_DB_URI is not defined in .env file');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log('✅ MongoDB Connected');

    const database = client.db('Ecommerce');
    const productsCollection = database.collection('products');

    // Home Route
    app.get('/', (req: Request, res: Response) => {
      res.send('E-commerce Server is Running');
    });

    // Get featured Products
    app.get('/api/featured-products', async (req: Request, res: Response) => {
      try {
        const product = await productsCollection
          .find({ featured: true })
          .limit(4)
          .toArray();
        res.json(product);
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    await client.db('admin').command({ ping: 1 });

    console.log('✅ MongoDB Ping Success');
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.error);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
