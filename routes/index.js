const Router = require('express');
const router = new Router();
const userRouter = require('./userRouter');
const collectionRouter = require('./collectionRouter');
const likeRouter = require('./likeRouter');
const wishRouter = require('./wishRouter');

router.use('/user', userRouter);
router.use('/collection', collectionRouter);
router.use('/like', likeRouter);
router.use('/wish', wishRouter);

module.exports = router;