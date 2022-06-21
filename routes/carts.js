const express = require('express')
const cartsRepo = require('../repositories/carts')
const productsRepo = require('../repositories/products')
const cartTemplate = require('../views/carts/show')

const router = express.Router() 

router.post('/cart/products', async (req, res) => {
    // Does user have a cart? Retrieve or create? 
    let cart
    if (!req.session.cartId) {
        cart = await cartsRepo.create({ items: [] })
        req.session.cartId = cart.id
    } else {
        cart = await cartsRepo.getOne(req.session.cartId)
    }
    // Increment quantty for existing product in cart, or add product to cart
    const existingItem = cart.items.find((item) => item.id === req.body.productId)
    if (existingItem) {
        existingItem.quantity++
    } else {
        cart.items.push({ id: req.body.productId, quantity: 1 })
    }
    await cartsRepo.update(cart.id, { 
        items: cart.items
    })

    // 
    
    console.log(cart)
    console.log(req.body.productId)

    res.redirect('/cart')
})

router.get('/cart', async (req, res) => {
    if (!req.session.cartId) {
        return res.redirect('/')
    }
    const cart = await cartsRepo.getOne(req.session.cartId)
    for (let item of cart.items) {
        const product = await productsRepo.getOne(item.id)
        item.product = product
    }
    res.send(cartTemplate({ items: cart.items }))
})

router.post('/cart/products/delete', async (req, res) => {
    const cart = await cartsRepo.getOne(req.session.cartId)
    const items = cart.items.filter((item) => item.id !== req.body.productId)
    cartsRepo.update(req.session.cartId, { items })
    res.redirect('/cart')
})

module.exports = router