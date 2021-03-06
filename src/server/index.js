const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");
//webpack handling
const { createProxyMiddleware } = require("http-proxy-middleware");

//api routes
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");

//express
const app = express();
app.use(express.static(__dirname + ".." + ".." + "/public"));
//body-parser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//DB config
const config = {
  autoIndex: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
const db = require("./config/keys").mongoURL;

//connect to mongoDb
mongoose
  .connect(db, config)
  .then(() => console.log("Mongo DB Connected"))
  .catch((err) => console.log(err));

//passport middleware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

//wepack proxy
//app.use('/api/users', createProxyMiddleware({ target: 'http://localhost:5000', changeOrigin: true }));
//use routes
app.use("/api/users", users);
app.use("/api/profile", profile);

//app.use("/", (req,res) => res.send("Hello World"));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running at port ${port}`));
