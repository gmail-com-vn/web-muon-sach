const path = require('path');
const http = require('http');
const express = require('express');
const morgan = require('morgan');
var methodOverride = require('method-override');
const handlebars = require('express-handlebars');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const socketIO = require('socket.io');

const flash = require('connect-flash');

const SortMiddleware = require('./app/middlewares/sortMiddleware');

const Category = require('./app/models/Category');
const Chat = require('./app/models/Chat');
const User = require('./app/models/User');
const { mutipleMongooseToObject } = require('../src/util/mongoose');

const route = require('./routes'); // tự nạp file index
const db = require('./config/db');

const app = express();

const server = http.createServer(app);
const io = socketIO(server);

// Connect to DB
db.connect()
    .then((result) => {
        // const port = 3000;
        // app.listen(port, () => {
        //     console.log(`Example app listening on port ${port}`);
        // });
    })
    .catch();

const store = new MongoDBStore({
    uri: 'mongodb://127.0.0.1:27017/book',
    collection: 'sessions',
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }));

app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch();
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.isAuthenticatedAdmin = req.session.role - 2;
    res.locals.user = req.session.user;
    Category.find({})
        .then((category) => {
            res.locals.category = mutipleMongooseToObject(category);
            next();
        })
        .catch();
    // next()
});

app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());

app.use(methodOverride('_method'));

//Custom middlewares
app.use(SortMiddleware);

// HTTP logger
app.use(morgan('combined'));

// Template engine
app.engine(
    'hbs',
    handlebars.engine({
        extname: '.hbs',
        helpers: require('./helpers/handlebars'),
    }),
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

// Rotes init
route(app);

io.on('connection', (socket) => {
    // console.log('Người dùng đã kết nối');

    socket.on('user selected', (user) => {
        console.log(`Người dùng ${user} đã được chọn`);
        socket.join(user); // Gia nhập phòng (room) có tên là tên người dùng
    });

    socket.on('chat message', async (msg, from, to) => {
        console.log(`Tin nhắn từ ${from} đến ${to}: ${msg}`);

        // Lưu tin nhắn vào cơ sở dữ liệu
        const newChatMessage = new Chat({ nguoiGuiId: from, nguoiNhanId: to, content: msg });
        await newChatMessage.save();

        // Gửi tin nhắn cho người dùng được chọn
        io.to(to).emit('chat message', msg, from);
    });

    socket.on('disconnect', () => {
        // console.log('Người dùng đã ngắt kết nối');
    });
});

server.listen(3000, () => {
    console.log(`Server đang lắng nghe trên cổng 3000`);
});
