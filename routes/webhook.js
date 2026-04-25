const exspress = require('express');
const router = exspress.Router();
const Stripe = require('stripe');
const db = require("../db");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/', exspress.raw({ type: 'application/json' }), async (req, res) => {
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

    console.log("EVENT TYPE:", event.type);

    //Når bruger køber PRO
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log("SESSION:", session);

        const orgId = session.metadata?.organizationId;
        
        if (!orgId) {
            console.error("No organizationId");
            return res.json({ received: true });
        }

        try {
            await db.query(
                "UPDATE organizations SET isPro = 1, stripeCustomerId = ? WHERE id = ?", 
                [session.customer, orgId]
            );

            
                console.log("Org is now Pro:", userId);
            } catch (err) {
                console.error("DB Error:", err);        
                }
            }

    //Når bruger stopper Subscription -> FREE
    if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object;

        const customerId = subscription.customer;

        console.log("SUB CANCEL:", customerId);

        try {
            await db.query(
                "UPDATE organizations SET isPro = 0 WHERE stripeCustomerId = ?",
                [customerId]
            );
        } catch (err) {
            console.error("DB Error:", err);
        }         
    }

    //Når Betalling fejler
    if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object;

        const customerId = invoice.customer;

        console.log("PAYMENT FAILED:", customerId);

        try {
            await db.query(
                "UPDATE organizations SET isPro = 0 WHERE stripeCustomerId = ?",
                [customerId]
            );
        } catch (err) {
            console.error("DB Error:", err);
        }
    }
    res.json({ received: true });
});

module.exports = router;