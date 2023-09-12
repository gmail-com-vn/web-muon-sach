module.exports = (req, res, next) => {
    if (req.session.user.role === 1) {
        return res.redirect('/');
    }
    next();
};
