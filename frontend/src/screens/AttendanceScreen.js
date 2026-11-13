import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar, Image } from 'react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme, Shadows } from '../theme';

const AttendanceScreen = ({ navigation }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const { user, isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/employees/me');
      setEmployee(response.data);
    } catch (error) {
      console.error('Attendance Load Error:', error);
      Alert.alert('Error', 'Failed to load employee profile. Make sure you are registered as an employee.');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async () => {
    if (!employee) return;
    try {
      setMarking(true);
      await apiClient.put(`/employees/${employee._id}/attendance`, {
        date: today,
        status: 'Present'
      });
      Alert.alert('Success', 'Attendance marked for today!');
      fetchEmployeeData();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance');
    } finally {
      setMarking(false);
    }
  };

  const isPresentToday = () => {
    return employee?.attendance?.some(a => a.date === today && a.status === 'Present');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }, Shadows.medium]}>
          <View style={[styles.avatarBox, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{employee?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.empName, { color: theme.text }]}>{employee?.name}</Text>
            <View style={[styles.badge, { backgroundColor: theme.primary + '15' }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>{employee?.position}</Text>
            </View>
            <Text style={[styles.empSub, { color: theme.subtext }]}>{employee?.email}</Text>
          </View>
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Status</Text>
          <View style={[styles.statusBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.dateInfo}>
              <Text style={[styles.dayText, { color: theme.text }]}>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</Text>
              <Text style={[styles.dateText, { color: theme.subtext }]}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
            </View>
            
            {isPresentToday() ? (
              <View style={styles.presentIndicator}>
                <MaterialCommunityIcons name="check-decagram" size={40} color={theme.success} />
                <Text style={[styles.presentLabel, { color: theme.success }]}>YOU ARE CLOCKED IN</Text>
                <Text style={[styles.timeLabel, { color: theme.subtext }]}>Enjoy your shift at Coconut Republik!</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.clockBtn, { backgroundColor: theme.primary }, Shadows.medium]} 
                onPress={markAttendance}
                disabled={marking}
              >
                {marking ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="clock-in" size={24} color="#fff" />
                    <Text style={styles.clockBtnText}>Mark Present</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Schedule Preview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Work Schedule</Text>
          <View style={[styles.scheduleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.scheduleItem}>
              <MaterialCommunityIcons name="calendar-clock" size={20} color={theme.primary} />
              <View style={styles.schedInfo}>
                <Text style={[styles.schedLabel, { color: theme.subtext }]}>Standard Shift</Text>
                <Text style={[styles.schedVal, { color: theme.text }]}>Morning (8:00 AM - 5:00 PM)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* History Preview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent History</Text>
          {employee?.attendance?.slice(-5).reverse().map((record, index) => (
            <View key={index} style={[styles.historyItem, { borderBottomColor: theme.border }]}>
              <View style={styles.historyLeft}>
                <View style={[styles.dot, { backgroundColor: theme.success }]} />
                <Text style={[styles.historyDate, { color: theme.text }]}>{record.date}</Text>
              </View>
              <Text style={[styles.historyStatus, { color: theme.success }]}>{record.status}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  profileCard: {
    flexDirection: 'row', padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 25, alignItems: 'center'
  },
  avatarBox: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  profileInfo: { flex: 1 },
  empName: { fontSize: 18, fontWeight: '800' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  empSub: { fontSize: 12, marginTop: 4 },
  actionSection: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  statusBox: { padding: 25, borderRadius: 24, borderWidth: 1, alignItems: 'center' },
  dateInfo: { alignItems: 'center', marginBottom: 25 },
  dayText: { fontSize: 22, fontWeight: '800' },
  dateText: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  clockBtn: { 
    flexDirection: 'row', width: '100%', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', gap: 10 
  },
  clockBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  presentIndicator: { alignItems: 'center' },
  presentLabel: { fontSize: 16, fontWeight: '900', marginTop: 10 },
  timeLabel: { fontSize: 12, fontWeight: '600', marginTop: 5, textAlign: 'center' },
  section: { marginBottom: 25 },
  scheduleCard: { padding: 15, borderRadius: 18, borderWidth: 1 },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  schedInfo: { flex: 1 },
  schedLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  schedVal: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  historyDate: { fontSize: 14, fontWeight: '600' },
  historyStatus: { fontSize: 12, fontWeight: '800' }
});

export default AttendanceScreen;
