const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING, unique: false, defaultValue: 'Пользователь'},
  email: {type: DataTypes.STRING, unique: true},
  password: {type: DataTypes.STRING, unique: false},
  avatar: {type: DataTypes.STRING, unique: false, defaultValue: 'https://www.svgrepo.com/show/532363/user-alt-1.svg'},
  role: {type: DataTypes.STRING, defaultValue: 'USER'}
})

const Collection = sequelize.define('collection', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  liked: {type: DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: []},
  watched: {type: DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: []},
  wish: {type: DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: []},
})

const UserToken = sequelize.define('token', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  refreshToken: {type: DataTypes.TEXT, defaultValue: ''},
})

User.hasOne(Collection);
Collection.belongsTo(User);

User.hasOne(UserToken);
UserToken.belongsTo(User);

module.exports = {
  User,
  Collection,
  UserToken
}