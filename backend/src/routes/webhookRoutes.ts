import { Router, Request, Response } from 'express';
import express from 'express';
import { handleRazorpayWebhook, handleStripeWebhook } from '../controllers/webhookController';

const router = Router();

// Razorpay webhook - must be raw body for signature verification
router.post('/razorpay', express.raw({ type: 'application/json' }), handleRazorpayWebhook);

// Stripe webhook - must be raw body for signature verification  
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Health check for webhooks
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Webhook service is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
