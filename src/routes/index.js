const adminRouter = require('./admin');
const memberRouter = require('./member');
const siteRouter = require('./site');
const policyRouter = require('./policy');
const authRouter = require('./auth');

function route(app) {
    app.use('/admin', adminRouter);
    app.use('/member', memberRouter);
    app.use('/chinh-sach', policyRouter);
    app.use('/', authRouter);
    app.use('/', siteRouter);
}

module.exports = route;
