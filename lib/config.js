 const config = {
  port: 3000,
  db: 'mongodb://localhost:27017/test',
  wechat: {
    appID: 'wxbe9627c9477c7a51',
    appSecret: '6a0276ff59b7923c4beab95792eb1033',
    token: 'KAc5165asd16131HcxvsdfasdHGFzxc5',
    baseUrl: 'https://api.weixin.qq.com/cgi-bin',
    EncodingAESKey: '9QloUmwAygwIANk914dC763kYcgQXZmrHoSZR7mkPZY'
  },
  ngrok: {
    clientID: '173110173470'
  }
}
module.exports = config