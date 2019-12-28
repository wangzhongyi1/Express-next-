const express = require('express')
const {User} = require('./models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const SECRET = 'jjoa23jjf3ld' //生成token时需要的密钥

const app = express()
app.use(cors()) // 处理跨域中间件
app.use(express.json())// 允许解析客户端提交过来的JSON数据，中间件

app.get('/', async (req,res) => {
  res.send('ok')
})

app.post('/api/register', async (req,res) => {
  const user = await User.create({
    username: req.body.username,
    password: req.body.password
  })
  res.send(user)
})

app.post('/api/login',async (req,res) => {
  const user = await User.findOne({
    username: req.body.username
  })
  if(!user){
    return res.status(422).send({
      message: '用户名不存在！'
    })
  }
  // 使用 bcrypt 解码比对
  const isPasswordValid = bcrypt.compareSync(
    req.body.password,
    user.password
  )
  if(!isPasswordValid){
    return res.status(422).send({
      message: '密码无效'
    })
  }
  //生成 token ,{expiresIn: '1h'} 设置一小时过期时间
  const token = jwt.sign({
    id: String(user._id),
  },SECRET,{expiresIn: '1h'})

  res.send({
    user,
    token
  })
})

// 自定义一个 auth 中间件，在所有需要token验证的请求之前
const auth = async (req,res,next) => {
  // 从请求头中获取 token
  let authorization = String(req.headers.authorization.split(' ').pop())
  // 使用 jwt 验证 token
  try{
    const decoded = jwt.verify(authorization,SECRET)
    req.user = await User.findById(decoded.id)
    next()
  }catch(e){
    // token 验证不通过
    console.log(e,111222)
    return res.send({
      code: 422,
      message: 'token 验证不通过'
    })
  }
}

app.get('/api/profile', auth, async (req,res) => {
  res.send(req.user)
})


app.listen(5000, () => {
  console.log('server is running...')
})
