import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, KeyboardAvoidingView, StatusBar, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme } from '../theme';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { register, isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Email Validation
    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address with an @ symbol.');
      return;
    }

    // Phone Validation (10 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      Alert.alert('Invalid Phone', 'Phone number must be exactly 10 digits.');
      return;
    }

    // Password Validation (8 chars)
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    const result = await register(name, email, password, phone);
    if (!result.success) {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <View style={[styles.logoCircle, { backgroundColor: theme.surface }]}>
            <Image 
              source={require('../../assets/brand_logo.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.brandName, { color: theme.text }]}>Join Coconut Republik</Text>
          <Text style={[styles.tagline, { color: theme.subtext }]}>Villa & Restaurant</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="account-outline" size={20} color={theme.subtext} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor={theme.subtext}
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="email-outline" size={20} color={theme.subtext} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={theme.subtext}
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="phone-outline" size={20} color={theme.subtext} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={theme.subtext}
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={theme.subtext} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Create Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              placeholderTextColor={theme.subtext}
            />
          </View>

          <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleRegister} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Create Account</Text>
            <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" style={styles.btnIcon} />
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.subtext }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.linkText, { color: theme.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 30, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 35 },
  logoCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  brandName: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: 14, fontWeight: '500', marginTop: 4 },
  formContainer: { width: '100%' },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 15, 
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 60,
    borderWidth: 1
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, fontWeight: '500' },
  button: { 
    height: 60, 
    borderRadius: 15, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  btnIcon: { marginLeft: 10 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { fontSize: 15, fontWeight: '500' },
  linkText: { fontSize: 15, fontWeight: '700' }
});

export default RegisterScreen;
