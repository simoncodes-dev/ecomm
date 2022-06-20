const fs = require('fs')
const crypto = require('crypto')

module.exports = class Repository {
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

    async create(attrs) {
        // Give a random ID to the object
        attrs.id = this.randomId()
        // Get all records from the filestore
        const records = await this.getAll()
        // Push the new object into the records array
        records.push(attrs)
        // write the new array to the filestore
        await this.writeAll(records)
        // return the object with the ID
        return attrs
    }

    async getAll() {
        return JSON.parse(await fs.promises.readFile(this.file, { encoding: 'utf8' }))
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