const express = require('express');
const router = express.Router();
var multer = require('multer');

const memberController = require('../app/controllers/MemberController');
const isAuth = require('../app/middlewares/is-auth');
const isAuthUser = require('../app/middlewares/is-auth-user');

var storage = multer.diskStorage({
    destination: function (req, files, cb) {
        cb(null, './src/public/uploads');
    },
    filename: function (req, files, cb) {
        cb(null, Date.now() + files.originalname);
    },
});

var upload = multer({ storage: storage });

router.post('/yeu-cau-muon-sach', isAuth, isAuthUser, memberController.postRequestBook);
router.post('/tao-giao-dich', isAuth, isAuthUser, memberController.postTransactionCreate);
router.put('/xac-nhan-giao-dich/:id', isAuth, isAuthUser, memberController.updateTransactionConfirm);
router.get('/quan-ly-giao-dich', isAuth, isAuthUser, memberController.getTransaction);
router.put('/transaction/:id', isAuth, isAuthUser, memberController.updateStatusTransaction);
router.post('/danh-gia/:bookId', isAuth, isAuthUser, memberController.postEvaluate);

router.get('/danh-sach-yeu-cau', isAuth, isAuthUser, memberController.getListRequest);
router.delete('/danh-sach-yeu-cau/:id/huy-yeu-cau', isAuth, isAuthUser, memberController.cancelRequest);
router.put('/danh-sach-yeu-cau/:id/chap-nhan', isAuth, isAuthUser, memberController.acceptRequest);
router.put('/danh-sach-yeu-cau/:id/tu-choi', isAuth, isAuthUser, memberController.refuseRequest);

router.get('/book/create', isAuth, isAuthUser, memberController.create);
router.post('/book/store', isAuth, isAuthUser, upload.array('img', 4), memberController.store);
router.get('/book/:id/edit', isAuth, isAuthUser, memberController.edit);
router.post('/book/handle-form-actions', isAuth, isAuthUser, memberController.handleFormActions);
router.patch('/book/:id/restore', isAuth, isAuthUser, memberController.restore);
router.put('/book/:id', isAuth, isAuthUser, memberController.update);
router.delete('/book/:id/force', isAuth, isAuthUser, memberController.forceDestroy);
router.delete('/book/:id', isAuth, isAuthUser, memberController.destroy);
router.get('/stored/book', isAuth, isAuthUser, memberController.storedBooks);
router.get('/trash/book', isAuth, isAuthUser, memberController.trashBooks);

router.get('/news/create', isAuth, isAuthUser, memberController.createNews);
router.get('/news/:id/edit', isAuth, isAuthUser, memberController.editNews);
router.put('/news/:id', isAuth, isAuthUser, memberController.updateNews);
router.delete('/news/:id', isAuth, isAuthUser, memberController.destroyNews);
router.get('/trash/news', isAuth, isAuthUser, memberController.trashNews);
router.patch('/news/:id/restore', isAuth, isAuthUser, memberController.restoreNews);
router.delete('/news/:id/force', isAuth, isAuthUser, memberController.forceDestroyNews);
router.post('/news', isAuth, isAuthUser, upload.array('imgStory', 1), memberController.postNews);
router.get('/news', isAuth, isAuthUser, memberController.getNews);

router.get('/:id', memberController.getMember);

module.exports = router;
