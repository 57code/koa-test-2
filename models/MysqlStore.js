const mysql = require('mysql')
const CREATE_SQL = `CREATE TABLE IF NOT EXISTS session_store(
                    session_id VARCHAR(255) NOT NULL, 
                    expires BIGINT NULL,data TEXT NULL,
                    PRIMARY KEY(session_id), KEY session_store_expires(expires))`;
const GET_SQL = `select * from session_store where session_id=? and expires>?`;
const SET_SQL = `INSERT INTO session_store(session_id, expires, data) 
                values(?,?,?) ON DUPLICATE KEY update expires=?,data=?`;

class MysqlStore {
    constructor(opts, pool) {
        // 定时清理
        // ...

        // 连接池判断
        if (pool) {
            this.connection = pool;
        } else {
            if (!opts || !opts.host || !opts.user || !opts.password) {
                throw new Error('需要额外配置数据库连接参数')
            }
            this.connection = mysql.createPool(opts);
        }

        // 执行建表逻辑
        this.query(CREATE_SQL)
    }

    // 适配器必须实现以下三个方法
    async get(sid, maxAge, {rolling}) {
        const rows = await this.query(GET_SQL, [sid, Date.now()]);
        let session = null;
        if (rows && rows[0] && rows[0].data) {
            session = JSON.parse(rows[0].data);
        }
        return session;
    }

    async set(sid, sess, maxAge, {rolling, changed}) {
        const expires = maxAge === 'session' ?
            new Date(Date.now()-86400000).getTime() :
            new Date(Date.now() + maxAge);
        const data = JSON.stringify(sess);
        const rows = await this.query(SET_SQL,
            [sid, expires, data, expires, data]);
        return rows;
    }

    async destroy(key) {
        // ...
    }

    query(sql, value) {
        return new Promise((resolve, reject) => {
            // resolve函数在异步操作成功时执行
            // reject函数在异步操作失败时执行
            this.connection.query(sql, value, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            })
        })
    }
}

module.exports = MysqlStore