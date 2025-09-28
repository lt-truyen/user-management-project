const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const crypto = require('crypto');

const transporter = require("../config/mailer");

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_EXPIRES_TOKEN = process.env.JWT_EXPIRES_TOKEN || '30m';

const createUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password required' });

    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(409).json({ message: 'Email already used' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)', [name, email, hashed, phone || null]);

    const insertedId = result.insertId;
    const [rows] = await pool.query('SELECT id, name, email, phone, created_at, updated_at FROM users WHERE id = ?', [insertedId]);
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const listUsers = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (page < 1) page = 1;
    const offset = (page - 1) * limit;
    let rows, total;
    const [totalRows] = await pool.query('SELECT COUNT(*) as cnt FROM users');
    
    if (req.user.role === "user") {
      [rows] = await pool.query(
        "SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = ?",
        [req.user.id]
      );
      total = 1;
    }else{
      total = totalRows[0].cnt;
      [rows] = await pool.query('SELECT id, name, email, phone, role, created_at, updated_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
    }
    

    res.json({
      data: rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, role } = req.body;

    // Nếu là user thường -> chỉ cho update chính mình
    if (req.user.role === "user" && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    // Kiểm tra user tồn tại
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    let hashedPassword = rows[0].password; // giữ nguyên mật khẩu cũ nếu không đổi
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    if (role === "user") {
      role = undefined; // bỏ role đi, giữ nguyên
    }

    await pool.query(
      "UPDATE users SET name = ?, email = ?, phone = ?, password = ?, role = ? WHERE id = ?",
      [name, email, phone, hashedPassword, role || rows[0].role, id]
    );

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateUser };


const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // payload có thể thêm name/role nếu cần
    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


const logout = async (req, res) => {
  res.json({ message: 'Logged out (clear token on client)' });
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(404).json({ message: "User not found" });

    const user = rows[0];

    // tạo token reset password
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_TOKEN });
    const expires =  Date.now() + parseExpireString(JWT_EXPIRES_TOKEN);
    console.log(token)
    console.log(expires)
    console.log(user.id)
    await pool.query("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?", [
      token,
      expires,
      user.id,
    ]);


    const resetLink = `${process.env.CLIENT_URL}/users/reset-password/${token}`;
    console.log("ForgotPassword:"+resetLink);

    // gửi email
    await transporter.sendMail({
      from: `"Support" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: "Reset Password from test-project kenhchetao",
      html: `<p>Bấm vào link bên dưới để reset mật khẩu:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>Link sẽ hết hạn sau 15 phút.</p>`
    });

    res.json({ message: "Email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Reset password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  console.log("test:"+token);
  console.log("test:"+password);
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?",
      [token, Date.now()]
    );
    if (!rows.length) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = rows[0];
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
      [hash, user.id]
    );

    res.json({ message: "Password reset successful. Please login again." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

function parseExpireString(expireStr) {
  if (!expireStr) return 0;

  const unit = expireStr.slice(-1); // m, h, d
  const value = parseInt(expireStr);

  switch (unit) {
    case "m": return value * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "d": return value * 24 * 60 * 60 * 1000;
    default: return value; // nếu truyền ms trực tiếp
  }
}

module.exports = {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  login,
  logout,
  forgotPassword,
  resetPassword
};
