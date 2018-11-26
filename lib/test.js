const request = require('request-promise')
const { wechat } = require('./config')
const baseUrl = 'https://api.weixin.qq.com/cgi-bin/token'
const url = `${baseUrl}?grant_type=client_credential&appid=${wechat.appID}&secret=${wechat.appSecret}`


const getAccessToken = async (opts) => {
  const data = await request(opts)
  console.log(data)
  return data
} 

getAccessToken({ url }).then((data) => {
  
  console.log('------------------------------------------')
  console.log(data)
})