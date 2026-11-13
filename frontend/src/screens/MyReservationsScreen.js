import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, StatusBar } from 'react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme, Shadows } from '../theme';

const MyReservationsScreen = ({ navigation }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const endpoint = (user?.role === 'admin' || user?.role === 'staff') ? '/reservations/all' : '/reservations/my';
      const response = await apiClient.get(endpoint);
      setReservations(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiClient.put(`/reservations/${id}`, { status });
      fetchReservations();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#FF9500';
      case 'Confirmed': return theme.primary;
      case 'Completed': return theme.success;
      case 'Cancelled': return theme.error;
      default: return theme.subtext;
    }
  };

  const renderItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const dateObj = new Date(item.date);

    return (
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <View style={[styles.areaBadge, { backgroundColor: theme.primary + '15' }]}>
              <MaterialCommunityIcons name={item.area === 'Upstairs' ? 'stairs-up' : 'stairs-down'} size={16} color={theme.primary} />
              <Text style={[styles.areaText, { color: theme.primary }]}>{item.area}</Text>
            </View>
            <View style={[styles.areaBadge, { backgroundColor: '#34C75915' }]}>
              <MaterialCommunityIcons name="table-chair" size={16} color="#34C759" />
              <Text style={[styles.areaText, { color: '#34C759' }]}>Table {item.tableNumber}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar-clock" size={20} color={theme.subtext} />
          <View style={styles.detailTextContainer}>
            <Text style={[styles.dateText, { color: theme.text }]}>{dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
            <Text style={[styles.timeText, { color: theme.subtext }]}>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account-group-outline" size={20} color={theme.subtext} />
          <Text style={[styles.guestText, { color: theme.text }]}>{item.guests} Guests</Text>
        </View>

        {(user?.role === 'admin' || user?.role === 'staff') && item.userId && (
          <View style={[styles.userBox, { backgroundColor: theme.background }]}>
            <Text style={[styles.userName, { color: theme.text }]}>{item.userId.name}</Text>
            <Text style={[styles.userEmail, { color: theme.subtext }]}>{item.userId.email}</Text>
          </View>
        )}

        {(user?.role === 'admin' || user?.role === 'staff') && item.status === 'Pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]} onPress={() => updateStatus(item._id, 'Confirmed')}>
              <Text style={styles.actionBtnText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.error }]} onPress={() => updateStatus(item._id, 'Cancelled')}>
              <Text style={styles.actionBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Table Bookings</Text>
        <TouchableOpacity onPress={fetchReservations} style={styles.refreshBtn}>
          <MaterialCommunityIcons name="refresh" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={60} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.subtext }]}>No reservations yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '900' },
  refreshBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20 },
  card: { padding: 20, borderRadius: 25, marginBottom: 15, borderWidth: 1, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  badgeRow: { flexDirection: 'row', gap: 10 },
  areaBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 6 },
  areaText: { fontSize: 13, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 15 },
  detailTextContainer: { flex: 1 },
  dateText: { fontSize: 16, fontWeight: '800' },
  timeText: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  guestText: { fontSize: 15, fontWeight: '700' },
  userBox: { padding: 12, borderRadius: 12, marginTop: 10 },
  userName: { fontSize: 14, fontWeight: '800' },
  userEmail: { fontSize: 12, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 16, fontWeight: '600' }
});

export default MyReservationsScreen;
