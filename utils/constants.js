const COOKIE_SETTINGS = {
  REFRESH_TOKEN: {
    httpOnly: true,
    //maxAge: 30 * 24 * 3600 * 1000
    maxAge: 1296e6
  }
}

//const ACCESS_TOKEN_EXPIRATION = 2700 * 1000;
const ACCESS_TOKEN_EXPIRATION = 18e5;

module.exports = {
  COOKIE_SETTINGS,
  ACCESS_TOKEN_EXPIRATION
}