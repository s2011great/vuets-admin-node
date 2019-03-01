const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const secretPrivateKey = fs.readFileSync('./secretPrivateKey.txt', 'utf8')
const app = express()

app.use(bodyParser.json())

// 对所有进入的请求都提前做一层过滤，设置CORS
app.all('*', (req, res, next) => {
  // CORS
  res.append('Access-Control-Allow-Origin', '*')
  res.append('Access-Control-Allow-Methods', '*')
  res.append('Access-Control-Allow-Headers', 'content-type')
  next()
})

// 登录接口
app.post('/login', (req, res) => {
  const username = req.body.username
  const password = Buffer.from(req.body.password, 'base64').toString()
  if (username === 'admin') {
    if (password === 'admin') {
      let token = jwt.sign({name: username}, secretPrivateKey, {
        expiresIn: 60*60*1  // 1小时过期
      })
      res.send({
        code: 200,
        data: {
          token
        },
        message: '登陆成功！'
      })
    } else {
      res.send({
        code: 500,
        data: {},
        message: '用户名或密码错误，请重试！'
      })
    }
  } else {
    res.send({
      code: 500,
      data: {},
      message: '用户名或密码错误，请重试！'
    })
  }
})

// 监听端口
app.listen(3000, () => console.log('Listening on port 3000'))