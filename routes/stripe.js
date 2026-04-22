const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
    console.log("CREATE CHECKOUT SESSION BODY:", req.body);
    const { priceId, userId } = req.body;
    
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

        success_url: `https://lucache.com/success`,
        cancel_url: `https://lucache.com/cancel`,

        metadata: {
            userId: String(userId),
        },
     });


    console.log("SESSION:", session);

        res.json({ 
            url: session.url,
        });
    } catch (error) {
        console.error('Stripe Error:', error.message);
        res.status(500).json({ error: 'An error occurred while creating the checkout session' });
    }
 });

module.exports = router;