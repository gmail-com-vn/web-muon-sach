const Request = require('../models/Request');
const User = require('../models/User');
const Book = require('../models/Book');
const Category = require('../models/Category');
const Story = require('../models/Story');
const Transaction = require('../models/Transaction');
const Rating = require('../models/Rating');

const { mongooseToObjiect, mutipleMongooseToObject } = require('../../util/mongoose');

const ITEMS_PER_PAGE = 15;

class MemberController {
    postRequestBook(req, res, next) {
        if (req.user._id == req.body.chuSachId) {
            return res.redirect('back');
        }
        const bookId = req.body.bookId;
        const request = new Request({
            bookId: bookId,
            thoiGianTra: req.body.thoiGianTra,
            message: req.body.message,
            nguoiMuonId: req.user._id,
            chuSachId: req.body.chuSachId,
            trangThai: 'Đợi đồng ý',
        });
        request
            .save()
            .then(() => res.redirect('/member/danh-sach-yeu-cau'))
            .catch(next);
    }

    postTransactionCreate(req, res, next) {
        const requestId = req.body.requestId;
        const transaction = new Transaction({
            bookId: req.body.bookId,
            chuSachId: req.body.chuSachId,
            nguoiMuonId: req.body.nguoiMuonId,
            requestId: requestId,
            tienCoc: req.body.tienCoc,
            ghiChu: req.body.ghiChu,
            trangThaiGiaoDich: 'Chờ xác nhận',
        });
        transaction
            .save()
            .then(() => {
                return Request.findOneAndUpdate({ _id: requestId }, { $set: { trangThai: 'Đã tạo giao dịch' } }, { new: true });
            })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    updateTransactionConfirm(req, res, next) {
        Transaction.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('back'))
            .catch(next);
    }

    getTransaction(req, res, next) {
        Promise.all([
            Transaction.find({ chuSachId: req.user._id }).populate('chuSachId').populate('nguoiMuonId').populate('bookId').populate('requestId'),
            Transaction.find({ nguoiMuonId: req.user._id }).populate('chuSachId').populate('nguoiMuonId').populate('bookId').populate('requestId'),
        ])
            .then(([transactionsChuSach, transactionsNguoiMuon]) =>
                res.render('member/transactionList', {
                    transactionsChuSach: mutipleMongooseToObject(transactionsChuSach),
                    transactionsNguoiMuon: mutipleMongooseToObject(transactionsNguoiMuon),
                }),
            )
            .catch(next);
    }

    updateStatusTransaction(req, res, next) {
        console.log(req.params);
        Transaction.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('back'))
            .catch(next);
    }

    //[POST] /danh-gia
    postEvaluate(req, res, next) {
        Rating.findOne({ transactionId: req.body.transactionId })
            .then((rate) => {
                if (!rate) {
                    return res.redirect('back');
                }
                const rating = new Rating({
                    star: req.body.star,
                    comment: req.body.comment,
                    bookId: req.params.bookId,
                    chuSachId: req.body.chuSachId,
                    nguoiMuonId: req.body.nguoiMuonId,
                    transactionId: req.body.transactionId,
                });

                rating
                    .save()
                    .then(() => res.redirect('back'))
                    .catch(next);
            })
            .catch();
    }

    getMember(req, res, next) {
        Promise.all([
            User.findById(req.params.id),
            Book.find({ userId: req.params.id }).populate('categoryId'),
            Rating.find({ chuSachId: req.params.id }).populate('chuSachId').populate('nguoiMuonId'),
        ])
            .then(([user, books, ratings]) => {
                const star = ratings.map((r) => r.star);
                let total = 0;
                star.forEach((s) => {
                    total += s;
                });
                const totalStar = Math.round((total / ratings.length) * 10) / 10;

                res.render('member/account', {
                    user: mongooseToObjiect(user),
                    books: mutipleMongooseToObject(books),
                    ratings: mutipleMongooseToObject(ratings),
                    totalStar: totalStar,
                });
            })
            .catch(next);
    }

    // [GET] /member/create
    create(req, res, next) {
        Category.find({})
            .then((categories) =>
                res.render('member/create', {
                    categories: mutipleMongooseToObject(categories),
                }),
            )
            .catch(next);
    }

    // [POST] /member/store
    store(req, res, next) {
        req.body.img = req.files[0].path.split('\\').slice(2).join('/');
        console.log(req.body);
        const book = new Book({
            name: req.body.name,
            categoryId: req.body.categoryId,
            description: req.body.description,
            author: req.body.author,
            tinh_trang: req.body.tinh_trang,
            transport_fee: req.body.transport_fee,
            status: req.body.status,
            img: req.body.img,
            userId: req.user,
        });
        book.save()
            .then(() => res.redirect('/member/stored/book'))
            .catch(next);
    }

    // [GET] /member/:id/edit
    edit(req, res, next) {
        Book.findById(req.params.id)
            .then((book) =>
                res.render('member/edit', {
                    book: mongooseToObjiect(book),
                }),
            )
            .catch(next);
    }

    // [PUT] /member/:id
    update(req, res, next) {
        Book.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('/member/stored/book'))
            .catch(next);
    }

    // [DELETE] /:id
    destroy(req, res, next) {
        Book.delete({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    // [DELETE] /:id/force
    forceDestroy(req, res, next) {
        Book.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    // [PATCH] /:id/restore
    restore(req, res, next) {
        Book.restore({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    // [POST] /handle-form-actions
    handleFormActions(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                Book.delete({ _id: { $in: req.body.bookIds } }) // req.body.courseIds là mảng
                    .then(() => res.redirect('back'))
                    .catch(next);
                break;
            default:
                res.json({ message: 'Action is invalid' });
        }
    }

    storedBooks(req, res, next) {
        const page = +req.query.page || 1;
        let totalItems;
        Promise.all([
            Book.find({ userId: req.user._id })
                .count()
                .then((numBooks) => {
                    totalItems = numBooks;
                    return Book.find({ userId: req.user._id })
                        .skip((page - 1) * ITEMS_PER_PAGE)
                        .limit(ITEMS_PER_PAGE)
                        .sortable(req);
                }),
            Book.countDocumentsDeleted({ userId: req.user._id }),
        ])
            .then(([books, deletedCount]) =>
                res.render('member/stored-books', {
                    books: mutipleMongooseToObject(books),
                    deletedCount,
                    currentPage: page,
                    hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
                }),
            )
            .catch(next);
    }

    trashBooks(req, res, next) {
        Book.findDeleted({}).then((books) => {
            res.render('member/trash-books', {
                books: mutipleMongooseToObject(books),
            });
        });
    }

    getListRequest(req, res, next) {
        Promise.all([
            Request.find({ nguoiMuonId: req.user._id }).populate('bookId').populate('chuSachId').populate('nguoiMuonId'),
            Request.find({ chuSachId: req.user._id }).populate('bookId').populate('nguoiMuonId').populate('chuSachId'),
        ])

            .then(([requestsSend, requestsReceive]) =>
                res.render('listRequest', {
                    requestsSend: mutipleMongooseToObject(requestsSend),
                    requestsReceive: mutipleMongooseToObject(requestsReceive),
                }),
            )
            .catch(next);
    }

    cancelRequest(req, res, next) {
        Request.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    acceptRequest(req, res, next) {
        Request.updateOne({ _id: req.params.id }, { trangThai: 'Đồng ý' })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    refuseRequest(req, res, next) {
        Request.updateOne({ _id: req.params.id }, { trangThai: 'Từ chối' })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    createNews(req, res, next) {
        res.render('member/create-news');
    }

    getNews(req, res, next) {
        Promise.all([Story.find({ userId: req.user._id }).sortable(req), Story.countDocumentsDeleted()])
            .then(([stories, deletedCount]) =>
                res.render('member/news', {
                    stories: mutipleMongooseToObject(stories),
                    deletedCount,
                }),
            )
            .catch(next);
    }

    postNews(req, res, next) {
        req.body.imgStory = req.files[0].path.split('\\').slice(2).join('/');
        console.log(req.body);
        const story = new Story({
            title: req.body.title,
            content: req.body.content,
            imgStory: req.body.imgStory,
            userId: req.user._id,
        });
        story
            .save()
            .then(() => res.redirect('/member/news'))
            .catch(next);
    }

    editNews(req, res, next) {
        Story.findById(req.params.id)
            .then((story) =>
                res.render('member/edit-news', {
                    story: mongooseToObjiect(story),
                }),
            )
            .catch(next);
    }

    updateNews(req, res, next) {
        Story.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('/member/news'))
            .catch(next);
    }

    destroyNews(req, res, next) {
        Story.delete({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    trashNews(req, res, next) {
        Story.findDeleted({}).then((stories) => {
            res.render('member/trash-news', {
                stories: mutipleMongooseToObject(stories),
            });
        });
    }

    restoreNews(req, res, next) {
        Story.restore({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    forceDestroyNews(req, res, next) {
        Story.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
}

module.exports = new MemberController();
