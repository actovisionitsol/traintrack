const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    const { username, password } = req.body;

    const validUsers = [
        { username: process.env.ADMIN_USER, password: process.env.ADMIN_PASS },
        { username: "user", password: "Userpassword4321*" }
    ];

    const foundUser = validUsers.find(u => u.username === username && u.password === password);

    if (foundUser) {
        // Generate Token
        const userPayload = { name: foundUser.username };
        const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '2h' }); // Expires in 2 hours
        return res.json({ ok: true, username: foundUser.username, accessToken: token });
    }
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
};
