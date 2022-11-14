const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
saltRounds = 10;

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  //비밀번호를 암호화, 디비에 저장하기 전에 거치는 함수를 만들 수 있음.
  let user = this;
  console.log("22");
  // 비밀번호가 변경될 때만 암호화
  if (user.isModified("password")) {
    console.log("x");
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) {
          console.log(err);
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  let user = this;

  let token = jwt.sign(user._id.toHexString(), "secretToken");

  user.token = token;
  console.log(user);
  user.save(function (err, user) {
    if (err) return cb(err);
    return cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  let user = this;

  jwt.verify(token, "secretToken", function (err, decoded) {
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) {
        return cb(err);
      } else {
        cb(null, user);
      }
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
