const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const { router: authRoutes, authenticateJWT } = require("./auth.js");
const cartRoutes = require("./cart.js");

// ✅ Define Product model inside index.js
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,      // Optional: URL to image
  category: String     // Optional: Product category
});

const Product = mongoose.model("Product", productSchema);

app.use(authRoutes);
app.use(cartRoutes);

// ✅ GET all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ GET product by ID
app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(400).json({ message: "The item you are searching does not exist" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ MongoDB connection
mongoose.connect(
  'mongodb://ashprogrammer01:Ak@23032007@flipkart-clone.g2gjphq.mongodb.net/?retryWrites=true&w=majority&appName=Flipkart-clone',
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
  console.log("MongoDB connected successfully");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});

// ✅ Start the server
app.listen(8000, () => {
  console.log("Server is running successfully on port 8000");
});
