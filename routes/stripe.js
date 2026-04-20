const express = require('express');
const { url } = require('../cloudinary');
const router = express.Router();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
    const { priceId } = req.body;
    
    try {
        const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
            price: priceId,
            quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: `https://lucache.com/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://lucache.com/cancel`,
        });
    
        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ error: 'An error occurred while creating the checkout session' });
    }
    });

module.exports = router;