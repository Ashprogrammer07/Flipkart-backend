const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

// Define the Cart schema
const Cart = mongoose.model(
  "Cart",
  new mongoose.Schema({
    userId: String,
    items: [
      {
        productId: String,
        quantity: Number,
      },
    ],
    status: {
      type: String,
      default: "active",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  })
);

// Add item to cart
router.post("/cart/add", async (req, res) => {
  try {
    const { productId, quantity = 1, user } = req.body;

    if (!productId || !user) {
      return res.status(400).json({ message: "Product or user not provided" });
    }

    let cart = await Cart.findOne({ userId: user, status: "active" });

    if (!cart) {
      cart = new Cart({ userId: user, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      cart.items.push({ productId, quantity: parseInt(quantity) });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({ message: "Item added to cart", cart });
  } catch (err) {
    console.error("Add to cart error:", err);
    res
      .status(500)
      .json({ error: "Internal server error, item not added" });
  }
});

// Get all carts
router.get("/carts", async (req, res) => {
  try {
    const carts = await Cart.find({});
    res.status(200).json({
      success: true,
      count: carts.length, // ✅ fixed: was "cart.length" instead of "carts.length"
      data: carts,
    });
  } catch (error) {
    console.error("Error fetching carts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch carts",
      error: error.message,
    });
  }
});

// Optional: Delete entire cart by user ID
router.delete("/cart/:userId", async (req, res) => {
  try {
    const deleted = await Cart.findOneAndDelete({ userId: req.params.userId });
    if (!deleted) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json({ message: "Cart deleted successfully" });
  } catch (err) {
    console.error("Delete cart error:", err);
    res.status(500).json({ error: "Failed to delete cart" });
  }
});

module.exports = router;
