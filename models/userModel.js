const db = require("../config/database");

const User = {
    findByUsername: (username, callback) => {
        const query = "SELECT * FROM users WHERE username = ? ";
        db.query(query, [username],callback);
    }
}

module.exports = User;