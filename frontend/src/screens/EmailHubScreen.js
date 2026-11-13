import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LightTheme, DarkTheme } from '../theme';
import apiClient from '../api/client';

const EmailHubScreen = ({ navigation }) => {
  const { isDarkMode, user, token } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;
  
  const [testEmail, setTestEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleTestEmail = async () => {
    if (!testEmail) return Alert.alert('Error', 'Please enter an email address');
    
    setLoading(true);
    try {
      const { data } = await apiClient.post('/email/test', { testEmail });
      Alert.alert('Success ✨', data.message);
    } catch (error) {
      Alert.alert('Connection Failed ❌', error.response?.data?.message || 'Could not send test email. Check your backend .env settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={30} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Email Hub</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="email-seal-outline" size={40} color="#007AFF" />
          </View>
          <Text style={[styles.statusTitle, { color: theme.text }]}>Smart Email Engine</Text>
          <Text style={[styles.statusSub, { color: theme.subtext }]}>Automated Guest & Staff Notifications</Text>
          
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: '#34C75915' }]}>
              <Text style={{ color: '#34C759', fontWeight: '800', fontSize: 10 }}>ACTIVE</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#007AFF15' }]}>
              <Text style={{ color: '#007AFF', fontWeight: '800', fontSize: 10 }}>SECURE</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Test Connection</Text>
        <View style={[styles.testBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.testLabel, { color: theme.subtext }]}>Send a test email to verify your settings:</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            placeholder="Enter test email address"
            placeholderTextColor={theme.subtext}
            value={testEmail}
            onChangeText={setTestEmail}
            keyboardType="email-address"
          />
          <TouchableOpacity 
            style={[styles.testBtn, { backgroundColor: theme.primary }]} 
            onPress={handleTestEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="send-check" size={20} color="#fff" />
                <Text style={styles.testBtnText}>Send Test Email</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>System Logs</Text>
        <View style={styles.logItem}>
          <MaterialCommunityIcons name="check-circle" size={18} color="#34C759" />
          <Text style={[styles.logText, { color: theme.subtext }]}>Booking Confirmation Trigger Ready</Text>
        </View>
        <View style={styles.logItem}>
          <MaterialCommunityIcons name="check-circle" size={18} color="#34C759" />
          <Text style={[styles.logText, { color: theme.subtext }]}>Order Notification Trigger Ready</Text>
        </View>
        <View style={styles.logItem}>
          <MaterialCommunityIcons name="alert-circle" size={18} color="#FF9500" />
          <Text style={[styles.logText, { color: theme.subtext }]}>Waiting for .env credentials...</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  content: { padding: 25 },
  statusCard: { padding: 30, borderRadius: 30, alignItems: 'center', marginBottom: 35, elevation: 2 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF10', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  statusTitle: { fontSize: 22, fontWeight: '900', marginBottom: 5 },
  statusSub: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 20 },
  badgeRow: { flexDirection: 'row', gap: 10 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15, marginTop: 10 },
  testBox: { padding: 25, borderRadius: 25, marginBottom: 30 },
  testLabel: { fontSize: 13, fontWeight: '600', marginBottom: 15 },
  input: { height: 55, borderRadius: 15, borderWidth: 1, paddingHorizontal: 15, marginBottom: 20, fontWeight: '600' },
  testBtn: { height: 55, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  testBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  logItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15, paddingHorizontal: 5 },
  logText: { fontSize: 13, fontWeight: '600' }
});

export default EmailHubScreen;
