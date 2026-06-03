import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import { colors } from '../theme/colors';
import { ShoppingBag, CreditCard } from 'lucide-react-native';
import { getAuthToken } from '../services/authService';

const API_URL = 'http://localhost:5000/api';

export default function CheckoutScreen({ route, navigation }: any) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const { amount = 65.00 } = route.params || {};

  const fetchPaymentSheetParams = async () => {
    const token = await getAuthToken();
    const response = await axios.post(`${API_URL}/orders`, {
      items: [{ product_id: 1, product_type: 'fashion', quantity: 1, price: amount }],
      total_amount: amount,
      delivery_address: 'Mobile User Address',
      payment_method: 'stripe',
      currency: 'USD'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      paymentIntent: response.data.paymentData.client_secret,
      orderId: response.data.orderId,
    };
  };

  const initializePaymentSheet = async () => {
    setLoading(true);
    const { paymentIntent, orderId } = await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      paymentIntentClientSecret: paymentIntent,
      merchantDisplayName: 'Owly Platform',
      defaultBillingDetails: {
        name: 'Jane Doe',
      }
    });

    if (!error) {
      setLoading(false);
      openPaymentSheet(orderId);
    } else {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  const openPaymentSheet = async (orderId: string) => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      const token = await getAuthToken();
      await axios.post(`${API_URL}/orders/confirm`, {
        orderId,
        paymentIntentId: 'pi_mobile_simulated' // In real app, stripe handles this
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', 'Your order is confirmed!');
      navigation.navigate('DeliveryTracking', { orderId: `OWLY-${Math.floor(Math.random() * 10000)}` });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ShoppingBag size={48} color={colors.primary} />
        <Text style={styles.title}>Secure Checkout</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Amount</Text>
        <Text style={styles.amount}>${amount.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={styles.payButton}
        onPress={initializePaymentSheet}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="black" />
        ) : (
          <>
            <CreditCard size={20} color="black" />
            <Text style={styles.payButtonText}>Pay with Card (Stripe)</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Payments are encrypted and secure.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 16,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    padding: 32,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    marginBottom: 32,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amount: {
    color: 'white',
    fontSize: 48,
    fontWeight: '900',
    marginTop: 8,
  },
  payButton: {
    backgroundColor: 'white',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  payButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
  }
});
