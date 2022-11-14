const { User } = require("../models/User");

let auth = (req, res, next) => {
  //인증처리를 담당

  // 1. 클라이언트 쿠키에서 토큰을 가져온다.
  // 2. 토큰을 복호화 한 후 유저를 찾는다.
  // 3. 유저가 있으면 인증 O
  // 4. 유저가 없으면 인증 X

  let token = req.cookies.x_auth;
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json({ isAuth: false, error: true });
    }
    //req에 넣어주면 미들웨어를 지난 이후 사용할 수 있게 됨.
    req.token = token;
    req.user = user;
    next();
  });
};

module.exports = {
  auth,
};
