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
    if (!token) {
      return res.status(403).json({message: "Пользователь не авторизован"})
    } else if (nowDate > expired) {
      return res.status(401).json({message: "Пользователь не авторизован"})
    }
    const decoded = jwt.verify(token.split(' ')[1], process.env.ACCESS_SECRET)
    const userId = decoded.id
    Collection.findOne({where: {userId}})
      .then((collection) => {
        collection.liked.push(movieId)
        collection.changed('liked', true)
        collection.save()
        res.status(200).send({movieId})
      })
      .catch(next)
  }

  async deleteFromCollection(req, res, next) {
    const movieId = req.params.id;
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({message: "Пользователь не авторизован"})
    }
    const decoded = jwt.verify(token.split(' ')[1], process.env.ACCESS_SECRET)
    const userId = decoded.id
    Collection.findOne({where: {userId}})
      .then((collection) => {
        collection.liked = collection.liked.filter(elemId => {return elemId != movieId})
        collection.changed('liked', true)
        collection.save()
        res.status(200).send({movieId})
      })
      .catch(next)
  }

  async getCollection(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(403).json({message: "Пользователь не авторизован"})
    }
    const decoded = jwt.decode(token.split(' ')[1])
    console.log(8888,decoded)
    const expired = decoded.exp * 1000
    const nowDate = (Date.now() + (3 * 60 * 60))
    //const decoded = jwt.verify(token.split(' ')[1], process.env.ACCESS_SECRET)
    let result;
    if (nowDate > expired) {
      console.log(66666, 'мы тут были просроченно')
      result = await TokenService.refreshToken({ refreshToken: req.cookies.refreshToken }) //УБРАЛИ ЭВЕИТ

      // TokenService.refreshToken({ refreshToken: req.cookies.refreshToken })
      // .then(res => console.log(7777777777,res))

      //.then(res => console.log(7777777,'RES ', result))
      //res.cookie('refreshToken', result.refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)
      //res.status(200).json({result.accessToken, ACCESS_TOKEN_EXPIRATION})
      //return res.status(401).json({message: "Пользователь не авторизован"})
    }
    console.log(123321,'RES ', result.accessToken)
    const userId = decoded.id;
    Collection.findOne({where: {userId}})
      .then((collection) => {
        const liked = collection.dataValues.liked;
        res.status(200)
        //res.status(200)
        
        //.json({accessToken: result.accessToken, ACCESS_TOKEN_EXPIRATION})
        //.send({liked})
        .send({liked,accessToken: result.accessToken, ACCESS_TOKEN_EXPIRATION})
        .cookie('refreshToken', result.refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)
      })
      .catch(next);
  }
}

module.exports = new CollectionController();