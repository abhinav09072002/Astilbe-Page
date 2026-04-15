import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Example: return dummy count OR fetch from DB
    res.json({
      success: true,
      count: 100   // replace with real DB count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching count"
    });
  }
});

export default router;