const sha1 = require('sha1')
const rawBody = require('raw-body')

const {
  parseXML,
  formatMessage
} = require('./util')

module.exports = (config) => {
  return async (ctx, next) => {
    console.log(ctx.query)
    const {
      signature,
      timestamp,
      nonce,
      echostr
    } = ctx.query
    let str = [config.token, timestamp, nonce].sort().join('')
    const sha = sha1(str)
    if (ctx.method === 'GET') {
      if (sha === signature) {
        ctx.body = echostr
      } else {
        ctx.body = 'wrong'
      }
    } else if (ctx.method === 'POST') {
      if (sha !== signature) return ctx.body = 'wrong'
      const data = await rawBody(ctx.req, {
        length: ctx.length,
        limit: '1mb',
        encoding: ctx.charset
      })
      const content = await parseXML(data)
      console.log(content)
      const message = formatMessage(content.xml)
      console.log('message')
      console.log(message)
      ctx.status = 200
      ctx.type = 'application/xml'
      const xml = `
        <xml>
          <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
          <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
          <CreateTime>${parseInt(new Date().getTime() / 1000)}</CreateTime>
          <MsgType><![CDATA[${message.MsgType}]]></MsgType>
          <Content><![CDATA[${message.Content}]]></Content>
          <MsgId>${message.MsgId}</MsgId>
        </xml>
      `
      console.log(xml)
      ctx.body = xml
    }
  }
}