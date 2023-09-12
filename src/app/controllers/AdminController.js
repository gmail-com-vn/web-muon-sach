const Transaction = require('../models/Transaction');
const Rating = require('../models/Rating');
const Category = require('../models/Category');

const User = require('../models/User');
const Book = require('../models/Book');

const { mongooseToObjiect } = require('../../util/mongoose');
const { mutipleMongooseToObject } = require('../../util/mongoose');

class AdminController {
    getAllTransactions(req, res, next) {
        Transaction.find({})
            .populate('chuSachId')
            .populate('nguoiMuonId')
            .populate('bookId')
            .sortable(req)
            .then((transactions) =>
                res.render('admin/allTransactions', {
                    transactions: mutipleMongooseToObject(transactions),
                }),
            )
            .catch(next);
    }

    postFeedback(req, res, next) {
        Rating.updateOne({ _id: req.params.id }, { feedback: req.body.feedback })
            .then(() => res.redirect('back'))
            .catch();
    }
    getCreateCategory(req, res, next) {
        res.render('category/create-category');
    }
    getCategory(req, res, next) {
        Category.find({})
            .then((categories) =>
                res.render('category/category-list', {
                    categories: mutipleMongooseToObject(categories),
                }),
            )
            .catch();
    }
    postCategory(req, res, next) {
        console.log(req.body);
        const category = new Category({
            categoryBook: req.body.categoryBook,
        });
        category
            .save()
            .then(() => res.redirect('/admin/category'))
            .catch(next);
    }
    editCategory(req, res, next) {
        Category.findById(req.params.id)
            .then((category) =>
                res.render('category/edit-category', {
                    category: mongooseToObjiect(category),
                }),
            )
            .catch(next);
    }
    updateCategory(req, res, next) {
        Category.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('/admin/category'))
            .catch(next);
    }
    deleteCategory(req, res, next) {
        Category.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    getAccount(req, res, next) {
        User.find({ role: 2 })
            .then((users) =>
                res.render('admin/managerAccount', {
                    users: mutipleMongooseToObject(users),
                }),
            )
            .catch(next);
    }

    editAccount(req, res, next) {}
    confirmVerification(req, res, next) {
        User.updateOne({ _id: req.params.id }, { trangThaiXacMinh: 'Thành công' })
            .then(() => res.redirect('/admin/quan-ly-tai-khoan'))
            .catch(next);
    }

    rejectVerification(req, res, next) {
        User.updateOne({ _id: req.params.id }, { trangThaiXacMinh: 'Thất bại' })
            .then(() => res.redirect('/admin/quan-ly-tai-khoan'))
            .catch(next);
    }

    deleteAccount(req, res, next) {
        User.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    getStatistical(req, res, next) {
        const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        Promise.all([
            Transaction.aggregate([
                {
                    $project: {
                        month: { $substr: ['$createdAt', 5, 2] }, // Trích xuất thông tin tháng từ trường createdAt
                        trangThaiGiaoDich: 1,
                    },
                },
                {
                    $match: {
                        month: { $in: months }, // Thay "07" bằng tháng cần lấy dữ liệu
                        trangThaiGiaoDich: 'Hoàn thành',
                    },
                },
                {
                    $group: {
                        _id: '$month', // Nhóm các giao dịch cùng tháng lại với nhau
                        totalGiaoDich: { $sum: 1 },
                    },
                },
                {
                    $sort: { _id: 1 }, // Sắp xếp theo thời gian tăng dần
                },
            ]),
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
                    $limit: 10, // Chọn 10 sách mượn nhiều nhất
                },
            ]),
        ])

            .then(([transactionsData, bookData]) => {
                console.log(bookData);
                const totalGiaoDichArray = new Array(12).fill(0); // Tạo mảng có 12 phần tử và giá trị ban đầu là 0

                // Gán tổng tiền vào mảng totalTongTienArray tương ứng với tháng
                transactionsData.forEach((item) => {
                    const index = parseInt(item._id, 10) - 1; // Ví dụ: tháng 01 -> index 0, tháng 02 -> index 1, ..., tháng 12 -> index 11
                    totalGiaoDichArray[index] = item.totalGiaoDich;
                });

                const booksData = []; // Tạo mảng chứa thông tin thống kê sản phẩm bán chạy
                // Gán thông tin của từng sản phẩm vào mảng booksData

                const bookIds = bookData.map((item) => item._id);

                Book.find({ _id: { $in: bookIds } })
                    .then((books) => {
                        // Tạo một đối tượng map để dễ dàng truy cập thông tin sách dựa trên "bookId"
                        const bookMap = {};
                        books.forEach((book) => {
                            bookMap[book._id.toString()] = book;
                        });

                        // Gán thông tin của từng sản phẩm vào mảng booksData
                        bookData.forEach((item) => {
                            booksData.push({
                                name: bookMap[item._id.toString()].name,
                                totalSold: item.totalSold,
                            });
                        });

                        res.render('admin/statistical', {
                            totalGiaoDich: JSON.stringify(totalGiaoDichArray),
                            booksData: JSON.stringify(booksData),
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            })
            .catch(next);
    }
}

module.exports = new AdminController();
