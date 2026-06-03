import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
}

export default function MobileAuthScreens() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Logged in successfully!');
      setFormData({ email: '', password: '', confirmPassword: '', name: '', phone: '' });
    } catch (error) {
      Alert.alert('Error', 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Account created successfully!');
      setCurrentScreen('login');
      setFormData({ email: '', password: '', confirmPassword: '', name: '', phone: '' });
    } catch (error) {
      Alert.alert('Error', 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>OWLY</Text>
            <Text style={styles.subtitle}>Community Commerce</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setCurrentScreen('login')}
            style={[
              styles.tab,
              currentScreen === 'login' && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'login' && styles.activeTabText,
              ]}
            >
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurrentScreen('signup')}
            style={[
              styles.tab,
              currentScreen === 'signup' && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'signup' && styles.activeTabText,
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Form */}
        {currentScreen === 'login' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>
              Sign in to your account to continue
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#a1a1a1" />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#707070"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#a1a1a1" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#707070"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#a1a1a1"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[styles.button, loading && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Social Login */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>🍎</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>🔵</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>🔴</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Signup Form */}
        {currentScreen === 'signup' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>
              Join OWLY to start shopping and selling
            </Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color="#a1a1a1" />
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor="#707070"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#a1a1a1" />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#707070"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
              />
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Feather name="phone" size={20} color="#a1a1a1" />
              <TextInput
                style={styles.input}
                placeholder="Phone number (10 digits)"
                placeholderTextColor="#707070"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#a1a1a1" />
              <TextInput
                style={styles.input}
                placeholder="Password (min 8 chars)"
                placeholderTextColor="#707070"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#a1a1a1"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#a1a1a1" />
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor="#707070"
                secureTextEntry={!showPassword}
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  handleInputChange('confirmPassword', value)
                }
              />
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              onPress={handleSignup}
              disabled={loading}
              style={[styles.button, loading && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.termsText}>
              By signing up, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {currentScreen === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <TouchableOpacity
              onPress={() =>
                setCurrentScreen(currentScreen === 'login' ? 'signup' : 'login')
              }
            >
              <Text style={styles.footerLink}>
                {currentScreen === 'login' ? 'Sign up' : 'Sign in'}
              </Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1a1',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#8b5cf6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#707070',
  },
  activeTabText: {
    color: '#ffffff',
  },
  formContainer: {
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#a1a1a1',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222222',
    height: 54,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  forgotPassword: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#6d28d9',
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#222222',
  },
  dividerText: {
    color: '#707070',
    fontSize: 12,
    marginHorizontal: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  socialButton: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    fontSize: 24,
  },
  termsText: {
    fontSize: 12,
    color: '#707070',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  footerText: {
    fontSize: 14,
    color: '#a1a1a1',
  },
  footerLink: {
    color: '#8b5cf6',
    fontWeight: 'bold',
  },
});
