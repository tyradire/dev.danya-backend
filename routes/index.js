const Router = require('express');
const router = new Router();
const userRouter = require('./userRouter');
const collectionRouter = require('./collectionRouter');
const likeRouter = require('./likeRouter');

router.use('/user', userRouter);
router.use('/collection', collectionRouter);
router.use('/like', likeRouter);

module.exports = router;