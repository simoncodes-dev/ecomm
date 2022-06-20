const fs = require('fs')
const crypto = require('crypto')
const util = require('util')

const crypt = util.promisify(crypto.scrypt)

class UsersRepository {
    constructor(file) {
        if(!file) {
            throw new Error('Filename must be provided to create a repository')
        }

        this.file = file
        try {
            fs.accessSync(this.file)
        } catch (e) {
            fs.writeFileSync(this.file, '[]')
        }
    }

    async getAll() {
        return JSON.parse(await fs.promises.readFile(this.file, { encoding: 'utf8' }))
    }

    async create(attrs) {
        attrs.id = this.randomId()
        
        const salt = crypto.randomBytes(8).toString('hex')
        
        const buffer = await crypt(attrs.password, salt, 64)

        const records = await this.getAll()
        const record = {
            ...attrs,
            password: `${buffer.toString('hex')}.${salt}`
        }
        records.push(record)

        await this.writeAll(records)
        return record
    }

    async comparePasswords(saved, supplied) {
        const [hashed, salt] = saved.split('.')
        const hashedSuppliedBuffer = await crypt(supplied, salt, 64)

        return hashed === hashedSuppliedBuffer.toString('hex')
    }

    async writeAll(records) {
        await fs.promises.writeFile(this.file, JSON.stringify(records, null, 2), { encoding: 'utf8' })
    }

    randomId() {
        return crypto.randomBytes(4).toString('hex')
    }

    async getOne(id) {
        const records = await this.getAll()
        return records.find((record) => record.id === id)
    }

    async delete(id) {
        const records = await this.getAll()
        const filteredRecords = records.filter(record => record.id !== id)
        await this.writeAll(filteredRecords)
    }

    async update(id, attrs) {
        const records = await this.getAll()
        const record = records.find(record => record.id === id)
        if (!record) {
            throw new Error (`Record with id of ${id} not found`)
        }

        Object.assign(record, attrs)
        await this.writeAll(records)
    }

    async getOneBy(filters) {
        const records = await this.getAll()
        for (let record of records) {
            let found = true
            for (let key in filters) {
                if (record[key] !== filters[key]) {
                    found = false
                }
            }
            if (found) {
                return record
            }
        }
    }
}

module.exports = new UsersRepository('users.json')