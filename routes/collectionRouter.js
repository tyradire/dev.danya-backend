const Router = require('express');
const router = new Router();
const CollectionController = require('../controllers/collectionController');

router.patch('/add/:id', CollectionController.addToCollection);
router.patch('/delete/:id', CollectionController.deleteFromCollection);
router.get('/getcollection', CollectionController.getCollection);

module.exports = router;