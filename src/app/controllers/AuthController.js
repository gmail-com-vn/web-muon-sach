const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const User = require('../models/User');

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            // api_user:
            api_key: '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',
        },
    }),
);

class AuthController {
    getLogin(req, res, next) {
        res.render('auth/login', {
            errorMessage: req.flash('error'),
            oldInput: {
                email: '',
                password: '',
                confirmPassword: '',
            },
            validationErrors: [],
        });
    }

    postLogin(req, res, next) {
        const email = req.body.email;
        const password = req.body.password;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/login', {
                errorMessage: errors.array()[0].msg,
                oldInput: { email: email, password: password },
                validationErrors: errors.array(),
            });
        }
        User.findOne({ email: email })
            .then((user) => {
                if (!user) {
                    return res.status(422).render('auth/login', {
                        errorMessage: 'Email hoặc mật khẩu không hợp lệ!',
                        oldInput: { email: email, password: password },
                        validationErrors: [],
                    });
                }
                bcrypt
                    .compare(password, user.password)
                    .then((doMatch) => {
                        if (doMatch) {
                            req.session.isLoggedIn = true;
                            req.session.user = user;
                            req.session.role = user.role;
                            return req.session.save(() => {
                                res.redirect('/');
                            });
                        }
                        return res.status(422).render('auth/login', {
                            errorMessage: 'Email hoặc mật khẩu không hợp lệ!',
                            oldInput: { email: email, password: password },
                            validationErrors: [],
                        });
                    })
                    .catch(() => {
                        res.redirect('/dang-nhap');
                    });
            })
            .catch(next);
    }
    postLogout(req, res, next) {
        req.session.destroy(() => {
            res.redirect('/');
        });
    }

    getSignup(req, res, next) {
        res.render('auth/signup', {
            errorMessage: req.flash('error'),
            oldInput: {
                firstname: '',
                lastname: '',
                email: '',
                password: '',
                confirmPassword: '',
            },
            validationErrors: [],
        });
    }

    postSignup(req, res, next) {
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const email = req.body.email;
        const password = req.body.password;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.status(422).render('auth/signup', {
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    password: password,
                    confirmPassword: req.body.confirmPassword,
                },
                validationErrors: errors.array(),
            });
        }
        bcrypt
            .hash(password, 12)
            .then((hashedPassword) => {
                const user = new User({
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    password: hashedPassword,
                    avatar: 'img/avatar-default.png',
                    role: 2,
                    cart: {
                        items: [],
                    },
                });
                return user.save();
            })
            .then((result) => {
                res.redirect('/dang-nhap');
                return transporter.sendMail({
                    to: email,
                    from: 'mvt16102001@gmail.com',
                    subject: 'Đăng ký thành công',
                    html: '<h1>Bạn đã đăng ký thành công!</h1>',
                });
            })
            .catch(next);
    }

    getReset(req, res, next) {
        res.render('auth/reset', {
            errorMessage: req.flash('error'),
        });
    }

    postReset(req, res, next) {
        crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                console.log(err);
                return res.redirect('/dat-lai-mat-khau');
            }
            const token = buffer.toString('hex');
            User.findOne({ email: req.body.email })
                .then((user) => {
                    if (!user) {
                        req.flash('error', 'Không tìm thấy tài khoản');
                        return res.redirect('/dat-lai-mat-khau');
                    }
                    user.resetToken = token;
                    user.resetTokenExpiration = Date.now() + 360000;
                    return user.save();
                })
                .then((result) => {
                    res.redirect('/');
                    transporter.sendMail({
                        to: req.body.email,
                        from: 'mvt16102001@gmail.com',
                        subject: 'Đặt lại mật khẩu',
                        html: `
                        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn</p>
                        <p>Click vào <a href="http://localhost:3000/dat-lai-mat-khau/${token}">Đây</a> để đặt mật khẩu mới</p>
                        `,
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    }

    getNewPassword(req, res, next) {
        const token = req.params.token;
        User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
            .then((user) => {
                res.render('auth/new-password', {
                    errorMessage: req.flash('error'),
                    userId: user._id.toString(),
                    passwordToken: token,
                });
            })
            .catch((err) => console.log(err));
    }

    postNewPassword(req, res, next) {
        const newPassword = req.body.password;
        const userId = req.body.userId;
        const passwordToken = req.body.passwordToken;
        let resetUser;
        User.findOne({
            resetToken: passwordToken,
            resetTokenExpiration: { $gt: Date.now() },
            _id: userId,
        })
            .then((user) => {
                resetUser = user;
                return bcrypt.hash(newPassword, 12);
            })
            .then((hashedPassword) => {
                resetUser.password = hashedPassword;
                resetUser.resetToken = undefined;
                resetUser.resetTokenExpiration = undefined;
                return resetUser.save();
            })
            .then((result) => {
                res.redirect('/dang-nhap');
            })
            .catch(next);
    }
}

module.exports = new AuthController();
