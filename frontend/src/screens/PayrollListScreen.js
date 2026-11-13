import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import apiClient from '../api/client';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { LightTheme, DarkTheme } from '../theme';

const PayrollListScreen = ({ navigation }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Permission Denied', 'Only administrators can access payroll management.');
      navigation.goBack();
      return;
    }
    fetchEmployees();
  }, [user]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load staff for payroll');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (employeeId, salary) => {
    Alert.alert('Process Payment', `Mark $${salary} as paid to this employee for ${currentMonth}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm Payment',
        onPress: async () => {
          try {
            setLoading(true);
            await apiClient.put(`/employees/${employeeId}/payroll`, {
              month: currentMonth,
              amount: salary,
              status: 'Paid',
              paidDate: new Date().toISOString().split('T')[0]
            });
            Alert.alert('Success', 'Payment recorded successfully!');
            fetchEmployees();
          } catch (error) {
            Alert.alert('Error', 'Failed to process payment');
            setLoading(false);
          }
        }
      }
    ]);
  };

  const isPaid = (employee) => {
    return employee.payroll?.some(p => p.month === currentMonth && p.status === 'Paid');
  };

  const renderItem = ({ item }) => {
    const paid = isPaid(item);
    return (
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.position, { color: theme.subtext }]}>{item.position}</Text>
          <Text style={[styles.salary, { color: theme.text }]}>Monthly: ${item.salary}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.payBtn, { backgroundColor: theme.primary }, paid && { backgroundColor: theme.border }]} 
          onPress={() => !paid && handlePay(item._id, item.salary)}
          disabled={paid}
        >
          <MaterialCommunityIcons 
            name={paid ? "check-circle" : "credit-card-outline"} 
            size={18} 
            color={paid ? theme.success : "#fff"} 
          />
          <Text style={[styles.payBtnText, paid && { color: theme.success }]}>
            {paid ? 'Paid' : 'Pay Now'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const totalPayout = employees.reduce((acc, emp) => acc + (isPaid(emp) ? emp.salary : 0), 0);
  const pendingPayout = employees.reduce((acc, emp) => acc + (isPaid(emp) ? 0 : emp.salary), 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Payroll Management</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>{currentMonth}</Text>
      </View>

      <View style={[styles.statsRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>Paid Total</Text>
          <Text style={[styles.statValue, { color: theme.success }]}>${totalPayout}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>Pending</Text>
          <Text style={[styles.statValue, { color: theme.warning }]}>${pendingPayout}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.subtext }]}>No employees found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingBottom: 15 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  statsRow: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    padding: 20, 
    borderRadius: 24, 
    marginBottom: 20,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15
  },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statDivider: { width: 1, height: '100%' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    padding: 20,
    borderRadius: 22,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1
  },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700' },
  position: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  salary: { fontSize: 15, fontWeight: '800', marginTop: 8 },
  payBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 14,
    gap: 6
  },
  payBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 }
});

export default PayrollListScreen;
