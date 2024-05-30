const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/registration', userController.registration);
router.post('/login', userController.login);
router.get('/auth', authMiddleware, userController.check);
router.get('/userdata', userController.getUserData)
router.put('/rename', userController.rename);
router.post('/logout', userController.logout);
router.post('/avatar', userController.changeAvatar);

module.exports = router;