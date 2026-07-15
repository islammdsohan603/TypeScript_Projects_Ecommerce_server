import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import Stripe from 'stripe'; // 🌟 Stripe ইম্পোর্ট করা হয়েছে

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Stripe ইনিশিয়ালাইজ করা
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27.acacia' as any, // লেটেস্ট স্টেবল API ভার্সন
});

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
    const ordersCollection = database.collection('orders'); // 🌟 অর্ডার ট্র্যাক করার জন্য (ঐচ্ছিক)

    // Home Route
    app.get('/', (req: Request, res: Response) => {
      res.send('E-commerce Server is Running');
    });

    // ==========================================
    // 💳 STRIPE CHECKOUT API ROUTE START
    // ==========================================
    app.post(
      '/api/create-checkout-session',
      async (req: Request, res: Response) => {
        try {
          const { cartItems, userEmail } = req.body;

          if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty!' });
          }

          // কার্ট আইটেমগুলোকে Stripe-এর নিজস্ব ফরম্যাটে কনভার্ট করা
          const line_items = cartItems.map((item: any) => {
            // ইমেজের অ্যারে হ্যান্ডেল করা (যদি string বা array থাকে)
            let itemImages: string[] = [];
            if (item.images) {
              itemImages = Array.isArray(item.images)
                ? item.images
                : [item.images];
            }

            return {
              price_data: {
                currency: 'usd', // অথবা আপনার কারেন্সি ('bdt', 'inr')
                product_data: {
                  name: item.title || item.name,
                  images: itemImages.filter(img => img.startsWith('http')), // শুধুমাত্র ভ্যালিড URL পাঠাবে
                },
                // Stripe এ পয়সা/সেন্ট (Cents) এ হিসাব হয়, তাই ১০০ দিয়ে গুণ ও রাউন্ড করা হয়েছে
                unit_amount: Math.round(Number(item.price) * 100),
              },
              quantity: item.quantity || 1,
            };
          });

          const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

          // Stripe সেশন তৈরি করা
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            customer_email: userEmail || undefined,
            // পেমেন্ট সফল বা ব্যর্থ হলে কোন ফ্রন্টএন্ড পেজে রিডাইরেক্ট হবে
            success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientUrl}/payment/failed`,
            metadata: {
              userEmail: userEmail || 'guest',
            },
          });

          res.json({ id: session.id, url: session.url });
        } catch (error: any) {
          console.error('🔴 Stripe Session Error:', error);
          res.status(500).json({
            message: 'Stripe Payment Initialization Failed',
            error: error.message,
          });
        }
      },
    );
    // ==========================================
    // 💳 STRIPE CHECKOUT API ROUTE END
    // ==========================================

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

    // users api get
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

        const existingItem = await cartCollection.findOne({
          productId,
          userEmail,
        });

        if (existingItem) {
          await cartCollection.updateOne(
            { productId, userEmail },
            { $inc: { quantity: 1 } },
          );
          return res
            .status(200)
            .json({ message: 'Product quantity updated in cart' });
        }

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

    // Get cart data
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

    // update Quantity
    app.patch(
      '/api/cart/update-quantity',
      async (req: Request, res: Response) => {
        try {
          const { itemId, quantity } = req.body;

          if (!itemId || quantity === undefined) {
            return res.status(400).json({
              success: false,
              message: 'Item ID and Quantity are required',
            });
          }

          if (!ObjectId.isValid(itemId)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid Item ID format',
            });
          }

          const newQuantity = Number(quantity);
          if (isNaN(newQuantity) || newQuantity < 1) {
            return res.status(400).json({
              success: false,
              message: 'Quantity must be a valid number and at least 1',
            });
          }

          const filter = { _id: new ObjectId(itemId) };
          const updateDoc = {
            $set: {
              quantity: newQuantity,
            },
          };

          const result = await cartCollection.updateOne(filter, updateDoc);

          if (result.matchedCount === 0) {
            return res.status(404).json({
              success: false,
              message: 'Cart item not found',
            });
          }

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
  console.log(`🚀 Server running on: http://localhost:${port}`);
});
