const COOKIE_SETTINGS = {
  REFRESH_TOKEN: {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
}

//const ACCESS_TOKEN_EXPIRATION = 2700 * 1000;
const ACCESS_TOKEN_EXPIRATION = 60 * 40 * 1000;

module.exports = {
  COOKIE_SETTINGS,
  ACCESS_TOKEN_EXPIRATION
}