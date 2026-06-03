import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Home, ShoppingBag, Users, User } from 'lucide-react-native';
import FeedScreen from '../screens/FeedScreen';
import ShopScreen from '../screens/ShopScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import LiveStreamScreen from '../screens/LiveStreamScreen';
import DeliveryTrackingScreen from '../screens/DeliveryTrackingScreen';
import AIStylistScreen from '../screens/AIStylistScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'black',
          borderTopColor: 'rgba(255,255,255,0.1)',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Tribes"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: 'black' },
          headerTintColor: 'white',
          headerTitle: 'Checkout'
        }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          presentation: 'modal'
        }}
      />
      <Stack.Screen
        name="LiveStream"
        component={LiveStreamScreen}
        options={{
          presentation: 'fullScreenModal'
        }}
      />
      <Stack.Screen
        name="DeliveryTracking"
        component={DeliveryTrackingScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="AIStylist"
        component={AIStylistScreen}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
}
