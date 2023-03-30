// Group Project
// Members:
//  Tom Boban : 8810744
// Shradhdha Parekh : 8816439

const express = require("express");
const router = require("./routes/route");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const moment = require("moment");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const userModel = require("./models/user");

const isAuth = require("./middleware/auth");
const Appoinment = require("./models/appointment");

const app = express();
global.isAuth = false;
global.allUsers = [];

//to use ejs file
app.set("view engine", "ejs");
// In order for css files to work
app.use(express.static(__dirname + "/public"));

app.use("/", router);

app.listen(3000, () => {
  console.log("App is really running on port 3000!!!");
});

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://tom:tom123@GDriver.gvnvvvc.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,

    useUnifiedTopology: true,
  },
  (error) => {
    if (error) {
      console.log("MongoDb is not connected successfully");
    } else {
      console.log("MongoDb is connected successfully");
    }
  }
);

const store = new MongoDBStore({
  uri: "mongodb+srv://tom:tom123@GDriver.gvnvvvc.mongodb.net/?retryWrites=true&w=majority",
  collection: "sessions_data",
});

const oneDay = 1000 * 60 * 60 * 24;

app.use(
  session({
    secret: "A Secret String to Sign the Cookie",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
    store: store,
  })
);

// Register

app.get("/register", (req, res) => {
  res.render("register", {
    userType: "Default",
    userId: null,
    msg: "",
  });
});

app.post("/register", async (req, res) => {
  let msg = "";
  const { email, password, confPassword, userType } = req.body;

  let user = await userModel.findOne({ email });

  if (user) {
    msg = "existing user";
    res.render("login.ejs", {
      msg: msg,
      userType: user.userType,
      userId: user._id,
    });
  } else {
    if (email && password == confPassword && password != "") {
      req.session.isAuth = true;
      msg = "new user";
      const hashedPwd = await bcrypt.hash(password, 12);

      user = new userModel({
        email,
        password: hashedPwd,
        userType,
      });
      await user.save();

      res.render("login.ejs", { msg: msg, userType: "Default", userId: null });
    } else {
      // console.log("incorrect");
      res.render("register.ejs", {
        msg: "Invalid Credentials",
        userType: "Default",
        userId: null,
      });
    }
  }
});

// Login

app.get("/login", (req, res) => {
  res.render("login.ejs", {
    msg: "Welcome",
    userType: "Default",
    userId: null,
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  const allDetails = await Appoinment.find({
    isTimeSlotAvailable: false,
  }).populate("user");

  // console.log(allDetails, "all");
  allDetails.map((i) => {
    allUsers.push(i);
  });

  // console.log(allUsers, "allUsers");

  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.isAuth = true;
      req.session.userId = user._id;
      req.session.userType = user.userType;
      req.session.userDetails = user;

      res.render("dashboard.ejs", {
        userType: user.userType,
        userId: user._id,
        msg: "",
      });
    } else {
      res.render("login", {
        userType: "",
        userId: null,
        msg: "Incorrect Password",
      });
    }
  } else {
    res.redirect("/register");
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    msg = "existing user";
    allUsers = [];
    res.redirect("/login");
  });
});

// Dashboard Page
app.get("/", isAuth, (req, res) => {
  const username = req.session;
  // console.log(username, "username");

  res.render("dashboard.ejs", {
    userType: username.userType,
    userId: username.userId,
    msg: "",
  });
});

// G2 Page

app.get("/g2_page", isAuth, async (req, res) => {
  const username = req.session;
  // console.log(username, "username");
  const userDetails = await userModel.findOne({ _id: username.userId });
  req.session.userDetails = userDetails;

  const findType = await Appoinment.find({ user: username.userId });
  console.log(findType, "find");

  res.render("g2_page.ejs", {
    userType: username.userType,
    userId: username.userId,
    userDetails: [userDetails],
    findDate: [],
    moment: moment,
    TestType: findType[0]?.TestType,
    findResult: findType[0]?.testResult,
  });
});

app.post("/g2_page", isAuth, (req, res) => {
  const username = req.session;

  userModel.findByIdAndUpdate(
    username.userId,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      licenseNumber: req.body.licenseNumber,
      age: req.body.age,
      dob: req.body.dob,
      car_details: {
        make: req?.body?.make,
        model: req.body.model,
        year: req.body.year,
        plateNumber: req.body.plateNumber,
      },
    },
    (error, dataCreated) => {
      if (error) {
        console.log("Data not created in db");
        console.log(error);
      } else {
        res.redirect("/");
      }
    }
  );
});

// G Page

app.get("/g_page", isAuth, async (req, res) => {
  const username = req.session;
  // console.log(username, "username");

  const userList = await userModel.findOne({ _id: username.userId });
  const findType = await Appoinment.find({ user: username.userId });
  // console.log(userList, "UList");

  res.render("g_page.ejs", {
    userType: username.userType,
    userId: username.userId,
    moment: moment,
    findDate: [],
    userList,
    TestType: findType[0]?.TestType,
    findResult: findType[0]?.testResult,
  });
});

// app.post("/g_page", isAuth, async (req, res) => {
//   const username = req.session;
//   const userList = await userModel.findOne({ _id: username.userId });
//   if (userList.length > 0) {
//     res.render("g_page", { userList: userList, moment: moment });
//   } else {
//     res.redirect("/g2_page");
//   }
// });

app.post("/update_User", async (req, res) => {
  const username = req.session;

  const userList = await userModel.find({ _id: username.userId });

  try {
    if (userList.length > 0) {
      await userModel.findOneAndUpdate(username.userId, {
        ...req.body,
        licenseNumber: req.body.licenseNumber,
        car_details: {
          make: req?.body?.make,
          model: req.body.model,
          year: req.body.year,
          plateNumber: req.body.plateNumber,
        },
      });
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
});

// Appointment Page
app.get("/appointment", (req, res) => {
  const username = req.session;
  res.render("appointment", {
    userType: username.userType,
    userId: username.userId,
    msg: "",
  });
});

app.post("/appointment", async (req, res) => {
  // console.log(req.body, "appo");

  console.log(req.session, "sess");
  const username = req.session;
  const dates = await Appoinment.find({});

  let matchDate = false;

  if (dates?.length == 0) {
    matchDate = true;
  }
  dates?.map((item) => {
    if (
      item.dateSelected == req.body.dateSelected &&
      item.starttimeslot != req.body.starttimeslot
    ) {
      matchDate = true;
    } else if (item.dateSelected != req.body.dateSelected) {
      matchDate = true;
    } else {
      matchDate = false;
    }
  });

  if (matchDate) {
    await Appoinment.create({
      dateSelected: req.body.dateSelected,
      starttimeslot: req.body.starttimeslot,
      endtimeslot: req.body.endtimeslot,
      isTimeSlotAvailable: true,
      msg: "",
    });

    res.redirect("/");
  } else {
    res.render("appointment", {
      userType: username.userType,
      userId: username.userId,
      msg: "Selected time slot is already booked, Book another time slot for this date",
    });
  }
});

app.post("/findDate", async (req, res) => {
  const username = req.session;
  const userDetails = await userModel.findOne({ _id: username.userId });
  const searchDate = req.body.drvDate;
  // console.log(req.body, "fbody");

  const findDate = await Appoinment.find({ dateSelected: searchDate });

  const findType = await Appoinment.find({ user: username.userId });

  req.session.findDate = findDate;

  // console.log(findDate, "find");

  let timeAvailable = findDate.filter(
    (temp) => temp.isTimeSlotAvailable == true
  );
  // console.log(timeAvailable, "avail");
  if (timeAvailable) {
    res.render("g2_page", {
      userType: username.userType,
      userId: username.userId,
      userDetails: [userDetails],
      moment: moment,

      msg: "",
      findDate: timeAvailable,
      TestType: findType[0]?.TestType,
      findResult: findType[0]?.testResult,
    });
  } else {
    res.redirect("/");
  }
});

app.post("/selectDate", async (req, res) => {
  const username = req.session;
  const userDetails = await userModel.findOne({ _id: username.userId });
  const selectedTime = req.body.dateSelected;
  // console.log(selectedTime, "sd");

  const changeTime = await Appoinment.find({ starttimeslot: selectedTime });
  const findType = await Appoinment.find({ user: username.userId });

  if (
    changeTime &&
    changeTime[0].isTimeSlotAvailable &&
    changeTime[0].TestType != "G2"
  ) {
    let timeId = changeTime[0]._id;

    await Appoinment.findByIdAndUpdate(timeId, {
      isTimeSlotAvailable: false,
      TestType: "G2",
      user: req.session.userId,
      // testResult: false,
    });
    res.redirect("/");
  } else {
    res.render("/g2_page", {
      userType: username.userType,
      userId: username.userId,
      userDetails: [userDetails],
      findDate: [],
      moment: moment,
      TestType: findType[0]?.TestType,
      findResult: findType[0]?.testResult,
    });
  }
});

app.post("/findGDate", async (req, res) => {
  const username = req.session;

  const searchDate = req.body.drvDate;
  // console.log(req.body, "fbody");
  const userList = await userModel.findOne({ _id: username.userId });
  const findDate = await Appoinment.find({ dateSelected: searchDate });
  const findType = await Appoinment.find({ user: username.userId });

  req.session.findDate = findDate;

  // console.log(findDate, "find");

  let timeAvailable = findDate.filter(
    (temp) => temp.isTimeSlotAvailable == true
  );
  // console.log(timeAvailable, "avail");

  if (timeAvailable) {
    res.render("g_page", {
      userType: username.userType,
      userId: username.userId,
      userList: userList,
      moment: moment,
      TestType: findType[0]?.TestType,
      msg: "",
      findDate: timeAvailable,
      findResult: findType[0]?.testResult,
    });
  } else {
    res.redirect("/");
  }
});

app.post("/selectGDate", async (req, res) => {
  const username = req.session;
  const userDetails = await userModel.findOne({ _id: username.userId });
  const selectedTime = req.body.dateSelected;
  // console.log(selectedTime, "sd");

  const changeTime = await Appoinment.find({ starttimeslot: selectedTime });
  console.log(changeTime, "select");
  if (
    changeTime &&
    changeTime[0].isTimeSlotAvailable &&
    changeTime[0].TestType != "G"
  ) {
    let timeId = changeTime[0]._id;
    await Appoinment.findByIdAndUpdate(timeId, {
      isTimeSlotAvailable: false,
      TestType: "G",
      user: req.session.userId,
      // testResult: false,
    });
    res.redirect("/");
  }
});

// Examiner Page

app.get("/examiner", async (req, res) => {
  const username = req.session;
  console.log(allUsers, "all");

  res.render("examiner", {
    userType: username.userType,
    userId: username.userId,
    msg: "",
    allUsers,
  });
});

// User Profile

app.get("/userProfile/:id", async (req, res) => {
  const username = req.session;
  console.log(req.params.id, "params");
  req.session.param = req.params.id;

  const userInfo = await Appoinment.find({
    _id: req.params.id,
  }).populate("user");
  // console.log(userInfo, "info");

  res.render("userProfile", {
    userType: username.userType,
    userId: username.userId,
    msg: "",
    userInfo,
  });
});

app.post("/userResult", async (req, res) => {
  // console.log(req.body.result, "body");
  const username = req.session;

  if (req.body.result == "Pass") {
    await Appoinment.findByIdAndUpdate(username.param, {
      testResult: true,
    });
  } else if (req.body.result == "Fail") {
    await Appoinment.findByIdAndUpdate(username.param, {
      testResult: false,
    });
  }

  res.render("dashboard.ejs", {
    userType: username.userType,
    userId: username.userId,
    msg: "",
  });
});

// Candidate Page

app.get("/candidate", async (req, res) => {
  const username = req.session;

  res.render("candidate.ejs", {
    userType: username.userType,
    userId: username.userId,
    msg: "",
    allUsers,
  });
});
