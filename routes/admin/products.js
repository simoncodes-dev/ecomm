const express = require('express')
const { validationResult } = require('express-validator')

const productsRepo = require('../../repositories/products')
const newProductTemplate = require('../../views/admin/products/new')
const { requireProductTitle, requireProductPrice } = require('./validators')

const router = express.Router()

router.get('/admin/products', (req, res) => {

}) 

router.get('/admin/products/new', (req, res) => {
    res.send(newProductTemplate({}))
})

router.post('/admin/products/new', [requireProductTitle, requireProductPrice],
    (req, res) => {
        const errors = validationResult(req)
        
        req.on('data', data => {
            console.log(data.toString())
        })

        res.send('submitted')
    }
)

module.exports = router