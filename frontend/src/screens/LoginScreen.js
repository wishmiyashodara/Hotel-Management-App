import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, KeyboardAvoidingView, StatusBar, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme } from '../theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = await login(cleanEmail, password);
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
          <Text style={[styles.brandName, { color: theme.text }]}>Coconut Republik</Text>
          <Text style={[styles.tagline, { color: theme.subtext }]}>Villa & Restaurant</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome Back</Text>
          <Text style={[styles.subText, { color: theme.subtext }]}>Sign in to continue</Text>

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
            <MaterialCommunityIcons name="lock-outline" size={20} color={theme.subtext} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              placeholderTextColor={theme.subtext}
            />
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: theme.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Sign In</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" style={styles.btnIcon} />
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.subtext }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.linkText, { color: theme.primary }]}>Create Account</Text>
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
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  brandName: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  tagline: { fontSize: 14, fontWeight: '500', marginTop: 4 },
  formContainer: { width: '100%' },
  welcomeText: { fontSize: 24, fontWeight: '700' },
  subText: { fontSize: 16, marginBottom: 30, marginTop: 5 },
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
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 30 },
  forgotText: { fontWeight: '600', fontSize: 14 },
  button: { 
    height: 60, 
    borderRadius: 15, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
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

export default LoginScreen;
