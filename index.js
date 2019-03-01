const express = require('express')
const app = express()

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
  res.send('Hello ts!')
})

// 监听端口
app.listen(3000, () => console.log('Listening on port 3000'))