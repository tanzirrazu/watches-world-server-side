const express = require("express");
const { MongoClient } = require("mongodb");
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
      res.json(gets);
    });
    // get limit products
    app.get("/addproducts", async (req, res) => {
      const products = productsCollection.find().limit(6);
      const recive = await products.toArray();
      res.send(recive);
      res.json(recive);
    });
    // get all products
    app.get("/allproducts", async (req, res) => {
      const products = productsCollection.find({});
      const recive = await products.toArray();
      res.send(recive);
      res.json(recive);
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
