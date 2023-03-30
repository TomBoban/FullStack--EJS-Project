const express = require("express");
const {
  dashboard,
  g_page,
  g2_page,
  login,
} = require("../controllers/controllers");



const router = express.Router();

// router.get("/dashboard", dashboard);
// router.get("/g_page", g_page);
// router.get("/g2_page", g2_page);
// router.get("/login", login);

module.exports = router;
