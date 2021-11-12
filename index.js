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
    const userCollection = database.collection("users");

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
    // delete all Orders
    app.delete("/allOrders/:id", async (req, res) => {
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
