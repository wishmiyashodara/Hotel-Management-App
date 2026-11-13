import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, StatusBar } from 'react-native';
import apiClient from '../api/client';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { LightTheme, DarkTheme } from '../theme';

const MyBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/bookings/mybookings');
      setBookings(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancel = (id) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/bookings/${id}`);
            Alert.alert('Success', 'Booking cancelled successfully');
            fetchMyBookings();
          } catch (error) {
            Alert.alert('Error', 'Failed to cancel booking');
          }
        }
      }
    ]);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return { color: theme.success, icon: 'check-circle-outline', bg: theme.success + '15' };
      case 'Rejected': return { color: theme.error, icon: 'close-circle-outline', bg: theme.error + '15' };
      case 'Cancelled': return { color: theme.subtext, icon: 'minus-circle-outline', bg: theme.subtext + '15' };
      default: return { color: '#FF9500', icon: 'clock-outline', bg: '#FF950015' };
    }
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    const startDate = item.checkInDate ? new Date(item.checkInDate).toLocaleDateString() : 'N/A';
    const endDate = item.checkOutDate ? new Date(item.checkOutDate).toLocaleDateString() : 'N/A';

    return (
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.roomInfo}>
            <MaterialCommunityIcons name="bed-double-outline" size={24} color={theme.primary} />
            <Text style={[styles.roomNum, { color: theme.text }]}>Room {item.roomId?.roomNumber || 'N/A'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <MaterialCommunityIcons name={statusStyle.icon} size={14} color={statusStyle.color} />
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{item.status}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Text style={[styles.dateLabel, { color: theme.subtext }]}>CHECK-IN</Text>
            <Text style={[styles.dateValue, { color: theme.text }]}>{startDate}</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={20} color={theme.border} />
          <View style={styles.dateBox}>
            <Text style={[styles.dateLabel, { color: theme.subtext }]}>CHECK-OUT</Text>
            <Text style={[styles.dateValue, { color: theme.text }]}>{endDate}</Text>
          </View>
        </View>

        <View style={[styles.billBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: theme.subtext }]}>Room Total</Text>
            <Text style={[styles.billValue, { color: theme.text }]}>${item.totalPrice?.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: theme.subtext }]}>Restaurant Orders</Text>
            <Text style={[styles.billValue, { color: theme.text }]}>+${item.orderTotal?.toFixed(2)}</Text>
          </View>
          <View style={[styles.dividerS, { backgroundColor: theme.border }]} />
          <View style={styles.billRow}>
            <Text style={[styles.grandLabel, { color: theme.text }]}>Grand Total</Text>
            <Text style={[styles.grandValue, { color: theme.primary }]}>${item.grandTotal?.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          {item.paymentStatus === 'Paid' ? (
            <View style={[styles.paidBadge, { backgroundColor: theme.success + '15' }]}>
              <MaterialCommunityIcons name="check-decagram" size={14} color={theme.success} />
              <Text style={[styles.paidText, { color: theme.success }]}>PAID</Text>
            </View>
          ) : (
            <View style={[styles.unpaidBadge, { backgroundColor: theme.subtext + '15' }]}>
              <Text style={[styles.unpaidText, { color: theme.subtext }]}>UNPAID</Text>
            </View>
          )}
        </View>

        {item.status === 'Pending' && (
          <TouchableOpacity style={[styles.cancelBtn, { borderTopColor: theme.border }]} onPress={() => handleCancel(item._id)}>
            <Text style={styles.cancelText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}

        {item.status === 'Approved' && item.paymentStatus === 'Unpaid' && (
          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Payment', {
              bookingId: item._id,
              amount: item.grandTotal || 0
            })}
          >
            <MaterialCommunityIcons name="credit-card-outline" size={18} color="#fff" />
            <Text style={styles.payBtnText}>Pay All & Confirm Stay</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>My Stays</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>Track your booking history and status</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={80} color={theme.border} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Bookings Yet</Text>
              <Text style={[styles.emptySub, { color: theme.subtext }]}>Your dream stay is just a few taps away!</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingBottom: 15 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  loader: { flex: 1, justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  roomInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roomNum: { fontSize: 18, fontWeight: '800' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '800' },
  divider: { height: 1, marginBottom: 15 },
  dividerS: { height: 1, marginVertical: 10 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  dateBox: { alignItems: 'center' },
  dateLabel: { fontSize: 10, fontWeight: '800', marginBottom: 4 },
  dateValue: { fontSize: 15, fontWeight: '700' },
  billBox: { padding: 15, borderRadius: 18, borderWidth: 1, marginBottom: 15 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billLabel: { fontSize: 12, fontWeight: '600' },
  billValue: { fontSize: 13, fontWeight: '700' },
  grandLabel: { fontSize: 14, fontWeight: '800' },
  grandValue: { fontSize: 16, fontWeight: '900' },
  priceRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#34C75915', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  paidText: { fontSize: 12, fontWeight: '900', color: '#34C759' },
  unpaidBadge: { backgroundColor: '#8E8E9315', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  unpaidText: { fontSize: 12, fontWeight: '900', color: '#8E8E93' },
  cancelBtn: { borderTopWidth: 1, paddingTop: 15, alignItems: 'center' },
  cancelText: { color: '#FF3B30', fontSize: 14, fontWeight: '700' },
  payBtn: {
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 5,
    elevation: 3
  },
  payBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  empty: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 20 },
  emptySub: { textAlign: 'center', marginTop: 8, lineHeight: 22, fontSize: 15 }
});

export default MyBookingsScreen;
