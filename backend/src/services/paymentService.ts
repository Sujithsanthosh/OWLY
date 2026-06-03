import Razorpay from 'razorpay';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia' as any,
});

export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
  const options = {
    amount: amount * 100, // amount in smallest currency unit
    currency,
    receipt: `receipt_${Date.now()}`,
  };
  return await razorpay.orders.create(options);
};

export const createStripePaymentIntent = async (amount: number, currency: string = 'usd') => {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
  });
};

export const verifyRazorpaySignature = (orderId: string, paymentId: string, signature: string) => {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
  hmac.update(orderId + "|" + paymentId);
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
};
