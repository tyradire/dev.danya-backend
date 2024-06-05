const Router = require('express');
const router = new Router();
const wishController = require('../controllers/wishController');

router.patch('/add/:id', wishController.addToWish);
router.patch('/delete/:id', wishController.deleteFromWish);
router.get('/getwish', wishController.getWishList);

module.exports = router;