const Router = require('express');
const router = new Router();
const likeController = require('../controllers/likeController');

router.patch('/add/:id', likeController.addToLiked);
router.patch('/delete/:id', likeController.deleteFromLiked);
router.get('/getcollection', likeController.getLiked);

module.exports = router;