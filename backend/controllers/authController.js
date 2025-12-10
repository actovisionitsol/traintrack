const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
        // Generate Token
        const user = { name: username };
        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '2h' }); // Expires in 2 hours
        return res.json({ ok: true, username: process.env.ADMIN_USER, accessToken: token });
    }
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
};
