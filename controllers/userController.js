const ApiError = require("../error/ApiError");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Collection } = require('../models/models');

class UserController {

  async registration(req, res, next) {
    const { email, password, name, avatar, role } = req.body
    if (!email || !password) {
      return next(ApiError.badRequest('Некорректный email или пароль'))
    }
    const userExist = await User.findOne({where: {email}})
    if (userExist) {
      return next(ApiError.badRequest('Пользователь с данным email уже существует'))
    }
    const hashPassword = await bcrypt.hash(password, 5)
    const user = await User.create({email, name, avatar, role, password: hashPassword})
    const collection = await Collection.create({userId: user.id})
    const token = jwt.sign(
      {id: user.id, email, name: user.name, role: user.role}, 
      process.env.SECRET,
      {expiresIn: '24h'}
    )
    return res.json({token})
  }
  async login(req, res, next) {
    const {email, password} = req.body;
    const user = await User.findOne({where: {email}})
    if (!user) {
      return next(ApiError.unauthorized('Пользователь не найден'));
    }
    let comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      return next(ApiError.unauthorized('Указан неверный пароль'));
    }
    const token = jwt.sign(
      {id: user.id, email, name: user.name, role: user.role}, 
      process.env.SECRET,
      {expiresIn: '24h'}
    )
    return res.json({token})
  }

  async check(req, res, next) {
    const token = jwt.sign(
      {id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role}, 
      process.env.SECRET,
      {expiresIn: '24h'}
    )
    return res.json({token})
  }

  async rename(req, res, next) {
    const newName = req.body.name;
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({message: "Пользователь не авторизован"})
    }
    const decoded = jwt.verify(token.split(' ')[1], process.env.SECRET);
    const userId = decoded.id;
    console.log('проверка ренейма ',userId)
    User.findOne({where: {id: userId}})
      .then(user => {
        user.name = newName;
        user.changed('name', true);
        user.save();
        res.status(200).send({user})
      })
      .catch(err => console.log('err ', err))
  }
}

module.exports = new UserController();