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

    // post testimonial
    app.post("/addrating", async (req, res) => {
      const testimonial = req.body;
      const result = await reviewCollection.insertOne(testimonial);
      res.json(result);
    });
    // get testimonial
    app.get("/addrating", async (req, res) => {
      const ratingget = reviewCollection.find({});
      const gets = await ratingget.toArray();
      res.send(gets);
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
