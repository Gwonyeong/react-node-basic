const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const authMiddle = require("./middleware/auth.js");
const { User } = require("./models/User.js");

const config = require("./config/key");

// application/x-www-form-urlencoded 처럼 생긴 데이터를 해석해줌
app.use(bodyParser.urlencoded({ extended: true })); //
app.use(cookieParser());

app.use(express.json());
const monoose = require("mongoose");

mongoose
  .connect(config.mongoURI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  console.log("root");
  res.send("root");
});

app.post("/api/users/register", (req, res) => {
  //회원 가입 시 필요한 정보를 가져오면 데이터베이스에 넣어주기
  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.post("/api/users/login", (req, res) => {
  // 요청된 이메일을 디비에서 찾기
  User.findOne(
    {
      email: req.body.email,
    },
    (err, user) => {
      if (!user) {
        return res.json({
          loginSuccess: false,
          message: "제공된 이메일에 해당하는 유저가 없습니다.",
        });
      }

      user.comparePassword(req.body.password, (err, isMatch) => {
        if (err) {
          console.log(err);
        }
        if (!isMatch) {
          return res.json({ loginSuccess: false, message: "비밀번호 틀림" });
        }
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);
          res
            .cookie("x_auth", user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id });
        });
      });
    }
  );

  // 요청된 이메일이 있다면 비밀번호가 맞는지 확인하기
  // 비밀번호가 같다면 token생성
});

app.get("/api/users/auth", authMiddle.auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", authMiddle.auth, (req, res) => {
  User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      token: "",
    },
    (err, user) => {
      if (err)
        return res.json({
          success: false,
          err,
        });
      res.status(200).send({
        success: true,
      });
    }
  );
});

app.listen(port, () => {
  console.log("connect server");
});
