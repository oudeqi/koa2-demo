const Koa = require('koa')
const sha1 = require('sha1')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const config = require('./lib/config')
const index = require('./routes/index')
const users = require('./routes/users')

// error handler
onerror(app)

// 微信认证
app.use(async (ctx, next) => {
  console.log(ctx.query)
  const {signature, timestamp, nonce, echostr} = ctx.query
  const token = config.wechat.token
  let str = [token, timestamp, nonce].sort().join('')
  const sha = sha1(str)
  if (sha === signature) {
    ctx.body = echostr
  } else {
    ctx.body = 'wrong'
  }
})

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

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
