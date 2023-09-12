const express = require('express');
const router = express.Router();
var multer = require('multer');
const siteController = require('../app/controllers/SiteController');
const isAuth = require('../app/middlewares/is-auth');

var storage = multer.diskStorage({
    destination: function (req, files, cb) {
        cb(null, './src/public/uploads');
    },
    filename: function (req, files, cb) {
        cb(null, Date.now() + files.originalname);
    },
});

var upload = multer({ storage: storage });

router.get('/tim-kiem/ten-sach', siteController.searchNameBook);
router.get('/tim-kiem/tac-gia', siteController.searchAuthor);
router.get('/tim-kiem/member', siteController.searchMember);

router.get('/tim-kiem', siteController.search);

router.get('/huong-dan-mua-hang', siteController.shoppingGuide);

router.get('/sach-yeu-thich', isAuth, siteController.getLove);
router.post('/sach-yeu-thich', isAuth, siteController.addLove);
router.post('/love-delete-item', isAuth, siteController.postLoveDeleteBook);

router.get('/gioi-thieu', siteController.show);

router.get('/blogs', siteController.showNews);
router.get('/blogs/:slug', siteController.showNewsDetail);

router.put('/ho-so-cua-toi/:id/update-image', isAuth, upload.array('avatar', 1), siteController.updateAvatar);
router.put('/ho-so-cua-toi/:id/verification', isAuth, upload.array('imgCCCD', 2), siteController.updateVerification);

router.get('/ho-so-cua-toi', isAuth, siteController.showProfile);
router.post('/ho-so-cua-toi', isAuth, siteController.postProfile);

router.get('/book/:slugCategoryBook/:slug', siteController.showBook);
router.get('/book/:slugCategoryBook', siteController.showCategory);
router.get('/', siteController.index);

module.exports = router;
