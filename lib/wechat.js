const fs = require('fs')
const request = require('request-promise')
const { wechat } = require('./config')
const Token = require('../schema/token')

class Wechat {

  // 验证token
  validToken (token) {
    if (!token || !token.expires_in) {
      return false
    } else {
      return token.expires_in > new Date().getTime()
    }
  }
  // 从微信获取 access_token
  async getTokenFromWechat () {
    const url = `${wechat.baseUrl}/token?grant_type=client_credential&appid=${wechat.appID}&secret=${wechat.appSecret}`
    const data = JSON.parse(await request({ url }))
    return data
  }

  // 获取token
  async getAccessToken () {
    const dbToken = await Token.getAccessToken()
    if (dbToken && dbToken.token && this.validToken(dbToken)) {
      console.log('dbToken')
      return dbToken
    } else {
      let wechatToken = await this.getTokenFromWechat()
      wechatToken.expires_in = (wechatToken.expires_in - 20) * 1000 + new Date().getTime()
      await Token.saveAccessToken(wechatToken)
      console.log('wechatToken')
      return wechatToken
    }
  }
  // 上传素材
  async uploadMaterial (type, material, permanent = false) {
    const token = await this.getAccessToken()
    
    console.log(token)
    let form = {
      media: fs.createReadStream(material)
    }
    let uploadUrl = `${wechat.baseUrl}/media/upload?access_token=${token.token}&type=${type}`
    const opts = {
      method: 'post',
      url: uploadUrl,
      json: true,
      formData: form
    }
    const data = await request(opts)
    return data
  }
}

module.exports = new Wechat()