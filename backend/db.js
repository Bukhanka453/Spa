import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'shop.db'))

db.pragma('foreign_keys = ON')

// Автоинициализация схемы при первом запуске
const schema = fs.readFileSync(path.join(__dirname, 'init-db.sql'), 'utf-8')
db.exec(schema)

export default db