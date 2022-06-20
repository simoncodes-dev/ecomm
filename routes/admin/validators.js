const { check } = require('express-validator')
const usersRepo = require('../../repositories/users')

module.exports = {
    requireEmail: check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom(async (email) => {
            const existingUser = await usersRepo.getOneBy({ email })
            if (existingUser) {
                throw new Error('Email in use')
            }
        }),
    requirePassword: check('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters'),
    requirePasswordConfirmation: check('passwordConfirmation')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters')
        .custom((passwordConfirmation, { req }) => {
            if (passwordConfirmation !== req.body.password) {
                throw new Error('Passwords must match')
            }
            return true
        }),
    requireEmailExists: check('email')
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('Must provide a valid email')
    .custom(async (email) => {
        const user = await usersRepo.getOneBy({ email })
        if (!user) {
            throw new Error ('Email not recognized')
        }
        return true
    }),
    requireValidPassword: check('password')
    .trim()
    .custom(async (password, { req }) => {
        const user = await usersRepo.getOneBy({email: req.body.email})    
        if (!user) {
            throw new Error('Invalid password 1')
        }
        const validPassword = await usersRepo.comparePasswords(
            user.password, 
            password
        )
        if (!validPassword){
            throw new Error('Invalid password 2')
        }
        return true
    })
}