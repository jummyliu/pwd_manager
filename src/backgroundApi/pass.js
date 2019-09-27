import sqlite3 from 'sqlite3'

const sqlite = sqlite3.verbose()
const db = new sqlite.Database('./info.db', err => {
  if (err) {
    throw err
  }
})

db.serialize(async () => {
  const sql = `
  CREATE TABLE IF NOT EXISTS infos (
    id integer PRIMARY KEY AUTOINCREMENT,
    title varchar(255),
    name varchar(255),
    pass varchar(255),
    addr varchar(255),
    tag varchar(255),
    description varchar(255),
    create_time datetime DEFAULT (datetime(CURRENT_TIMESTAMP,'localtime')),
    update_time datetime DEFAULT (datetime(CURRENT_TIMESTAMP,'localtime'))
  );
  `
  db.exec(sql)
})

export const Register = (ipcMain) => {
  ipcMain.on('pass-search', async (event, payload) => {
    const params = [payload.search, payload.search, payload.search, payload.search, payload.search]
    const countSQL = `select count(*) count from infos where name like '%'||?||'%' or title like '%'||?||'%' or addr like '%'||?||'%' or description like '%'||?||'%' or tag like '%'||?||'%'`
    const dataSQL = `select * from infos where name like '%'||?||'%' or title like '%'||?||'%' or addr like '%'||?||'%' or description like '%'||?||'%' or tag like '%'||?||'%' order by update_time desc limit ?, ?`

    const count = await query(countSQL, params)
    const page = parsePage(payload.page, payload.size)
    const result = await queryAll(dataSQL, [...params, page.begin, page.size])
    event.sender.send('pass-search-reply', {
      list: result.map(item => ({
        ...item,
        tag: item.tag.split(','),
        desc: item.description
      })),
      count: count && count.count
    })
  })

  ipcMain.on('pass-add', async (event, payload) => {
    let tag = payload.tag.join(',')
    if (!tag) {
      tag = '未标记'
    }
    const params = [payload.name, payload.pass, payload.title, payload.addr, payload.desc, tag]
    const sql = `insert into infos (name, pass, title, addr, description, tag) values (?, ?, ?, ?, ?, ?)`

    await exec(sql, params)
  })
  ipcMain.on('pass-update', async (event, payload) => {
    let tag = payload.tag.join(',')
    if (!tag) {
      tag = '未标记'
    }
    const params = [payload.name, payload.pass, payload.title, payload.addr, payload.desc, tag, payload.id]
    const sql = `update infos set name = ?, pass = ?, title = ?, addr = ?, description = ?, tag = ? where id = ?`
    await exec(sql, params)
  })
  ipcMain.on('pass-delete', async (event, payload) => {
    const params = [payload.id]
    const sql = `delete from infos where id = ?`
    await exec(sql, params)
  })
}

export const queryAll = (sql, params) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(sql)
    stmt.all(params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

export const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(sql)
    stmt.get(params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

export const exec = (sql, params) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(sql)
    stmt.run(params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

/**
 *
 * @param {any} page the page of table, default 1
 * @param {any} size the size of table, default 10
 *
 * @returns {object} begin: sql begin; size: sql size
 */
export const parsePage = (page, size) => {
  let p = parseInt(page, 10)
  let s = parseInt(size, 10)
  if (isNaN(p)) {
    p = 1
  }
  if (isNaN(s)) {
    s = 10
  }

  return {
    begin: (p - 1) * s,
    size: s
  }
}
