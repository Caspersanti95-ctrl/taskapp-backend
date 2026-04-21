const express = require('express');
const { url } = require('../cloudinary');
const router = express.Router();


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
    console.log("CREATE CHECKOUT SESSION BODY:", req.body);
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
        metadata: {
            userId: req.user?.id || "123"
        }

        });


    console.log("SESSION:", session);

        res.json({ 
            url: session.url
        });
    } catch (error) {
        console.error('Stripe Error:', error.message);
        res.status(500).json({ error: 'An error occurred while creating the checkout session' });
    }
    });

    router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body, 
                sig, 
                process.env.STRIPE_WEBHOOK_SECRET
            );

        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            console.log('Checkout session completed:', session);
        }

        res.json({ received: true });
    });

module.exports = router;