require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(express.json());
app.use(cors()); // Allows requests from your mobile app

app.post("/create-payment-intent", async (req, res) => {
    try {
        const { amount } = req.body;

        const customer = await stripe.customers.create();
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: "2023-10-16" }
        );

        // Force PHP currency in test mode
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in centavos (₱20.00 = 2000)
            currency: "php", // Override default USD
            customer: customer.id,
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            customerId: customer.id,
            ephemeralKey: ephemeralKey.secret,
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
