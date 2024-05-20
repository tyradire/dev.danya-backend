const ApiError = require("../error/ApiError");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Collection, UserToken } = require('../models/models');
const TokenService = require('../utils/Token');
const { COOKIE_SETTINGS, ACCESS_TOKEN_EXPIRATION } = require('../utils/constants');

class UserController {

  async registration(req, res, next) {
    const { email, password, name, avatar, role } = req.body
    if (!email || !password) {
      return next(ApiError.badRequest('Некорректный email или пароль'))
    }
    const userExist = await User.findOne({where: {email}})
    if (userExist) {
      return next(ApiError.conflict('Пользователь с данным email уже существует'))
    }
    const hashPassword = await bcrypt.hash(password, 5)
    const user = await User.create({email, name, avatar, role, password: hashPassword})
    const collection = await Collection.create({userId: user.id})
    const payload = {id: user.id, email: email, name: user.name}
    const accessToken = await TokenService.generateAccessToken(payload)
    const refreshToken = await TokenService.generateRefreshToken(payload)
    const userToken = await UserToken.create({userId: user.id, refreshToken: refreshToken})
    res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)
    return res.status(200).json({accessToken, ACCESS_TOKEN_EXPIRATION})
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
    const payload = {id: user.id, email: user.email, name: user.name}
    const accessToken = await TokenService.generateAccessToken(payload)
    const refreshToken = await TokenService.generateRefreshToken(payload)
    UserToken.findOne({where: {userId: user.id}})
      .then(token => {
        token.refreshToken = refreshToken;
        token.changed('refreshToken', true);
        token.save();
        res.status(200).send({token})
      })
      .catch(err => console.log(err))
    res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)
    return res.status(200).json({accessToken, ACCESS_TOKEN_EXPIRATION})
  }

  async check(req, res, next) {
    const payload = {id: req.user.id, email: req.user.email, name: req.user.name}
    const accessToken = await TokenService.generateAccessToken(payload)
    return res.json({accessToken})
  }

  async refresh(req, res, next) {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return next(ApiError.forbidden('Пользователь не авторизован'));
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET)
    const payload = {id: decoded.id, email: decoded.email, name: decoded.name}
    const accessToken = await TokenService.generateAccessToken(payload)
    UserToken.findOne({where: {userId: decoded.id}})
      .then(token => {
        console.log(token.dataValues.refreshToken === refreshToken)
        res.status(200).send({token})
      })
      .catch(err => console.log(err))
    res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)
    return res.status(200).json({accessToken, ACCESS_TOKEN_EXPIRATION})
  }

  async logout(req, res, next) {
    const rawToken = req.headers.cookie;
    const token = rawToken.split('refreshToken=')[1]
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET)
    UserToken.findOne({where: {userId: decoded.id}})
      .then(token => {
        token.refreshToken = '';
        token.changed('refreshToken', true);
        token.save();
        res.status(200).send({token})
      })
      .catch(err => console.log(err))
    res.clearCookie('refreshToken')
  }

  async rename(req, res, next) {
    const newName = req.body.name;
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({message: "Пользователь не авторизован"})
    }
    const decoded = jwt.verify(token.split(' ')[1], process.env.ACCESS_SECRET);
    const userId = decoded.id;
    User.findOne({where: {id: userId}})
      .then(user => {
        user.name = newName;
        user.changed('name', true);
        user.save();
        res.status(200).send({user})
      })
      .catch(err => console.log(err))
  }

  async getUserData(req, res, next) {
    const token = req.cookies.refreshToken;
    const decoded = jwt.decode(token)
    const expired = decoded.exp * 1000
    const nowDate = (Date.now() + (3 * 60 * 60))
    //const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    if (nowDate > expired || !token) {
      console.log(nowDate, expired, token)
      return res.status(401).json({message: "Пользователь не авторизован"});
    }
      User.findOne({where: {id: decoded.id}})
      .then(user => {
        return res.json({user})
      })
      .catch(err => console.log(err))
  }
}

module.exports = new UserController();