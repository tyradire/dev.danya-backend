require('dotenv').config()
const jwt = require('jsonwebtoken');

class TokenService {
  async generateAccessToken(payload) {
    return await jwt.sign({
      id: payload.id, 
      email: payload.email, 
      name: payload.name
    }, process.env.ACCESS_SECRET, {
      expiresIn: '45m'
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
}

module.exports = new TokenService();