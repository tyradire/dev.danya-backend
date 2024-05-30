const jwt = require('jsonwebtoken');
const { Collection } = require("../models/models");
const TokenService = require('../utils/Token');
const { COOKIE_SETTINGS, ACCESS_TOKEN_EXPIRATION } = require('../utils/constants');

class CollectionController {
  async addToCollection(req, res, next) {
    const movieId = req.params.id;
    const token = req.headers.authorization;
    const nowDate = (Date.now() + (3 * 60 * 60))
    const expired = jwt.decode(token.split(' ')[1]).exp * 1000
    let result = { accessToken: token.split(' ')[1], refreshToken: req.cookies.refreshToken };
    if (!token) {
      return res.status(403).json({message: "Пользователь не авторизован"})
    } else if (nowDate > expired) {
      console.log('Access token is expired!')
      result = await TokenService.refreshToken({ refreshToken: req.cookies.refreshToken })
    }
    const decoded = jwt.verify(result.accessToken, process.env.ACCESS_SECRET)
    const userId = decoded.id
    Collection.findOne({where: {userId}})
      .then((collection) => {
        collection.watched.push(movieId)
        collection.changed('watched', true)
        collection.save()
        return res.status(200).send({movieId,accessToken: result.accessToken, ACCESS_TOKEN_EXPIRATION })
      })
      .catch(next);
  }

  async deleteFromCollection(req, res, next) {
    const movieId = req.params.id;
    const token = req.headers.authorization;
    const nowDate = (Date.now() + (3 * 60 * 60))
    const expired = jwt.decode(token.split(' ')[1]).exp * 1000
    let result = { accessToken: token.split(' ')[1], refreshToken: req.cookies.refreshToken };
    if (!token) {
      return res.status(401).json({message: "Пользователь не авторизован"})
    } else if (nowDate > expired) {
      console.log('Access token is expired!')
      result = await TokenService.refreshToken({ refreshToken: req.cookies.refreshToken })
    }
    const decoded = jwt.verify(result.accessToken, process.env.ACCESS_SECRET)
    const userId = decoded.id
    Collection.findOne({where: {userId}})
      .then((collection) => {
        collection.watched = collection.watched.filter(elemId => {return elemId != movieId})
        collection.changed('watched', true)
        collection.save()
        return res.status(200).send({movieId,accessToken: result.accessToken, ACCESS_TOKEN_EXPIRATION })
      })
      .catch(next);
  }

  async getCollection(req, res, next) {
    const token = req.headers.authorization;
    let result = { accessToken: token.split(' ')[1], refreshToken: req.cookies.refreshToken };
    if (!token) {
      return res.status(403).json({message: "Пользователь не авторизован"})
    }
    const decoded = jwt.decode(token.split(' ')[1])
    const expired = decoded.exp * 1000
    const nowDate = (Date.now() + (3 * 60 * 60))
    if (nowDate > expired) {
      console.log('Access token is expired!')
      result = await TokenService.refreshToken({ refreshToken: req.cookies.refreshToken })
    }
    const userId = decoded.id;
    Collection.findOne({where: {userId}})
      .then((collection) => {
        const watched = collection.dataValues.watched;
        return res.status(200).send({watched,accessToken: result.accessToken, ACCESS_TOKEN_EXPIRATION}).cookie('refreshToken', result.refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)
      })
      .catch(next);
  }
}

module.exports = new CollectionController();