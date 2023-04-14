const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");

// 对密码进行哈希加密
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { salt, hash };
}

// 创建数据库
const db = new sqlite3.Database("users.db");

// 创建表格
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    uid INTEGER PRIMARY KEY,
    account TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    salt TEXT NOT NULL
  )
`);

// 添加用户
function addUser(account, password) {
  // 检查账号格式是否合法
  if (!account.match(/^\d{11}@?(\w+\.)+\w+$/)) {
    console.error("账号必须为手机号或邮箱");
    return;
  }

  // 检查密码是否符合要求
  if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/)) {
    console.error("密码必须是8-15位，至少包含英文符号、大小写英文和数字中的两种");
    return;
  }

  // 对密码进行哈希加密
  const hashedPassword = hashPassword(password);

  // 插入用户数据
  const stmt = db.prepare(
    "INSERT INTO users (account, password, salt) VALUES (?, ?, ?)"
  );
  stmt.run(account, hashedPassword.hash, hashedPassword.salt, function(err) {
    if (err) {
      console.error(err);
    } else {
      console.log(`用户 ${account} 已添加到数据库中，uid 为 ${this.lastID}`);
    }
  });
  stmt.finalize();
}
function checkPassword(uid, password, callback) {
    let sql, params;
    if (Number.isInteger(uid)) {
      sql = "SELECT password, salt FROM users WHERE uid = ?";
      params = [uid];
    } else {
      sql = "SELECT password, salt FROM users WHERE account = ?";
      params = [uid];
    }
  
    db.get(sql, params, (err, row) => {
      if (err) {
        callback(err, null);
      } else if (!row) {
        callback(null, false);
      } else {
        const { password: hashedPassword, salt } = row;
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
        const isMatch = hashedPassword === hash;
        callback(null, isMatch);
      }
    });
  }
  //查找用户
  function findUserById(uid, callback) {
    const sql = "SELECT * FROM users WHERE uid = ?";
    db.get(sql, [uid], (err, row) => {
      if (err) {
        callback(err, null);
      } else if (!row) {
        callback(null, null);
      } else {
        const user = {
          uid: row.uid,
          account: row.account,
          password: row.password
        };
        callback(null, user);
      }
    });
  }
  
  //删除用户
  function deleteUserById(uid, callback) {
    const sql = "DELETE FROM users WHERE uid = ?";
    db.run(sql, [uid], (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  }
  
module.exports = {
  addUser,
  checkPassword,
  deleteUserById,
  findUserById
};
