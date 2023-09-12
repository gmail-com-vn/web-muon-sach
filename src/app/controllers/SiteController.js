const Book = require('../models/Book');
const Story = require('../models/Story');
const Rating = require('../models/Rating');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const { mutipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObjiect } = require('../../util/mongoose');
const Category = require('../models/Category');
const removeDiacritics = require('remove-diacritics');

class SiteController {
    //[GET] /tim-kiem
    search(req, res, next) {
        const k = req.query.keyword;
        Promise.all([
            Book.find({
                $or: [{ name: { $regex: new RegExp(req.query.keyword, 'i') } }],
            })
                .limit(7)
                .populate('categoryId'),
            Book.find({
                $or: [{ author: { $regex: new RegExp(req.query.keyword, 'i') } }],
            })
                .limit(7)
                .populate('categoryId'),
            User.find({
                $and: [
                    {
                        $or: [{ firstname: { $regex: new RegExp(req.query.keyword, 'i') } }, { lastname: { $regex: new RegExp(req.query.keyword, 'i') } }],
                    },
                    { role: 2 },
                ],
            }).limit(5),
        ])

            .then(([booksSearchName, booksSearchAuthor, usersSearch]) => {
                res.render('search/searchAll', {
                    booksSearchName: mutipleMongooseToObject(booksSearchName),
                    booksSearchAuthor: mutipleMongooseToObject(booksSearchAuthor),
                    usersSearch: mutipleMongooseToObject(usersSearch),
                    keyword: k,
                });
            })
            .catch(next);
    }

    searchNameBook(req, res, next) {
        const keyword = removeDiacritics(req.query.keyword);
        const k = req.query.keyword;

        Book.find({
            $or: [{ name: { $regex: new RegExp(req.query.keyword, 'i') } }],
        })
            .populate('categoryId')

            .then((booksSearchName) => {
                res.render('search/searchNameBook', {
                    booksSearchName: mutipleMongooseToObject(booksSearchName),
                    keyword: k,
                });
            })
            .catch(next);
    }

    searchAuthor(req, res, next) {
        const keyword = removeDiacritics(req.query.keyword);
        const k = req.query.keyword;

        Book.find({
            $or: [{ author: { $regex: new RegExp(req.query.keyword, 'i') } }],
        })
            .populate('categoryId')

            .then((booksSearchAuthor) => {
                res.render('search/searchAuthor', {
                    booksSearchAuthor: mutipleMongooseToObject(booksSearchAuthor),
                    keyword: k,
                });
            })
            .catch(next);
    }

    searchMember(req, res, next) {
        const keyword = removeDiacritics(req.query.keyword);
        const k = req.query.keyword;

        User.find({
            $and: [
                {
                    $or: [{ firstname: { $regex: new RegExp(req.query.keyword, 'i') } }, { lastname: { $regex: new RegExp(req.query.keyword, 'i') } }],
                },
                { role: 2 },
            ],
        })

            .then((usersSearch) => {
                res.render('search/searchMember', {
                    usersSearch: mutipleMongooseToObject(usersSearch),
                    keyword: k,
                });
            })
            .catch(next);
    }

    //[GET] /huong-dan-mua-hang
    shoppingGuide(req, res, next) {
        res.render('mua-hang');
    }
    //[GET] /gioi-thieu
    show(req, res, next) {
        res.render('gioi-thieu');
    }

    //[GET] /blogs
    showNews(req, res, next) {
        Story.find({})
            .populate('userId')
            .then((stories) => {
                res.render('news', {
                    stories: mutipleMongooseToObject(stories),
                });
            });
    }

    //[GET] /blogs/:slug
    showNewsDetail(req, res, next) {
        Story.findOne({ slug: req.params.slug })
            .then((story) => {
                console.log(story);
                res.render('news/show', {
                    story: mongooseToObjiect(story),
                });
            })
            .catch(next);
    }

    //[GET] /sach-yeu-thich
    getLove(req, res, next) {
        req.user.populate('love.items.bookId').then((user) => {
            console.log(user);
            const books = user.love.items;
            res.render('love', {
                books: mutipleMongooseToObject(books),
            });
        });
    }

    //[POST] /sach-yeu-thich
    addLove(req, res, next) {
        const prodId = req.body.bookId;
        Book.findById(prodId)
            .then((book) => {
                return req.user.addToLove(book);
            })
            .then((result) => {
                req.session.user = req.user;
                return req.session.save(() => {
                    res.redirect('/sach-yeu-thich');
                });
            });
    }

    //[POST] /love-delete-item
    postLoveDeleteBook = (req, res, next) => {
        const prodId = req.body.bookId;
        req.user.removeFromLove(prodId).then(() => {
            req.session.user = req.user;
            return req.session.save(() => {
                res.redirect('/sach-yeu-thich');
            });
        });
    };

    chatRealTime = (req, res, next) => {
        res.render('chat');
    };

    //[GET] /ho-so-cua-toi
    showProfile(req, res, next) {
        User.findOne({ email: req.user.email })
            .then((user) => {
                res.render('profile', {
                    user: mongooseToObjiect(user),
                });
            })

            .catch(next);
    }

    // [POST] /ho-so-cua-toi
    postProfile(req, res, next) {
        User.updateOne(
            { email: req.user.email },
            {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phone: req.body.phone,
                address: req.body.address,
            },
        )
            .then(() => res.redirect('/ho-so-cua-toi'))
            .catch(next);
    }
    updateAvatar(req, res, next) {
        req.body.avatar = req.files[0].path.split('\\').slice(2).join('/');

        User.updateOne({ _id: req.params.id }, { avatar: req.body.avatar })
            .then(() => res.redirect('/ho-so-cua-toi'))
            .catch(next);
    }
    updateVerification(req, res, next) {
        req.body.imgCCCD = [req.files[0].path.split('\\').slice(2).join('/'), req.files[1].path.split('\\').slice(2).join('/')];

        User.updateOne({ _id: req.params.id }, { imgCCCD: req.body.imgCCCD })
            .then(() => res.redirect('/ho-so-cua-toi'))
            .catch(next);
    }
    showBook(req, res, next) {
        Promise.all([
            Category.findOne({ slugCategoryBook: req.params.slugCategoryBook }),
            Book.findOne({ slug: req.params.slug }).populate('userId'),
            Book.findOne({ slug: req.params.slug }).then((b) => {
                return Rating.find({ bookId: b._id });
            }),
            Book.findOne({ slug: req.params.slug }).then((b) => {
                return Book.find({ userId: b.userId }).limit(6).populate('categoryId');
            }),
            Book.findOne({ slug: req.params.slug }).then((b) => {
                return Rating.find({ bookId: b._id }).limit(2).populate('chuSachId').populate('nguoiMuonId');
            }),
        ])
            .then(([categoryBook, book, rate, books, ratings]) => {
                const star = rate.map((r) => r.star);
                let total = 0;
                star.forEach((s) => {
                    total += s;
                });
                const totalStar = Math.round((total / rate.length) * 10) / 10;

                res.render('books/show', {
                    book: mongooseToObjiect(book),
                    ratings: mutipleMongooseToObject(ratings),
                    books: mutipleMongooseToObject(books),
                    rate: mutipleMongooseToObject(rate),
                    totalStar: totalStar,
                    categoryBook: mongooseToObjiect(categoryBook),
                });
            })
            .catch(next);
    }

    showCategory(req, res, next) {
        let categoryBook;
        Category.findOne({ slugCategoryBook: req.params.slugCategoryBook })
            .then((category) => {
                categoryBook = category.categoryBook;
                return Book.find({ categoryId: category._id, userId: { $ne: req.user._id } })
                    .populate('categoryId')
                    .populate('userId');
            })
            .then((books) => {
                console.log(categoryBook);
                console.log(books);
                res.render('book_list/show', {
                    books: mutipleMongooseToObject(books),
                    categoryBook: categoryBook,
                });
            })
            .catch(next);
    }

    //[GET] /
    index(req, res, next) {
        Promise.all([
            Book.find({ userId: { $ne: req.user._id } })
                .sort({ createdAt: -1 })
                .limit(6)
                .populate('categoryId')
                .populate('userId'),
            Transaction.aggregate([
                {
                    $match: {
                        trangThaiGiaoDich: 'Hoàn thành', // Lọc các giao dịch có trạng thái là 'Hoàn thành'
                    },
                },
                {
                    $group: {
                        _id: '$bookId', // Nhóm các sách cùng loại lại với nhau
                        totalSold: { $sum: 1 }, // Tính tổng số lượng
                    },
                },
                {
                    $sort: { totalSold: -1 }, // Sắp xếp số lượng giảm dần
                },
                {
                    $limit: 6, // Chọn 6 sách mượn nhiều nhất
                },
            ]),
        ])

            .then(([bookNew, bookData]) => {
                const bookIds = bookData.map((item) => item._id);

                Book.find({ _id: { $in: bookIds }, userId: { $ne: req.user._id } })
                    .populate('categoryId')
                    .populate('userId')
                    .then((books) => {
                        res.render('home', {
                            bookNew: mutipleMongooseToObject(bookNew),
                            books: mutipleMongooseToObject(books),
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            })
            .catch(next);
    }
}

module.exports = new SiteController();
