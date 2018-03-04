const express = require('express');
const session = require('express-session');

const app = express();
app.use(express.urlencoded({extended: false}));

app.use(session({
    secret: 'MYSECRETCODE',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60*60*1000}   // unit: ms, if inactive, session expires in 1 hour
}));

// Authentication & Authorization middleware
const auth = function(req, res, next) {
    // hardcoded authentication in this demo => username: test, password: ppp 
    // in the real app, you will lookup the Database for username/password info
    if (req.session && req.session.user
        && req.session.user.name == 'test' && req.session.user.pass == 'ppp') {
                return next();
    } else {
       res.redirect('/error'); // or redirect to login page
    }
}

app.get('/', (req, res) => {
    res.redirect('/login');
});

// login prompt endpoint
app.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/userhome');
    } else {
        let page =
        `<html><head><title>Login</title></head><body>
         <h2>Login Page</h2>
        <form action="/login" method="post">
          username: <input type="text" name="name" size="20"><br/>
          password: <input type="password" name="pass" size="20"><br/>
           <input type="submit" value="Login">
        </form>
        </body></html>`
        res.send(page);
    }
});

// login endpoint
app.post('/login', (req, res) => {
    req.session.user = {
        'name': req.body.name,
        'pass': req.body.pass
    };
    res.redirect('/userhome');
});

// logout endpoint
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.send('logout success!');
});

// get userhome endpoint
// Use 'auth' middleware when the page requires authentication
app.get('/userhome', auth, (req, res) => {
    let page = `
         Hi, ${req.session.user.name}!<br>
         This is User's Home Page!
        `
    res.send(page);
});

// get content endpoint
// Use 'auth' middleware when the page requires authentication
app.get('/content', auth, (req, res) => {
    let page = `
         Hi, ${req.session.user.name}!<br>
         You are now browsing this page because you've logged in.
        `
    res.send(page);
});

// authentication failed
app.get('/error', (req, res) => {
    res.send("login failed - unauthorized access");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`The server is running at port ${PORT}`);
});