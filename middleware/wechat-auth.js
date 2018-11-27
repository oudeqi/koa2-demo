const sha1 = require('sha1')
const rawBody = require('raw-body')
const { tpl } = require('../lib/util')

const wechat = require('../lib/wechat')
const { resolve } = require('path')

const { parseXML, formatMessage } = require('../lib/util')

module.exports = (config) => {
  return async (ctx, next) => {
    console.log('ctx.query')
    console.log(ctx.query)
    const { signature, timestamp, nonce, echostr } = ctx.query
    let str = [config.token, timestamp, nonce].sort().join('')
    const sha = sha1(str)
    if (ctx.method === 'GET') {
      if (sha === signature) {
        ctx.body = echostr
      } else {
        ctx.body = 'wrong'
      }
    } else if (ctx.method === 'POST') {
      // if (sha !== signature) return ctx.body = '你不是微信公众平台的请求，请不要捣乱！'
      const data = await rawBody(ctx.req, {
        length: ctx.length,
        limit: '1mb',
        encoding: ctx.charset
      })
      const content = await parseXML(data)
      const message = formatMessage(content.xml)
      const picUrl = resolve(__dirname, '../docs/girl.png')
      let material = await wechat.uploadMaterial('image', picUrl)
      console.log('material---')
      console.log(material)
      const xml = tpl({ type: 'image', mediaId: material.media_id }, message)

      // const xml = `
      //   <xml>
      //     <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
      //     <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
      //     <CreateTime>${parseInt(new Date().getTime() / 1000)}</CreateTime>
      //     <MsgType><![CDATA[${message.MsgType}]]></MsgType>
      //     <Content><![CDATA[${message.Content}]]></Content>
      //     <MsgId>${message.MsgId}</MsgId>
      //   </xml>
      // `

      console.log('xml---------------------------')
      console.log(xml)
      ctx.status = 200
      ctx.type = 'application/xml'
      ctx.body = xml
    }
  }
}