import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme } from '../theme';

const BookingListScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookings();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const endpoint = (user?.role === 'admin' || user?.role === 'staff') ? '/bookings' : '/bookings/mybookings';
      const response = await apiClient.get(endpoint);
      setBookings(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId, newStatus) => {
    try {
      await apiClient.put(`/bookings/${bookingId}/status`, { status: newStatus });
      Alert.alert('Success', `Booking ${newStatus}`);
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    }
  };

  const hardDeleteBooking = async (bookingId) => {
    Alert.alert('Permanent Delete', 'This will remove the booking record forever. Continue?', [
      { text: 'No' },
      { 
        text: 'Yes, Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/bookings/${bookingId}/hard`);
            Alert.alert('Success', 'Booking record deleted');
            fetchBookings();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete booking');
          }
        }
      }
    ]);
  };

  const cancelBooking = async (bookingId) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No' },
      { 
        text: 'Yes, Cancel', 
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/bookings/${bookingId}`);
            Alert.alert('Success', 'Booking cancelled');
            fetchBookings();
          } catch (error) {
            Alert.alert('Error', 'Failed to cancel booking');
          }
        }
      }
    ]);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return { bg: theme.success + '15', text: theme.success, icon: 'check-circle' };
      case 'Checked In': return { bg: theme.primary + '15', text: theme.primary, icon: 'account-check' };
      case 'Checked Out': return { bg: theme.text + '15', text: theme.text, icon: 'account-off' };
      case 'Rejected': 
      case 'Cancelled': return { bg: theme.error + '15', text: theme.error, icon: 'close-circle' };
      default: return { bg: theme.warning + '15', text: theme.warning, icon: 'clock-outline' };
    }
  };

  const renderItem = ({ item }) => {
    const roomName = item.roomId ? `${item.roomId.roomType} (Room ${item.roomId.roomNumber})` : 'Deleted Room';
    const userName = item.userId ? item.userId.name : 'Unknown User';
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.roomInfo}>
            <MaterialCommunityIcons name="home-outline" size={20} color={theme.primary} />
            <Text style={[styles.roomText, { color: theme.text }]}>{roomName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <MaterialCommunityIcons name={statusStyle.icon} size={14} color={statusStyle.text} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
          </View>
        </View>

        {(user?.role === 'admin' || user?.role === 'staff') && (
          <View style={styles.userRow}>
            <MaterialCommunityIcons name="account-outline" size={16} color={theme.subtext} />
            <Text style={[styles.userText, { color: theme.subtext }]}>Guest: {userName}</Text>
          </View>
        )}

        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Text style={[styles.dateLabel, { color: theme.subtext }]}>CHECK-IN</Text>
            <Text style={[styles.dateVal, { color: theme.text }]}>{item.checkInDate ? new Date(item.checkInDate).toLocaleDateString() : 'N/A'}</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={16} color={theme.border} />
          <View style={styles.dateBox}>
            <Text style={[styles.dateLabel, { color: theme.subtext }]}>CHECK-OUT</Text>
            <Text style={[styles.dateVal, { color: theme.text }]}>{item.checkOutDate ? new Date(item.checkOutDate).toLocaleDateString() : 'N/A'}</Text>
          </View>
        </View>
        
        <View style={[styles.billSummary, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={styles.billRow}>
            <Text style={[styles.totalLabel, { color: theme.subtext }]}>Total Bill</Text>
            <Text style={[styles.totalValue, { color: theme.primary }]}>${item.grandTotal?.toFixed(2)}</Text>
          </View>
          <View style={[styles.paymentBadge, { backgroundColor: item.paymentStatus === 'Paid' ? theme.success + '15' : theme.error + '15' }]}>
            <Text style={[styles.paymentBadgeText, { color: item.paymentStatus === 'Paid' ? theme.success : theme.error }]}>
              {item.paymentStatus === 'Paid' ? 'PAID' : 'UNPAID'}
            </Text>
          </View>
        </View>

        {(user?.role === 'admin' || user?.role === 'staff') && (
          <View style={styles.actionRow}>
            {/* Approval - Admin or Reception only */}
            {item.status === 'Pending' && (user?.role === 'admin' || user?.position === 'RECEPTION') && (
              <>
                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.success }]} onPress={() => updateStatus(item._id, 'Approved')}>
                  <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.warning }]} onPress={() => updateStatus(item._id, 'Rejected')}>
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Check-In - All Staff & Admin */}
            {item.status === 'Approved' && (
              <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={() => updateStatus(item._id, 'Checked In')}>
                <MaterialCommunityIcons name="login-variant" size={16} color="#fff" />
                <Text style={styles.btnText}> Check-In</Text>
              </TouchableOpacity>
            )}

            {/* Check-Out - All Staff & Admin */}
            {item.status === 'Checked In' && (
              <TouchableOpacity style={[styles.btn, { backgroundColor: theme.text }]} onPress={() => updateStatus(item._id, 'Checked Out')}>
                <MaterialCommunityIcons name="logout-variant" size={16} color="#fff" />
                <Text style={styles.btnText}> Check-Out</Text>
              </TouchableOpacity>
            )}

            {/* Delete - Admin only */}
            {user?.role === 'admin' && (
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: '#f44336', flex: 0.3 }]} 
                onPress={() => hardDeleteBooking(item._id)}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {user?.role !== 'admin' && item.status === 'Pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.error, flex: 1 }]} onPress={() => cancelBooking(item._id)}>
               <Text style={styles.btnText}>Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.subtext }]}>No bookings found.</Text>}
          contentContainerStyle={styles.list}
        />
      )}
      
      {user?.role !== 'admin' && (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: theme.primary }]} 
          onPress={() => navigation.navigate('RoomList')}
        >
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 20, paddingBottom: 100 },
  card: {
    padding: 20, borderRadius: 24, marginBottom: 20, borderWidth: 1, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  roomInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomText: { fontSize: 16, fontWeight: '800' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 15 },
  userText: { fontSize: 13, fontWeight: '600' },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  dateBox: { alignItems: 'center' },
  dateLabel: { fontSize: 10, fontWeight: '800', marginBottom: 4 },
  dateVal: { fontSize: 13, fontWeight: '700' },
  billSummary: { padding: 15, borderRadius: 18, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billRow: { gap: 2 },
  totalLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  totalValue: { fontSize: 20, fontWeight: '900' },
  paymentBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  paymentBadgeText: { fontSize: 11, fontWeight: '900' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btn: { flex: 1, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 15, fontWeight: '600' },
  fab: { position: 'absolute', right: 25, bottom: 25, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
});

export default BookingListScreen;
