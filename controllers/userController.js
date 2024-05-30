const ApiError = require("../error/ApiError");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const path = require('path');
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
    let result = { accessToken: token.split(' ')[1], refreshToken: req.cookies.refreshToken };
    if (!token) {
      return res.status(403).json({message: "Пользователь не авторизован"})
    }
    const decoded = jwt.decode(token.split(' ')[1], process.env.ACCESS_SECRET);
    const expired = decoded.exp * 1000
    const nowDate = (Date.now() + (3 * 60 * 60))
    if (nowDate > expired) {
      console.log('Access token is expired!')
      result = await TokenService.refreshToken({ refreshToken: req.cookies.refreshToken })
    }
    const userId = decoded.id;
    User.findOne({where: {id: userId}})
      .then(user => {
        user.name = newName;
        user.changed('name', true);
        user.save();
        res.status(200)
        .send({ user, accessToken: result.accessToken, ACCESS_TOKEN_EXPIRATION })
        .cookie('refreshToken', result.refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)
      })
      .catch(err => console.log(err))
  }

  async getUserData(req, res, next) {
    const token = req.headers.authorization;
    let result = { accessToken: token.split(' ')[1], refreshToken: req.cookies.refreshToken };
    if (!token) {
      return res.status(403).json({message: "Пользователь не авторизован"})
    }
    const decoded = jwt.decode(token.split(' ')[1], process.env.ACCESS_SECRET)
    const expired = decoded.exp * 1000
    const nowDate = (Date.now() + (3 * 60 * 60))
    if (nowDate > expired) {
      console.log('Access token is expired!')
      result = await TokenService.refreshToken({ refreshToken: req.cookies.refreshToken })
    }
    User.findOne({where: {id: decoded.id}})
    .then(user => {
      res.status(200)
      .send({ user, accessToken: result.accessToken, ACCESS_TOKEN_EXPIRATION })
      .cookie('refreshToken', result.refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)
    })
    .catch(err => console.log(err))
  }

  async changeAvatar(req, res, next) {
    const token = req.headers.authorization;
    // let result = { accessToken: token.split(' ')[1], refreshToken: req.cookies.refreshToken };
    if (!token) {
      return res.status(403).json({message: "Пользователь не авторизован"})
    }
    const decoded = jwt.decode(token.split(' ')[1], process.env.ACCESS_SECRET)
    // const expired = decoded.exp * 1000
    // const nowDate = (Date.now() + (3 * 60 * 60))
    // if (nowDate > expired) {
    //   console.log('Access token is expired!')
    //   result = await TokenService.refreshToken({ refreshToken: req.cookies.refreshToken })
    // }
    if (!req.files) {
      return res.status(404).send(req);
    }
    let img = req.files.img;
    let imgFormat = req.files.img.name.split('.')[req.files.img.name.split('.').length - 1];
    let fileName = uuid.v4() + '.' + imgFormat;
    img.mv(path.resolve(__dirname, '..', 'static', fileName));
    User.findOne({where: {id: decoded.id}})
    .then(user => {
      user.avatar = process.env.CLIENT_URL + '/' + fileName;
      user.changed('avatar', true);
      user.save();
      res.status(200)
      // .send({ user, accessToken: result.accessToken, ACCESS_TOKEN_EXPIRATION })
      // .cookie('refreshToken', result.refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)
    })
    .catch(err => console.log(err))
  }
}

module.exports = new UserController();