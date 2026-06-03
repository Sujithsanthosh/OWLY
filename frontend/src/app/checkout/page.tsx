"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ShoppingBag, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function StripeCheckoutForm({ clientSecret, orderId }: { clientSecret: string, orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "An error occurred");
    } else {
      setMessage("An unexpected error occurred.");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <CreditCard size={18} />}
        Pay Now
      </button>
      {message && <div className="text-red-500 text-sm font-medium">{message}</div>}
    </form>
  );
}

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'stripe'>('razorpay');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await api.post('/orders', {
        items: [
          { product_id: 1, product_type: 'fashion', quantity: 1, price: 65.00 }
        ],
        total_amount: 65.00,
        delivery_address: '123 Owly Street, Tech City',
        payment_method: paymentMethod
      });
      setOrderData(res.data);

      if (paymentMethod === 'razorpay') {
        const { paymentData, orderId } = res.data;
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: "Owly Platform",
          description: "Purchase from Owly",
          order_id: paymentData.razorpay_order_id,
          handler: async (response: any) => {
            await api.post('/orders/confirm', {
              orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              razorpayOrderId: response.razorpay_order_id
            });
            window.location.href = `/checkout/success?orderId=${orderId}`;
          },
          theme: { color: "#000000" }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="space-y-6">
        {/* Order Summary */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ShoppingBag size={20} className="text-purple-400" />
            Order Summary
          </h2>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400">Urban Oversized Hoodie</span>
            <span className="font-bold">$65.00</span>
          </div>
          <div className="border-t border-white/5 mt-4 pt-4 flex justify-between items-center text-xl font-black">
            <span>Total</span>
            <span className="text-purple-400">$65.00</span>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-purple-400" />
            Shipping Address
          </h2>
          <p className="text-gray-400">123 Owly Street, Tech City</p>
        </div>

        {/* Payment Method Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setPaymentMethod('razorpay')}
            className={`flex-1 py-3 rounded-2xl border font-bold transition-all ${paymentMethod === 'razorpay' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/10 bg-zinc-900 text-gray-500'}`}
          >
            Razorpay
          </button>
          <button
            onClick={() => setPaymentMethod('stripe')}
            className={`flex-1 py-3 rounded-2xl border font-bold transition-all ${paymentMethod === 'stripe' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/10 bg-zinc-900 text-gray-500'}`}
          >
            Stripe
          </button>
        </div>

        {/* Payment Logic */}
        {!orderData || paymentMethod === 'razorpay' ? (
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
            {paymentMethod === 'razorpay' ? 'Initialize Razorpay' : 'Checkout'}
          </button>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret: orderData.paymentData.client_secret, appearance: { theme: 'night' } }}>
            <StripeCheckoutForm clientSecret={orderData.paymentData.client_secret} orderId={orderData.orderId} />
          </Elements>
        )}
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
    </div>
  );
}
