require('dotenv').config()
const jwt = require('jsonwebtoken');
const { UserToken } = require('../models/models');

class TokenService {
  async generateAccessToken(payload) {
    return await jwt.sign({
      id: payload.id, 
      email: payload.email, 
      name: payload.name
    }, process.env.ACCESS_SECRET, {
      expiresIn: '1m'
    })
  }
  async generateRefreshToken(payload) {
    return await jwt.sign({
      id: payload.id, 
      email: payload.email, 
      name: payload.name
    }, process.env.REFRESH_SECRET, {
      expiresIn: '30d'
    })
  }
  async refreshToken(payload) {
    console.log(123, payload)
    const { refreshToken } = payload;
    //const { refreshToken } = req.cookies; ПЕРЕДАТЬ
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET)
    const userData = {id: decoded.id, email: decoded.email, name: decoded.name}
    const accessToken = await this.generateAccessToken(userData)
    
    return UserToken.findOne({where: {userId: decoded.id}})
      .then(token => {
        //console.log(token.dataValues.refreshToken === refreshToken)
        //res.status(200).send({token})
        return {refreshToken:refreshToken, accessToken:accessToken}
        //res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)
        //res.status(200).json({accessToken, ACCESS_TOKEN_EXPIRATION})
      })
      .catch(err => console.log(err))
    
    //return res.status(200).json({accessToken, ACCESS_TOKEN_EXPIRATION})
  }
}

module.exports = new TokenService();