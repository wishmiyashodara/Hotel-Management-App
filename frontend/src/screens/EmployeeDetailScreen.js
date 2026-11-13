import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform, Image, StatusBar, Linking } from 'react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LightTheme, DarkTheme } from '../theme';

const EmployeeDetailScreen = ({ route, navigation }) => {
  const { employee: initialEmployee } = route.params;
  const [employee, setEmployee] = useState(initialEmployee);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [status, setStatus] = useState('Present');
  const [shift, setShift] = useState('Morning');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const imageUrl = employee.image 
    ? `${apiClient.defaults.baseURL.replace('/api', '')}${employee.image}` 
    : null;

  const handleUpdateAttendance = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await apiClient.put(`/employees/${employee._id}/attendance`, { date: dateStr, status });
      setEmployee(res.data);
      Alert.alert('Success', 'Attendance marked for ' + dateStr);
    } catch (error) {
      Alert.alert('Error', 'Failed to update attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await apiClient.put(`/employees/${employee._id}/schedule`, { date: dateStr, shift });
      setEmployee(res.data);
      Alert.alert('Success', 'Schedule updated for ' + dateStr);
    } catch (error) {
      Alert.alert('Error', 'Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert('Remove Employee', 'This will permanently delete this profile. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await apiClient.delete(`/employees/${employee._id}`);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete employee');
            setLoading(false);
          }
        }
      }
    ]);
  };

  const InfoRow = ({ label, value, icon }) => (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconBox, { backgroundColor: theme.background }]}>
        <MaterialCommunityIcons name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.infoTextBox}>
        <Text style={[styles.infoLabel, { color: theme.subtext }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={[styles.headerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.profileBox, { borderColor: theme.primary, borderWidth: 2 }]}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.profileImg} />
            ) : (
              <View style={[styles.initialsBox, { backgroundColor: theme.primary }]}>
                <Text style={styles.initialsText}>{employee.name.charAt(0)}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.name, { color: theme.text }]}>{employee.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.background }]}>
            <Text style={[styles.roleText, { color: theme.subtext }]}>{employee.position}</Text>
          </View>

          <View style={styles.contactRow}>
            <TouchableOpacity 
              style={[styles.contactBtn, { backgroundColor: theme.success }]}
              onPress={() => Linking.openURL(`tel:${employee.phone}`)}
            >
              <MaterialCommunityIcons name="phone" size={20} color="#fff" />
              <Text style={styles.contactBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.contactBtn, { backgroundColor: theme.primary }]}
              onPress={() => Linking.openURL(`mailto:${employee.email}`)}
            >
              <MaterialCommunityIcons name="email" size={20} color="#fff" />
              <Text style={styles.contactBtnText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Professional Details</Text>
          <InfoRow label="Monthly Salary" value={`$${employee.salary}`} icon="currency-usd" />
          <InfoRow label="Joining Date" value={employee.joinDate || 'Not Set'} icon="calendar-check" />
          <InfoRow label="Current Shift" value={employee.shift || 'Morning'} icon="clock-outline" />
          <InfoRow label="Phone Number" value={employee.phone || 'N/A'} icon="phone-outline" />
          <InfoRow label="Email Address" value={employee.email || 'N/A'} icon="email-outline" />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Management</Text>
        
        <TouchableOpacity style={[styles.dateSelector, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setShowDatePicker(true)}>
          <MaterialCommunityIcons name="calendar-month" size={22} color={theme.primary} />
          <Text style={[styles.dateSelectorText, { color: theme.text }]}>Target Date: {selectedDate.toLocaleDateString()}</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color={theme.subtext} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            onChange={(e, d) => { setShowDatePicker(false); if(d) setSelectedDate(d); }}
          />
        )}

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Mark Attendance</Text>
          <View style={styles.chipRow}>
            {['Present', 'Absent', 'Late'].map(s => (
              <TouchableOpacity 
                key={s} 
                style={[styles.chip, { backgroundColor: theme.background }, status === s && { backgroundColor: theme.primary }]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.chipText, { color: theme.subtext }, status === s && { color: '#fff' }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]} onPress={handleUpdateAttendance} disabled={loading}>
            <Text style={styles.actionBtnText}>Submit Attendance</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Change Schedule</Text>
          <View style={styles.chipRow}>
            {['Morning', 'Evening', 'Night'].map(s => (
              <TouchableOpacity 
                key={s} 
                style={[styles.chip, { backgroundColor: theme.background }, shift === s && { backgroundColor: theme.primary }]}
                onPress={() => setShift(s)}
              >
                <Text style={[styles.chipText, { color: theme.subtext }, shift === s && { color: '#fff' }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]} onPress={handleUpdateSchedule} disabled={loading}>
            <Text style={styles.actionBtnText}>Update Work Shift</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>History & Logs</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Recent Logs</Text>
          {[...(employee.attendance || []), ...(employee.schedule || [])]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10)
            .map((log, i) => (
              <View key={i} style={[styles.historyRow, { borderBottomColor: theme.background }]}>
                <MaterialCommunityIcons 
                  name={log.status ? "calendar-check" : "clock-outline"} 
                  size={16} 
                  color={theme.subtext} 
                />
                <Text style={[styles.historyDate, { color: theme.text }]}>{log.date}</Text>
                <Text style={[
                  styles.historyStatus, 
                  { color: log.status ? (log.status === 'Present' ? theme.success : theme.error) : theme.primary }
                ]}>
                  {log.status || log.shift}
                </Text>
              </View>
            ))}
          {(!employee.attendance?.length && !employee.schedule?.length) && (
            <Text style={[styles.emptyHistory, { color: theme.subtext }]}>No logs recorded yet.</Text>
          )}
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={loading}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.error} />
          <Text style={[styles.deleteBtnText, { color: theme.error }]}>Remove Employee Profile</Text>
        </TouchableOpacity>
        
      </ScrollView>
      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: theme.background + 'B3' }]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  headerCard: {
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15
  },
  profileBox: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', marginBottom: 15 },
  profileImg: { width: '100%', height: '100%' },
  initialsBox: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  initialsText: { fontSize: 40, fontWeight: '800', color: '#fff' },
  name: { fontSize: 22, fontWeight: '800' },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 8 },
  roleText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  contactRow: { flexDirection: 'row', gap: 15, marginTop: 25 },
  contactBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 15,
    gap: 8
  },
  contactBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  card: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  infoIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoTextBox: { marginLeft: 15 },
  infoLabel: { fontSize: 12, fontWeight: '600' },
  infoValue: { fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 15, marginTop: 10 },
  dateSelector: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 20, 
    marginBottom: 20,
    borderWidth: 1
  },
  dateSelectorText: { flex: 1, fontSize: 16, fontWeight: '700', marginLeft: 10 },
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  chip: { 
    flex: 1,
    paddingVertical: 12, 
    borderRadius: 15, 
    alignItems: 'center'
  },
  chipText: { fontSize: 14, fontWeight: '700' },
  actionBtn: { 
    paddingVertical: 16, 
    borderRadius: 18, 
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1
  },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  deleteBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20,
    marginTop: 10
  },
  deleteBtnText: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
  loadingOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  historyDate: { flex: 1, fontSize: 14, marginLeft: 10, fontWeight: '600' },
  historyStatus: { fontSize: 13, fontWeight: '800' },
  emptyHistory: { textAlign: 'center', padding: 10 },
});

export default EmployeeDetailScreen;
