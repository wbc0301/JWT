const Koa = require("koa");
const app = new Koa();
const route = require('koa-route');
var bodyParser = require('koa-bodyparser');
const jwt = require('jwt-simple');
const cors = require('@koa/cors');

const secret = 'your_secret_string'; // 加密用的SECRET字符串，可随意更改
app.use(bodyParser()); // 处理post请求的参数

// 登录接口
const login = ctx => {
  const req = ctx.request.body;
  const userName = req.userName;
  const expires = Date.now() + 1000 * 10; // 为了方便测试，设置超时时间为一分钟后

  const payload = {
    iss: userName,
    exp: expires
  };
  const Token = jwt.encode(payload, secret);  // 加密
  console.log(Token);
  ctx.response.body = {
    data: Token,
    msg: '登陆成功'
  };
}

// 获取用户名接口
const getUserName = ctx => {
  const token = ctx.get('authorization').split(" ")[1]; // 获取请求头，不区分大小写
  const payload = jwt.decode(token, secret);  // 解密

  // 每次请求只判断Token是否过期，不重新去更新Token过期时间(更新不更新Token的过期时间主要看实际的应用场景)
  if (Date.now() > payload.exp) {
    ctx.response.body = {
      errorMsg: 'Token已过期，请重新登录'
    };
  } else {
    ctx.response.body = {
      data: {
        username: payload.iss,
      },
      msg: '获取用户名成功',
      errorMsg: ''
    };
  }
}
app.use(cors());
app.use(route.post('/login', login));
app.use(route.get('/getUsername', getUserName));
app.listen(3200, () => { console.log('启动成功'); });
