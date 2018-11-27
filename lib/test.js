const mongoose = require('mongoose')
const config = require('./config')
const wechat = require('./wechat')

mongoose.connect(config.db)
mongoose.connection.on('disconnect', () => {
  throw new Error('数据库挂了吧少年')
})
mongoose.connection.on('error', err => {
  throw new Error('数据库挂了吧少年')
})
mongoose.connection.on('open', () => {
  console.log('Mongodb connected!')

  wechat.xxx().then(data => {
    console.log('data')
    console.log(data)
  }).catch(err => {
    console.log(err)
  })


})

