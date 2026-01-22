const pool = require('./connection');

async function tableExists(conn, tableName) {
  const [rows] = await conn.query(
    `
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
    `,
    [tableName]
  );
  return rows.length > 0;
}

async function constraintExists(conn, constraintName) {
  const [rows] = await conn.query(
    `
    SELECT CONSTRAINT_NAME
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND CONSTRAINT_NAME = ?
    `,
    [constraintName]
  );
  return rows.length > 0;
}

async function initSchema() {
  const conn = await pool.getConnection();

  try {
    console.log('🔧 Initializing database schema...');

    /* =========================
       USERS
    ========================= */
    if (!(await tableExists(conn, 'users'))) {
      await conn.query(`
        CREATE TABLE users (
          id INT NOT NULL AUTO_INCREMENT,
          full_name VARCHAR(100) NOT NULL,
          username VARCHAR(50) NOT NULL,
          email VARCHAR(100) NOT NULL,
          phone VARCHAR(15) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          is_deleted TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY username (username),
          UNIQUE KEY email (email),
          UNIQUE KEY phone (phone)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✅ users table created');
    }

    /* =========================
       LEDGERS
    ========================= */
    if (!(await tableExists(conn, 'ledgers'))) {
      await conn.query(`
        CREATE TABLE ledgers (
          id INT NOT NULL AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          sub_note VARCHAR(255),
          created_by INT NOT NULL,
          is_deleted TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY created_by (created_by)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✅ ledgers table created');
    }

    /* =========================
       LEDGER_USERS
    ========================= */
    if (!(await tableExists(conn, 'ledger_users'))) {
      await conn.query(`
        CREATE TABLE ledger_users (
          id INT NOT NULL AUTO_INCREMENT,
          ledger_id INT NOT NULL,
          user_id INT NOT NULL,
          role ENUM('admin','writer','reader') NOT NULL,
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_active TINYINT(1) DEFAULT 1,
          PRIMARY KEY (id),
          UNIQUE KEY ledger_user_unique (ledger_id, user_id),
          KEY user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✅ ledger_users table created');
    }

    /* =========================
       STORE_ITEMS
    ========================= */
    if (!(await tableExists(conn, 'store_items'))) {
      await conn.query(`
        CREATE TABLE store_items (
          id INT NOT NULL AUTO_INCREMENT,
          ledger_id INT NOT NULL,
          item_code VARCHAR(20) NOT NULL,
          name VARCHAR(100) NOT NULL,
          price DECIMAL(10,2),
          quantity DECIMAL(10,2) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          created_by INT NOT NULL,
          is_deleted TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY ledger_item_code (ledger_id, item_code),
          KEY created_by (created_by)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✅ store_items table created');
    }

    /* =========================
       CONSUMED_ITEMS
    ========================= */
    if (!(await tableExists(conn, 'consumed_items'))) {
      await conn.query(`
        CREATE TABLE consumed_items (
          id INT NOT NULL AUTO_INCREMENT,
          ledger_id INT NOT NULL,
          store_item_id INT NOT NULL,
          item_code VARCHAR(20) NOT NULL,
          quantity_before DECIMAL(10,2) NOT NULL,
          quantity_consumed DECIMAL(10,2) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          responsible INT NOT NULL,
          reason VARCHAR(255),
          is_deleted TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY ledger_id (ledger_id),
          KEY store_item_id (store_item_id),
          KEY responsible (responsible)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✅ consumed_items table created');
    }

    /* =========================
       FAULTY_ITEMS
    ========================= */
    if (!(await tableExists(conn, 'faulty_items'))) {
      await conn.query(`
        CREATE TABLE faulty_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ledger_id INT NOT NULL,
          store_item_id INT NOT NULL,
          item_code VARCHAR(20) NOT NULL,
        
          quantity_before DECIMAL(10,2) NOT NULL,
          quantity_faulty DECIMAL(10,2) NOT NULL,
          unit VARCHAR(50) NOT NULL,
        
          reported_by INT NOT NULL,
          reason VARCHAR(255),
        
          is_deleted TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
          FOREIGN KEY (ledger_id) REFERENCES ledgers(id),
          FOREIGN KEY (store_item_id) REFERENCES store_items(id),
          FOREIGN KEY (reported_by) REFERENCES users(id)
        );
      `);
      console.log('✅ faulty_items table created');
    }

    /* =========================
       FOREIGN KEYS
    ========================= */

    // ledgers.created_by → users.id
    if (!(await constraintExists(conn, 'ledgers_ibfk_1'))) {
      await conn.query(`
        ALTER TABLE ledgers
        ADD CONSTRAINT ledgers_ibfk_1
        FOREIGN KEY (created_by) REFERENCES users(id)
      `);
    }

    // ledger_users FKs
    if (!(await constraintExists(conn, 'ledger_users_ibfk_1'))) {
      await conn.query(`
        ALTER TABLE ledger_users
        ADD CONSTRAINT ledger_users_ibfk_1
        FOREIGN KEY (ledger_id) REFERENCES ledgers(id)
      `);
    }

    if (!(await constraintExists(conn, 'ledger_users_ibfk_2'))) {
      await conn.query(`
        ALTER TABLE ledger_users
        ADD CONSTRAINT ledger_users_ibfk_2
        FOREIGN KEY (user_id) REFERENCES users(id)
      `);
    }

    // store_items FKs
    if (!(await constraintExists(conn, 'store_items_ibfk_1'))) {
      await conn.query(`
        ALTER TABLE store_items
        ADD CONSTRAINT store_items_ibfk_1
        FOREIGN KEY (ledger_id) REFERENCES ledgers(id)
      `);
    }

    if (!(await constraintExists(conn, 'store_items_ibfk_2'))) {
      await conn.query(`
        ALTER TABLE store_items
        ADD CONSTRAINT store_items_ibfk_2
        FOREIGN KEY (created_by) REFERENCES users(id)
      `);
    }

    // consumed_items FKs
    if (!(await constraintExists(conn, 'consumed_items_ibfk_1'))) {
      await conn.query(`
        ALTER TABLE consumed_items
        ADD CONSTRAINT consumed_items_ibfk_1
        FOREIGN KEY (ledger_id) REFERENCES ledgers(id)
      `);
    }

    if (!(await constraintExists(conn, 'consumed_items_ibfk_2'))) {
      await conn.query(`
        ALTER TABLE consumed_items
        ADD CONSTRAINT consumed_items_ibfk_2
        FOREIGN KEY (store_item_id) REFERENCES store_items(id)
      `);
    }

    if (!(await constraintExists(conn, 'consumed_items_ibfk_3'))) {
      await conn.query(`
        ALTER TABLE consumed_items
        ADD CONSTRAINT consumed_items_ibfk_3
        FOREIGN KEY (responsible) REFERENCES users(id)
      `);
    }

    console.log('🎉 Database schema ready');
  } catch (err) {
    console.error('❌ Schema initialization failed:', err);
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = initSchema;
