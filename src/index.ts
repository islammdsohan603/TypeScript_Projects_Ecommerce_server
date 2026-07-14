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
    const cartCollection = database.collection('cart');

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

        if (!ObjectId.isValid(id)) {
          return res
            .status(400)
            .json({ message: 'Invalid Products ID format' });
        }

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

    // Add to Cart API
    app.post('/api/cart/add', async (req: Request, res: Response) => {
      try {
        const { productId, title, price, images, userEmail } = req.body;

        if (!userEmail) {
          return res
            .status(401)
            .json({ message: 'Unauthorized! Please login first.' });
        }

        // ইউজার ইতিমধ্যে এই প্রোডাক্টটি কার্টে যোগ করেছে কিনা চেক করা (ঐচ্ছিক কিন্তু বেস্ট প্র্যাকটিস)
        const existingItem = await cartCollection.findOne({
          productId,
          userEmail,
        });

        if (existingItem) {
          // যদি আগে থেকেই থাকে তবে কোয়ান্টিটি ১ বাড়িয়ে দেওয়া
          await cartCollection.updateOne(
            { productId, userEmail },
            { $inc: { quantity: 1 } },
          );
          return res
            .status(200)
            .json({ message: 'Product quantity updated in cart' });
        }

        // নতুন কার্ট আইটেম অবজেক্ট তৈরি
        const cartItem = {
          productId,
          title,
          price,
          images,
          userEmail,
          quantity: 1,
          addedAt: new Date(),
        };

        const result = await cartCollection.insertOne(cartItem);
        res
          .status(201)
          .json({ message: 'Product added to cart successfully', result });
      } catch (error) {
        console.error('🔴 Error in Add to Cart API:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    // Get  cart data
    app.get('/api/cart/data', async (req: Request, res: Response) => {
      try {
        const email = req.query.email as string;

        if (!email) {
          return res.status(400).json({ message: 'User email is required' });
        }

        const query = { userEmail: email };
        const result = await cartCollection.find(query).toArray();

        res.json(result);
      } catch (error) {
        console.error('Error fetching cart data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
    // delete item from cart

    app.delete('/api/cart/delete/:id', async (req: Request, res: Response) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: 'Invalid Item ID' });
        }

        const result = await cartCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Item not found in cart' });
        }

        res.json({ message: 'Item removed from cart successfully' });
      } catch (error) {
        console.error('Error deleting cart item:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    // updata Quantity

    app.patch(
      '/api/cart/update-quantity',
      async (req: Request, res: Response) => {
        try {
          const { itemId, quantity } = req.body;

          // ১. ভ্যালিডেশন চেক (ডাটা ঠিকঠাক এসেছে কিনা)
          if (!itemId || quantity === undefined) {
            return res.status(400).json({
              success: false,
              message: 'Item ID and Quantity are required',
            });
          }

          // ২. মঙ্গোডিবি আইডি ফরম্যাট ভ্যালিডেশন
          if (!ObjectId.isValid(itemId)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid Item ID format',
            });
          }

          // ৩. কোয়ান্টিটি যেন ১ এর নিচে না নামতে পারে
          const newQuantity = Number(quantity);
          if (isNaN(newQuantity) || newQuantity < 1) {
            return res.status(400).json({
              success: false,
              message: 'Quantity must be a valid number and at least 1',
            });
          }

          // ৪. ডাটাবেজে আপডেট অপারেশন চালানো
          const filter = { _id: new ObjectId(itemId) };
          const updateDoc = {
            $set: {
              quantity: newQuantity,
            },
          };

          // আপনার কালেকশনের নাম অনুযায়ী এটি পরিবর্তন করতে পারেন (যেমন: cartCollection)
          const result = await cartCollection.updateOne(filter, updateDoc);

          // ৫. আইটেমটি ডাটাবেজে খুঁজে না পাওয়া গেলে
          if (result.matchedCount === 0) {
            return res.status(404).json({
              success: false,
              message: 'Cart item not found',
            });
          }

          // ৬. সাকসেস রেসপন্স
          return res.status(200).json({
            success: true,
            message: 'Quantity updated successfully',
            updatedQuantity: newQuantity,
          });
        } catch (error) {
          console.error('Error updating cart quantity:', error);
          return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
          });
        }
      },
    );

    await client.db('admin').command({ ping: 1 });
    console.log('✅ MongoDB Ping Success');
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.error);

app.listen(port, () => {
  console.log(`🚀 Server running on:${port}`);
});
