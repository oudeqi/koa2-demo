const mongoose = require('mongoose')
const { resolve } = require('path')
const glob = require('glob')

mongoose.Promise = global.Promise

const initSchemas = () => {
  glob.sync(resolve(__dirname, '../schema', '**/*.js')).forEach((i) => {
    console.log('------------------------------------')
    console.log(i)
    require(i)
  })
}

const connect= (config) => {
  return async (ctx, next) => {
    let maxConnectTimes = 0
    await new Promise(resolve => {
      if (process.env.NODE_ENV !== 'production') {
        mongoose.set('debug', true)
      }
      mongoose.connect(config)
      mongoose.connection.on('disconnect', () => {
        maxConnectTimes++
        if (maxConnectTimes < 5) {
          mongoose.connect(config)
        } else {
          throw new Error('数据库挂了吧少年')
        }
      })
      mongoose.connection.on('error', err => {
        maxConnectTimes++
        console.log(err)
        if (maxConnectTimes < 5) {
          mongoose.connect(config)
        } else {
          throw new Error('数据库挂了吧少年')
        }
      })
      mongoose.connection.on('open', () => {
        resolve()
        console.log('Mongodb connected!')
      })
    })
    await next()
  }
}

module.exports = {
  connect,
  initSchemas
}