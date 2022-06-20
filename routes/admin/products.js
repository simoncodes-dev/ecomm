const express = require('express')
const multer = require('multer')

const { handleErrors } = require('./middlewares')
const productsRepo = require('../../repositories/products')
const newProductTemplate = require('../../views/admin/products/new')
const productsIndexTemplate = require('../../views/admin/products/index')
const { requireProductTitle, requireProductPrice } = require('./validators')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/admin/products', async (req, res) => {
    const products = await productsRepo.getAll()
    res.send(productsIndexTemplate({ products }))
}) 

router.get('/admin/products/new', (req, res) => {
    res.send(newProductTemplate({}))
})

router.post('/admin/products/new', upload.single('image'), [requireProductTitle, requireProductPrice],
    handleErrors(newProductTemplate), 
    async (req, res) => {

        const image = req.file.buffer.toString('base64')
        const { title, price } = req.body

        await productsRepo.create({ title, price, image })

        res.redirect('/admin/products')
    }
)

module.exports = router