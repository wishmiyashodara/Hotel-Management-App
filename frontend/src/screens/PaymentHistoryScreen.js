import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Platform, StatusBar, RefreshControl } from 'react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme } from '../theme';

const PaymentHistoryScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'admin' ? '/payments' : '/payments/myhistory';
      const response = await apiClient.get(endpoint);
      setPayments(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPayments();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const renderPayment = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
        <MaterialCommunityIcons 
          name={item.method === 'Cash' ? 'cash-multiple' : 'credit-card-outline'} 
          size={24} 
          color={theme.primary} 
        />
      </View>
      
      <View style={styles.info}>
        <Text style={[styles.userName, { color: theme.text }]}>{item.userId?.name || 'Guest'}'s Bill</Text>
        <Text style={[styles.bookingId, { color: theme.primary }]}>
          {item.bookingId?.roomId?.roomNumber ? `Stay: Room ${item.bookingId.roomId.roomNumber}` : 'Hotel Services'}
        </Text>
        <Text style={[styles.date, { color: theme.subtext }]}>{new Date(item.createdAt).toLocaleDateString()} • Via {item.method}</Text>
      </View>

      <View style={styles.priceBox}>
        <Text style={[styles.price, { color: theme.success }]}>${item.amount.toFixed(2)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: theme.border }]}>
          <Text style={[styles.statusText, { color: theme.subtext }]}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {user?.role === 'admin' && (
        <View style={[styles.revenueHeader, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.revLabel, { color: theme.subtext }]}>Total Revenue Collected</Text>
          <Text style={[styles.revAmount, { color: theme.text }]}>${totalRevenue.toLocaleString()}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statVal, { color: theme.primary }]}>{payments.length}</Text>
              <Text style={[styles.statLab, { color: theme.subtext }]}>Payments</Text>
            </View>
            <View style={[styles.dividerV, { backgroundColor: theme.border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statVal, { color: theme.primary }]}>${(totalRevenue / (payments.length || 1)).toFixed(0)}</Text>
              <Text style={[styles.statLab, { color: theme.subtext }]}>Average</Text>
            </View>
          </View>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        {user?.role === 'admin' ? 'Recent Transactions' : 'My Payment History'}
      </Text>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPayment}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="cash-off" size={60} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.subtext }]}>No payments recorded yet.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('Payment')}>
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  revenueHeader: { 
    padding: 25, 
    margin: 15, 
    borderRadius: 25, 
    borderWidth: 1,
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10,
    alignItems: 'center'
  },
  revLabel: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  revAmount: { fontSize: 36, fontWeight: '900', marginVertical: 10 },
  statsRow: { flexDirection: 'row', marginTop: 15, width: '100%', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800' },
  statLab: { fontSize: 11, fontWeight: '600' },
  dividerV: { width: 1, height: '100%' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginLeft: 20, marginBottom: 15, marginTop: 10 },
  list: { paddingHorizontal: 15, paddingBottom: 100 },
  card: { 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 16, fontWeight: '800' },
  bookingId: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  date: { fontSize: 11, marginTop: 2 },
  priceBox: { alignItems: 'flex-end' },
  price: { fontSize: 18, fontWeight: '900' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 5 },
  statusText: { fontSize: 9, fontWeight: '800' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16, fontWeight: '600' },
  fab: { 
    position: 'absolute', bottom: 30, right: 25, 
    width: 60, height: 60, 
    borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10
  }
});

export default PaymentHistoryScreen;
