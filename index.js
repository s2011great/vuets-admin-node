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
const pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'vuetssql'
})
/**
 * 数据库查询函数
 * 
 * @param {*} sql 
 */
let sqlQuery =  function(sql) {
  // 返回Promise
  return new Promise((resolve, reject) => {
    pool.getConnection(function(error, connection) {
      if (error) {
        reject(error)
      } else {
        connection.query(sql, function (error, rows) {
          if (error) {
            reject(error)
          } else {
            resolve(rows)
          }
          // 结束会话
          connection.release()
        })
      }
    })
  })
}

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
 * 获取用户信息接口
 * 
 * @path: /info
 * @method: get
 * @params: { token }
 */
app.get('/info', async (req, res) => {
  const token = req.query.token
  const { name: username } = jwt.verify(token, secretPrivateKey)
  try {
    const userSqlData = await sqlQuery(`SELECT * from user where user_name="${username}"`)
    const roleIdSqlData = await sqlQuery(`SELECT role_id from user_role where user_id="${userSqlData[0].user_id}"`)
    let roles = []
    const name = userSqlData[0].name
    const userId = userSqlData[0].user_id
    for (let i = 0; i < roleIdSqlData.length; i++) {
      const roleId = roleIdSqlData[i].role_id
      let role = await sqlQuery(`SELECT name from role where id="${roleId}"`)
      roles.push(role[0].name)
    }
    res.send({
      code: 200,
      data: {
        name,
        userId,
        roles,
      },
      message: '请求成功！'
    })
  } catch (error) {
    res.send({
      code: 500,
      data: {},
      message: error,
    })
  }
})

// 监听端口
app.listen(3000, () => console.log('Listening on port 3000'))