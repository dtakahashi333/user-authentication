const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get("/employees", async (req, res) => {
  try {
    // Read the employee data.
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "data.json"), {
        encoding: "utf-8",
      })
    );
    // Use JSend format for a JSON response.
    return res.json({
      status: "success",
      ...data,
    });
  } catch (err) {
    return res.status(404).json({
      status: "failure",
      data: null,
    });
  }
});

module.exports = router;
