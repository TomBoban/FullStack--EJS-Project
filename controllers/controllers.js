const path = require("path");
const isAuth = require('../middleware/auth')

const dashboard = (req, res) => {
  res.render("dashboard.ejs");
};

const g_page = (req, res) => {
  let userList = null;
  res.render("g_page.ejs", { userList });
};
const g2_page = (req, res) => {
  res.render("g2_page.ejs");
};
const login = (req, res) => {
  const msg = "Welcome";
  res.render("login.ejs");
};
module.exports = {
  dashboard,
  g_page,
  g2_page,
  login,
};
