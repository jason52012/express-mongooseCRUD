const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Student = require("./models/student");
const methodOverride = require("method-override");
const app = express();

/*
 * app.js execute order => module.require -> middleware -> route
 * middleware ref => http://expressjs.com/zh-tw/api.html#middleware-callback-function-examples
 * example => app.use(function (req, res, next) {
                  next()
              })
*/
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));
app.use(function (req, res, next) {
  console.log("first");
  next();
});
// app.use(function (req, res, next) {
// console.log("second");
// // res.send("stop going specific route");
// next();
// });

const studentMiddleWare = (req, res, next) => {
  console.log("student middleware");
  next();
};

//specific route middleware
// app.use("/student", function (req, res, next) {
//   console.log("specific middleware");
//   // res.send("stop going specific route");
//   next();
// });

app.get("/student", studentMiddleWare, (req, res) => {
  res.render("index.ejs");
});

// connect to mongoDB
mongoose
  .connect("mongodb://localhost:27017/exampledb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDb"))
  .catch((err) => {
    console.log("Connected fail");
    console.err(err);
  });

app.get("/", (req, res) => {
  res.render("index.ejs");
});

// go to select all student
app.get("/students", async (req, res) => {
  try {
    let students = await Student.find({});
    res.render("studentList.ejs", { students: students });
  } catch (e) {
    res.send("fail to get students list ");
  }
});

// go to inset page
app.get("/students/insert", (req, res) => {
  res.render("studentInsert.ejs");
});

// go to select all student
app.get("/students/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let student = await Student.findOne({ id: id });
    res.render("studentPersonalPage.ejs", { student: student });
  } catch (e) {
    res.send("fail to get students list ");
  }
});

// do insert
app.post("/students/insert", (req, res) => {
  let { id, name, age, merit, other } = req.body;
  let newStudent = new Student({
    id,
    name,
    age,
    scholarShip: {
      merit,
      other,
    },
  });

  newStudent
    .save()
    .then(() => {
      console.log("save successfully");
      res.redirect("/students");
    })
    .catch((e) => {
      console.log("save unsuccessfully");
      res.send("save unsuccessfully");
    });
});

// go to update page
app.get("/students/update/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let student = await Student.findOne({ id: id });

    if (student != null) {
      res.render("studentUpdate.ejs", { student: student });
    } else {
      res.send("fail to find student by ID: " + id);
    }
  } catch (e) {
    res.send("fail to get students list ");
  }
});

// do update
app.put("/students/update", async (req, res) => {
  console.log(req.body);
  let { id, name, age, merit, other } = req.body;
  try {
    let student = await Student.findOneAndUpdate(
      { id: id },
      {
        id,
        name,
        age,
        scholarShip: {
          merit,
          other,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.redirect(`/students/${student.id}`);
  } catch (e) {
    console.err(e);
    res.send("error update");
  }
});

// do delete
app.delete("/students/delete/:id", (req, res) => {
  let { id } = req.params;
  Student.deleteOne({ id: id })
    .then(() => {
      res.send("delete successfully");
    })
    .catch((e) => {
      res.send("delete unsuccessfully");
    });
});

class newData {
  constructor() {}
  setProperty(key, value) {
    if (key !== "merit" && key !== "other") {
      this[key] = value;
    } else {
      this[`scholarShip.${key}`] = value;
    }
  }
}

// do patch
app.patch("/students/:id", async (req, res) => {
  let { id } = req.params;
  let newObject = new newData();

  for (let property in req.body) {
    newObject.setProperty(property, req.body[property]);
  }
  try {
    let student = await Student.findOneAndUpdate({ id: id }, newObject, {
      new: true,
      runValidators: true,
    });
    res.send({ student: student });
  } catch (e) {
    console.err(e);
    res.send("error update");
  }
});

// error handler -> async funciton
// app.get("/", async (req, res, next) => {
//   try {
//     let foundDate = Student.findOned({ id: 100 });
//     res.send(foundDate);
//   } catch (e) {
//     next(e);
//   }
// });

// validator error need to be caught by .catch() *****
// go to select all student
// app.get("/", async (req, res, next) => {
//   try {
// let student = await Student({
//   id: 105,
//   name: "JACKY",
//   age: 81,
//   scholarShip: {
//     merit: -1,
//     other: 0,
//   },
// });
// student.save().then(() => {
//   res.send("save successfully");
// }).catch(e){
//   res.send("save unsuccessfully");
// };
//     await Student.findOneAndUpdate(
//       { id: 105 },
//       { scholarShip: { merit: -1 } },
//       { new: true, runValidators: true },
//       (err, doc) => {
//         if (err) {
//           res.send(err);
//         } else {
//           res.send(doc);
//         }
//       }
//     );
//   } catch (e) {
//     next(e);
//   }
// });

// error handler for universal route
app.get("/*", (req, res) => {
  res.status(404).send("404 Page not found.");
});

// error handler for mormal error
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Something is broken. We will fix it soon.");
});

app.listen("3000", () => {
  console.log("port 3000 is running now.");
});
