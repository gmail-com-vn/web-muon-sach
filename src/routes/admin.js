const express = require('express');
const router = express.Router();
var multer = require('multer');

const adminController = require('../app/controllers/AdminController');
const isAuth = require('../app/middlewares/is-auth');
const isAuthAdmin = require('../app/middlewares/is-auth-admin');

var storage = multer.diskStorage({
    destination: function (req, files, cb) {
        cb(null, './src/public/uploads');
    },
    filename: function (req, files, cb) {
        cb(null, Date.now() + files.originalname);
    },
});

var upload = multer({ storage: storage });

router.get('/thong-ke-giao-dich', isAuth, isAuthAdmin, adminController.getAllTransactions);

router.post('/feedback/:id', isAuth, isAuthAdmin, adminController.postFeedback);

router.get('/category/create', isAuth, isAuthAdmin, adminController.getCreateCategory);
router.get('/category/:id/edit', isAuth, isAuthAdmin, adminController.editCategory);
router.put('/category/:id', isAuth, isAuthAdmin, adminController.updateCategory);
router.delete('/category/:id', isAuth, isAuthAdmin, adminController.deleteCategory);
router.post('/category', isAuth, isAuthAdmin, adminController.postCategory);
router.get('/category', isAuth, isAuthAdmin, adminController.getCategory);

router.get('/quan-ly-tai-khoan', isAuth, isAuthAdmin, adminController.getAccount);
router.put('/quan-ly-tai-khoan/:id/xac-nhan-xac-minh', isAuth, isAuthAdmin, adminController.confirmVerification);
router.put('/quan-ly-tai-khoan/:id/tu-choi-xac-minh', isAuth, isAuthAdmin, adminController.rejectVerification);
router.put('/quan-ly-tai-khoan/:id', isAuth, isAuthAdmin, adminController.editAccount);

router.delete('/quan-ly-tai-khoan/:id', isAuth, isAuthAdmin, adminController.deleteAccount);
router.get('/thong-ke', isAuth, isAuthAdmin, adminController.getStatistical);

module.exports = router;
