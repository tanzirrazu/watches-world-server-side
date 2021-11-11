const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

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

    // post rating
    app.post("/addrating", async (req, res) => {
      const testimonial = req.body;
      const result = await reviewCollection.insertOne(testimonial);
      res.json(result);
    });
    // post products
    app.post("/addproducts", async (req, res) => {
      const products = req.body;
      const sends = await productsCollection.insertOne(products);
      res.json(sends);
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
    // post orders
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const orders = await orderCollection.insertOne(order);
      console.log(orders);
      res.send(orders);
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
