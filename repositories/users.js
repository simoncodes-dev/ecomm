const fs = require('fs')
const crypto = require('crypto')
const util = require('util')
const Repository = require('./repository')

const crypt = util.promisify(crypto.scrypt)

class UsersRepository extends Repository {
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
}

module.exports = new UsersRepository('users.json')