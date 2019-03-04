const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const mysql = require('mysql')
const secretPrivateKey = fs.readFileSync('./secretPrivateKey.txt', 'utf8')
const app = express()

/**
 * 解析请求体
 */
app.use(bodyParser.json())

/**
 * 连接MySQL数据库
 */
const connection = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'vuetssql'
})
connection.connect(function(err) {
  if (err) {
    console.error('数据库连接失败' + err.message)
    return
  }
 
  console.log('数据库连接成功！')
})

// 对所有进入的请求都提前做一层过滤，设置CORS
app.all('*', (req, res, next) => {
  // CORS
  res.append('Access-Control-Allow-Origin', '*')
  res.append('Access-Control-Allow-Methods', '*')
  res.append('Access-Control-Allow-Headers', 'content-type')
  next()
})

/**
 * 登录接口
 * 
 * @path: /login
 * @method: post
 * @data: { username, password }
 */
app.post('/login', (req, res) => {
  const username = req.body.username
  const password = Buffer.from(req.body.password, 'base64').toString()
  if (username === 'admin') {
    if (password === 'admin') {
      const token = jwt.sign({name: username}, secretPrivateKey, {
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

/**
 * 数据库查询函数
 * 
 * @param {*} sql 
 */
function sqlQuery(sql) {
  connection.query(sql, function (error, results, fields) {
    if (error) throw error
    return results
  })
}

/**
 * 获取用户信息接口
 * 
 * @path: /info
 * @method: get
 * @params: { token }
 */
app.get('/info', (req, res) => {
  const token = req.query.token
  const { name: username } = jwt.verify(token, secretPrivateKey)
  const userSqlData = sqlQuery(`SELECT * from user where user_name="${username}"`)
  console.log(userSqlData)
  const roleIdSqlData = sqlQuery(`SELECT role_id from user_role where user_id="${userSqlData[0].user_id}"`)
  console.log(userSqlData, roleIdSqlData)
  res.send({
    code: 200,
    data: {
      name: 'admin',
      userId: '1',
      roles: ['admin', 'superadmin']
    },
    message: '请求成功！'
  })
})

// 监听端口
app.listen(3000, () => console.log('Listening on port 3000'))