const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const config = require('./lib/config')
const wechatAuth = require('./middleware/wechat-auth')
const { connect } = require('./middleware/connect')
const index = require('./routes/index')
const users = require('./routes/users')
const wechat = require('./lib/wechat')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

// 连接数据库
app.use(connect(config.db))

// wechat.getAccessToken().then((token) => {
//   console.log('token-------------------')
//   console.log(token)
// }).catch(err => {
//   console.log(err)
// })

// 微信认证
app.use(wechatAuth(config.wechat))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`______${ctx.method} ${ctx.url} - ${ms}ms__________`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
