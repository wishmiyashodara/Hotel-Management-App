import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, Image, StatusBar } from 'react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme } from '../theme';

const EmployeeListScreen = ({ navigation }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPresent, setFilterPresent] = useState(false);
  const { user, isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEmployees();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error(error);
      alert('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (pos) => {
    switch(pos) {
      case 'ADMIN': return 'shield-account';
      case 'RECEPTION': return 'deskphone';
      case 'RESTAURANT STAFF': return 'silverware-fork-knife';
      case 'HOUSEKEEPING': return 'broom';
      case 'MAINTENANCE': return 'tools';
      default: return 'account';
    }
  };

  const isPresentToday = (emp) => {
    return emp.attendance?.some(att => att.date === todayStr && att.status === 'Present');
  };

  const renderItem = ({ item }) => {
    const imageUrl = item.image 
      ? `${apiClient.defaults.baseURL.replace('/api', '')}${item.image}` 
      : null;
    
    const present = isPresentToday(item);

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, present && { borderLeftColor: theme.success, borderLeftWidth: 5 }]} 
        onPress={() => navigation.navigate('EmployeeDetail', { employee: item })}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.profileImg} />
          ) : (
            <View style={[styles.initialsBox, { backgroundColor: theme.background }]}>
              <Text style={[styles.initialsText, { color: theme.subtext }]}>{item.name.charAt(0)}</Text>
            </View>
          )}
          {present && <View style={[styles.onlineDot, { borderColor: theme.surface }]} />}
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
            {present && (
              <View style={[styles.presentBadge, { backgroundColor: theme.success + '15' }]}>
                <Text style={[styles.presentBadgeText, { color: theme.success }]}>PRESENT</Text>
              </View>
            )}
          </View>
          <View style={styles.row}>
            <MaterialCommunityIcons name={getPositionIcon(item.position)} size={14} color={theme.primary} />
            <Text style={[styles.positionText, { color: theme.primary }]}>{item.position}</Text>
          </View>
          <View style={[styles.shiftBadge, { backgroundColor: theme.background }]}>
            <MaterialCommunityIcons name="clock-outline" size={12} color={theme.subtext} />
            <Text style={[styles.shiftText, { color: theme.subtext }]}>{item.shift || 'Morning'}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={[styles.salary, { color: theme.success }]}>${item.salary}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.border} />
        </View>
      </TouchableOpacity>
    );
  };

  const presentCount = employees.filter(emp => isPresentToday(emp)).length;
  const filteredData = filterPresent ? employees.filter(emp => isPresentToday(emp)) : employees;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Team Members</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>{employees.length} Staff Registered</Text>
        </View>
        {user?.role === 'admin' && (
          <TouchableOpacity style={styles.payrollBtn} onPress={() => navigation.navigate('PayrollList')}>
            <MaterialCommunityIcons name="wallet-outline" size={24} color={theme.primary} />
            <Text style={[styles.payrollBtnText, { color: theme.primary }]}>Payroll</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.summaryItem, filterPresent && { borderBottomColor: theme.success, borderBottomWidth: 3 }]} 
          onPress={() => setFilterPresent(!filterPresent)}
        >
          <View style={[styles.summaryIcon, { backgroundColor: theme.success + '15' }]}>
            <MaterialCommunityIcons name="account-check" size={24} color={theme.success} />
          </View>
          <View>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{presentCount}</Text>
            <Text style={[styles.summaryLabel, { color: theme.subtext }]}>{filterPresent ? 'Showing Present' : 'Working Today'}</Text>
          </View>
        </TouchableOpacity>
        <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
        <TouchableOpacity style={styles.summaryItem} onPress={() => setFilterPresent(false)}>
          <View style={[styles.summaryIcon, { backgroundColor: theme.primary + '15' }]}>
            <MaterialCommunityIcons name="account-group" size={24} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{employees.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.subtext }]}>Total Staff</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-search-outline" size={60} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.subtext }]}>
                {filterPresent ? 'No one has arrived yet today.' : 'No staff members found.'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.list}
        />
      )}
      
      {user?.role === 'admin' && (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: theme.primary }]} 
          onPress={() => navigation.navigate('AddEmployee')}
        >
          <MaterialCommunityIcons name="account-plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    paddingHorizontal: 25, 
    paddingTop: 20, 
    marginBottom: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  payrollBtn: { alignItems: 'center' },
  payrollBtnText: { fontSize: 10, fontWeight: '800', marginTop: 2 },
  summaryCard: {
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
  summaryItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  summaryIcon: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  summaryValue: { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 12, fontWeight: '600' },
  summaryDivider: { width: 1, height: '100%' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    padding: 16,
    borderRadius: 22,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  imageContainer: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden', marginRight: 15, position: 'relative' },
  onlineDot: { 
    position: 'absolute', 
    bottom: 2, 
    right: 2, 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    backgroundColor: '#34C759', 
    borderWidth: 2
  },
  profileImg: { width: '100%', height: '100%' },
  initialsBox: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  initialsText: { fontSize: 24, fontWeight: '800' },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 17, fontWeight: '700' },
  presentBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  presentBadgeText: { fontSize: 9, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  positionText: { fontSize: 12, fontWeight: '700', marginLeft: 4, textTransform: 'uppercase' },
  shiftBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  shiftText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
  rightSection: { alignItems: 'flex-end', justifyContent: 'center' },
  salary: { fontSize: 16, fontWeight: '800', marginBottom: 5 },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyText: { textAlign: 'center', marginTop: 15, fontSize: 16, fontWeight: '600' },
  fab: {
    position: 'absolute',
    width: 65,
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
    right: 25,
    bottom: 30,
    borderRadius: 22,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15
  }
});

export default EmployeeListScreen;
