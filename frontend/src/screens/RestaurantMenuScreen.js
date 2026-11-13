import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Platform, StatusBar, Image, TextInput } from 'react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme } from '../theme';
import { API_URL } from '../config';

const RestaurantMenuScreen = ({ route, navigation }) => {
  const orderType = route.params?.type || 'Room Service';
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const { user, isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  useEffect(() => {
    fetchMenu();
    if (user?.role === 'customer' && orderType === 'Room Service') {
      fetchUserRoom();
    }
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/restaurant/menu');
      setMenu(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoom = async () => {
    try {
      const response = await apiClient.get('/bookings/mybookings');
      const activeBooking = response.data.find(b => b.status === 'Approved') || response.data[0];
      if (activeBooking && activeBooking.roomId) {
        const roomNum = activeBooking.roomId.roomNumber;
        if (roomNum) setRoomNumber(String(roomNum));
      }
    } catch (error) {
      console.log('Error fetching user room:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    Alert.alert('Delete Item', 'Are you sure you want to remove this item from the menu?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await apiClient.delete(`/restaurant/menu/${id}`);
            fetchMenu();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete item');
          }
        } 
      }
    ]);
  };

  const updateCart = (itemId, change) => {
    setCart((prev) => {
      const currentQty = prev[itemId] || 0;
      const newQty = currentQty + change;
      if (newQty <= 0) {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const handleCheckout = async () => {
    const itemIds = Object.keys(cart);
    if (itemIds.length === 0) return;

    if (orderType === 'Room Service' && !roomNumber) {
      Alert.alert('Room Number Required', 'Please enter your room number to place the order.');
      return;
    }

    let total = 0;
    const itemsPayload = itemIds.map(id => {
      const menuItem = menu.find(m => m._id === id);
      total += (menuItem.price * cart[id]);
      return { menuItemId: id, quantity: cart[id] };
    });

    try {
      setOrdering(true);
      await apiClient.post('/restaurant/orders', {
        items: itemsPayload,
        totalAmount: total,
        roomNumber: orderType === 'Room Service' ? roomNumber : 'N/A',
        orderType: orderType
      });
      Alert.alert('Success', `Order for ${orderType} placed successfully!`);
      setCart({});
      setRoomNumber('');
      navigation.navigate('OrderList');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.keys(cart).reduce((total, id) => {
    const menuItem = menu.find(m => m._id === id);
    return total + ((menuItem?.price || 0) * cart[id]);
  }, 0);

  const renderItem = ({ item }) => {
    const imageUrl = item.image 
      ? (item.image.startsWith('http') ? item.image : `${API_URL}/${item.image}`)
      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';

    return (
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.foodImage} 
        />
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{item.itemName}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: theme.border }]}>
            <Text style={[styles.category, { color: theme.subtext }]}>{item.category}</Text>
          </View>
          <Text style={[styles.description, { color: theme.subtext }]} numberOfLines={2}>{item.description}</Text>
          <Text style={[styles.price, { color: theme.primary }]}>${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.rightSection}>
          <View style={[styles.cartControl, { backgroundColor: theme.background }]}>
            <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: theme.surface }]} onPress={() => updateCart(item._id, -1)}>
              <MaterialCommunityIcons name="minus" size={18} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.qtyText, { color: theme.text }]}>{cart[item._id] || 0}</Text>
            <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: theme.surface }]} onPress={() => updateCart(item._id, 1)}>
              <MaterialCommunityIcons name="plus" size={18} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          {user?.role === 'admin' && (
            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={() => handleDeleteItem(item._id)}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {user?.role === 'customer' && (
        <TouchableOpacity 
          style={[styles.customerBar, { backgroundColor: '#34C759' }]} 
          onPress={() => navigation.navigate('OrderList')}
        >
          <MaterialCommunityIcons name="moped" size={22} color="#fff" />
          <Text style={styles.adminBarText}>Track My Orders</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>
      )}

      {(user?.role === 'admin' || user?.role === 'staff') && (
        <TouchableOpacity 
          style={[styles.adminBar, { backgroundColor: theme.primary }]} 
          onPress={() => navigation.navigate('OrderList')}
        >
          <MaterialCommunityIcons name="clipboard-list-outline" size={22} color="#fff" />
          <Text style={styles.adminBarText}>View All Customer Orders</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={menu}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.subtext }]}>No menu items available.</Text>}
          contentContainerStyle={styles.list}
        />
      )}
      
      {cartItemCount > 0 && (
        <View style={[styles.checkoutBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {orderType === 'Room Service' && (
            <TextInput
              style={[styles.roomInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="Room #"
              placeholderTextColor={theme.subtext}
              value={roomNumber}
              onChangeText={setRoomNumber}
              keyboardType="numeric"
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.totalLabel, { color: theme.subtext }]}>{orderType} Total</Text>
            <Text style={[styles.checkoutTotal, { color: theme.text }]}>${cartTotal.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={[styles.checkoutBtn, { backgroundColor: theme.primary }]} onPress={handleCheckout} disabled={ordering}>
            {ordering ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.checkoutBtnText}>Order Now</Text>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {user?.role === 'admin' && (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: theme.primary }, cartItemCount > 0 && { bottom: 110 }]} 
          onPress={() => navigation.navigate('AddMenuItem')}
        >
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  adminBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    margin: 15,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  customerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    margin: 15,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  adminBarText: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 10 },
  list: { paddingHorizontal: 15, paddingTop: 5, paddingBottom: 150 },
  card: {
    padding: 18, 
    borderRadius: 20, 
    marginBottom: 15, 
    elevation: 3, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  foodImage: { width: 80, height: 80, borderRadius: 15, marginRight: 15 },
  info: { flex: 1, paddingRight: 5 },
  name: { fontSize: 18, fontWeight: '800' },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginVertical: 6
  },
  category: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  description: { fontSize: 13, marginBottom: 10, lineHeight: 18 },
  price: { fontSize: 18, fontWeight: '800' },
  rightSection: { alignItems: 'flex-end' },
  cartControl: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 12,
    padding: 4
  },
  qtyBtn: { 
    width: 32, 
    height: 32, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2
  },
  qtyText: { marginHorizontal: 12, fontSize: 16, fontWeight: '800' },
  deleteBtn: { marginTop: 15, padding: 8 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
  checkoutBar: {
    position: 'absolute', bottom: 25, left: 15, right: 15, 
    padding: 15, borderRadius: 25, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20
  },
  roomInput: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 12, 
    marginRight: 15,
    width: 80,
    fontSize: 14,
    fontWeight: '700',
    borderWidth: 1
  },
  totalLabel: { fontSize: 10, fontWeight: '600' },
  checkoutTotal: { fontSize: 18, fontWeight: '800' },
  checkoutBtn: { 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkoutBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, marginRight: 5 },
  fab: { 
    position: 'absolute', 
    right: 25, 
    bottom: 25, 
    width: 65, 
    height: 65, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15
  }
});

export default RestaurantMenuScreen;
