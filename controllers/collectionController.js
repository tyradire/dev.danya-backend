const jwt = require('jsonwebtoken');
const { Collection } = require("../models/models");

class CollectionController {
  async addToCollection(req, res, next) {
    const movieId = req.params.id;
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({message: "Пользователь не авторизован"})
    }
    const decoded = jwt.verify(token.split(' ')[1], process.env.SECRET)
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
    const decoded = jwt.verify(token.split(' ')[1], process.env.SECRET)
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
    const decoded = jwt.verify(token.split(' ')[1], process.env.SECRET)
    const userId = decoded.id;
    Collection.findOne({where: {userId}})
      .then((collection) => {
        console.log('данные с бека ',collection.dataValues.liked)
        const liked = collection.dataValues.liked;
        res.status(200).send({liked})
      })
      .catch(next);
  }
}

module.exports = new CollectionController();