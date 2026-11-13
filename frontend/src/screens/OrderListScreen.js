import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme } from '../theme';

const OrderListScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOrders();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/restaurant/orders');
      setOrders(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await apiClient.put(`/restaurant/orders/${orderId}`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return '#FF9500';
      case 'Preparing': return theme.primary;
      case 'Delivered': return theme.success;
      case 'Cancelled': return theme.error;
      default: return theme.subtext;
    }
  };

  const renderItem = ({ item }) => {
    const userName = item.userId ? item.userId.name : 'Unknown';
    const statusColor = getStatusColor(item.status);
    
    return (
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.roomBadge, { backgroundColor: item.orderType === 'Takeaway' ? '#34C759' : theme.text }]}>
            <Text style={[styles.roomText, { color: '#fff' }]}>
              {item.orderType === 'Takeaway' ? 'TAKEAWAY 🥡' : `Room ${item.roomNumber || 'N/A'}`}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.userRow}>
          <MaterialCommunityIcons name="account-outline" size={16} color={theme.subtext} />
          <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
          <View style={[styles.dot, { backgroundColor: theme.border }]} />
          <Text style={[styles.orderType, { color: theme.subtext }]}>{item.orderType}</Text>
        </View>

        <View style={[styles.itemsBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
          {item.items.map((cartItem, index) => (
             <View key={index} style={styles.itemRow}>
               <Text style={[styles.itemQty, { color: theme.primary }]}>{cartItem.quantity}x</Text>
               <Text style={[styles.itemName, { color: theme.text }]}>
                 {cartItem.menuItemId ? cartItem.menuItemId.itemName : 'Deleted Item'}
               </Text>
             </View>
          ))}
        </View>

        <View style={[styles.footerRow, { borderTopColor: theme.border }]}>
          <Text style={[styles.totalLabel, { color: theme.subtext }]}>Total Amount</Text>
          <Text style={[styles.totalValue, { color: theme.text }]}>${item.totalAmount.toFixed(2)}</Text>
        </View>

        {(user?.role === 'admin' || user?.role === 'staff') && (
          <View style={styles.actionRow}>
            {item.status === 'Pending' && (
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: theme.primary }]} 
                onPress={() => updateStatus(item._id, 'Preparing')}
              >
                <Text style={styles.actionBtnText}>Start Preparing</Text>
              </TouchableOpacity>
            )}
            {item.status === 'Preparing' && (
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: theme.success }]} 
                onPress={() => updateStatus(item._id, 'Delivered')}
              >
                <Text style={styles.actionBtnText}>Mark Delivered</Text>
              </TouchableOpacity>
            )}
            {item.status !== 'Cancelled' && item.status !== 'Delivered' && (
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: theme.error }]} 
                onPress={() => updateStatus(item._id, 'Cancelled')}
              >
                <Text style={styles.actionBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Order History</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchOrders}>
          <MaterialCommunityIcons name="refresh" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={60} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.subtext }]}>No orders right now.</Text>
            </View>
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    paddingTop: 20,
    paddingBottom: 15
  },
  title: { fontSize: 24, fontWeight: '800' },
  refreshBtn: { padding: 5 },
  list: { paddingHorizontal: 20, paddingBottom: 50 },
  card: {
    padding: 20, 
    borderRadius: 24, 
    marginBottom: 15, 
    elevation: 3, 
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  roomBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  roomText: { fontSize: 13, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  userName: { fontSize: 15, fontWeight: '600', marginLeft: 6 },
  dot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 8 },
  orderType: { fontSize: 13, fontWeight: '500' },
  itemsBox: { padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1 },
  itemRow: { flexDirection: 'row', marginBottom: 5 },
  itemQty: { fontWeight: '800', width: 25 },
  itemName: { fontWeight: '500' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 15 },
  totalLabel: { fontSize: 14, fontWeight: '500' },
  totalValue: { fontSize: 20, fontWeight: '800' },
  actionRow: { flexDirection: 'column', marginTop: 20, gap: 10 },
  actionBtn: { paddingVertical: 14, borderRadius: 15, alignItems: 'center', elevation: 2 },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyText: { textAlign: 'center', marginTop: 15, fontSize: 16, fontWeight: '500' }
});

export default OrderListScreen;
