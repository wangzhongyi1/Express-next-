const mongoose = require('mongoose')
const bcrypt = require('bcryptjs') // bcryptjs用来加密用户密码

mongoose.connect('mongodb://localhost:27017/express-auth',{
  useCreateIndex: true,
  useNewUrlParser: true
})

const UserSchema = new mongoose.Schema({
  username: {type: String, unique: true}, //设置username唯一
  password: {
    type: String,
    set(val){
      return bcrypt.hashSync(val,10) //使用bcrypt来加密10次
    }
  },
})

const User = mongoose.model('User', UserSchema)

module.exports = {User}
