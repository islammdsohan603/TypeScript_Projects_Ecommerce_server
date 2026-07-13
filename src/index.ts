import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

    const usersCollection = database.collection('user');

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
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    // Get all products api
    app.get('/api/all-products', async (req: Request, res: Response) => {
      try {
        const category = req.query.category as string;
        const sort = req.query.sort as string;

        // pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        let query: any = {};
        if (category && category !== 'all') {
          query.category = category;
        }

        let sortOrder = 0;
        if (sort === 'low-to-high') {
          sortOrder = 1;
        } else if (sort === 'high-to-low') {
          sortOrder = -1;
        }

        const totalProducts = await productsCollection.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        let data;

        if (sortOrder === 0) {
          data = await productsCollection
            .find(query)
            .skip(skip)
            .limit(limit)
            .toArray();
        } else {
          data = await productsCollection
            .aggregate([
              { $match: query },
              {
                $addFields: {
                  finalPrice: {
                    $cond: {
                      if: {
                        $and: [
                          { $ifNull: ['$discountPrice', false] },
                          { $ne: ['$discountPrice', ''] },
                        ],
                      },
                      then: { $toDouble: '$discountPrice' },
                      else: { $toDouble: '$price' },
                    },
                  },
                },
              },
              { $sort: { finalPrice: sortOrder } },
              { $skip: skip },
              { $limit: limit },
            ])
            .toArray();
        }

        res.json({
          products: data,
          meta: {
            totalProducts,
            totalPages,
            currentPage: page,
          },
        });
      } catch (error) {
        console.error('🔴 Error in all-products API:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    // details page api

    app.get('/api/details/:id', async (req: Request, res: Response) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await productsCollection.findOne(query);

        if (!result) {
          return res.status(404).send({ message: 'Products not found' });
        }

        res.send(result);
      } catch (error) {}
    });

    //  users api get
    app.get('/api/users', async (req: Request, res: Response) => {
      try {
        const users = await usersCollection.find().toArray();
        res.json(users);
      } catch (error) {
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
