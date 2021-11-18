const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");

const fileupload = require("express-fileupload");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(fileupload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tgypl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = await client.db("watches_world");
    const reviewCollection = database.collection("reviews");
    const productsCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    const userCollection = database.collection("users");
    // post rating
    app.post("/addrating", async (req, res) => {
      const fullName = req.body.fullName;
      const rate = req.body.rate;
      const description = req.body.description;
      const designation = req.body.designation;
      const pic = req.files.photurl;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const allinfo = {
        fullName,
        rate,
        description,
        designation,
        photurl: imageBuffer,
      };
      const result = await reviewCollection.insertOne(allinfo);
      res.json(result);
    });
    // post products
    app.post("/addproducts", async (req, res) => {
      const modelName = req.body.modelName;
      const price = req.body.price;
      const rate = req.body.rate;
      const color = req.body.color;
      const standby = req.body.standby;
      const description = req.body.description;
      const pic = req.files.imgUrl;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const allInfo = {
        modelName,
        price,
        rate,
        color,
        standby,
        description,
        imageUrl: imageBuffer,
      };
      const result = await productsCollection.insertOne(allInfo);
      res.json(result);
    });
    // post users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });
    // upsert data for google sign in
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    // make admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // get admin role
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // get rating
    app.get("/addrating", async (req, res) => {
      const ratingget = reviewCollection.find({});
      const gets = await ratingget.toArray();
      res.send(gets);
    });
    // get limit products
    app.get("/addproducts", async (req, res) => {
      const products = productsCollection.find().limit(6);
      const recive = await products.toArray();
      res.send(recive);
    });
    // get all products
    app.get("/allproducts", async (req, res) => {
      const products = productsCollection.find({});
      const recive = await products.toArray();
      res.send(recive);
    });
    // get products id
    app.get("/allproducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });
    // delete all products
    app.delete("/allproducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });
    // post orders
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const orders = await orderCollection.insertOne(order);
      console.log(orders);
      res.send(orders);
    });
    // get all orders
    app.get("/allOrders", async (req, res) => {
      const order = orderCollection.find({});
      const orders = await order.toArray();
      res.send(orders);
    });
    // update orders status
    app.put("/updateStatus/:id", async (req, res) => {
      const id = req.params.id;
      const updated = req.body.status;
      const filter = { _id: ObjectId(id) };
      const result = await orderCollection.updateOne(filter, {
        $set: { status: updated },
      });
      res.send(result);
    });
    // get myOrders
    app.get("/myOrders/:email", async (req, res) => {
      const result = await orderCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });
    // delete myOrders
    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);

      res.send(result);
    });
    // for payment
    app.get("/payment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.send(result);
    });
    // delete all Orders
    app.delete("/allOrders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });
    // payment
    app.post("/create-payment-intent", async (req, res) => {
      const paymentInfo = req.body;
      const amount = paymentInfo.price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    });
    // paid
    app.put("/allOrders/:id", async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoce = {
        $set: {
          payment: payment,
        },
      };
      const result = await orderCollection.updateOne(filter, updateDoce);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
