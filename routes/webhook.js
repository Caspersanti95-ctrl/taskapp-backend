const exspress = require('express');
const router = exspress.Router();
const Stripe = require('stripe');
const db = require("../db");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/webhook', exspress.raw({ type: 'application/json' }), async (req, res) => {
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

        const userId = session.metadata?.userId;
        console.log("Checkout session completed:", session);

        try {
            await db.query(
                "UPDATE users SET isPro = 1 WHERE id = ?", 
                [userId]
            );

            
                console.log("User is now Pro:", userId);
            } catch (err) {
                console.error("DB Error:", err);        
                }
            }

    res.json({ received: true });
});

module.exports = router;