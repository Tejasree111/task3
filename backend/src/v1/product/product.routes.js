const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const { authorize} = require('../../middleware/auth.middleware');

router.get('/', productController.getProducts);
router.put('/:productId', productController.updateProduct);
router.get('/vendors-and-categories', productController.getVendorsAndCategories);
router.put('/:productId/status', productController.updateProductStatus);
router.post('/add',authorize(1,2), productController.addProduct);



module.exports = router;


