import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Alert, Platform, ScrollView, StatusBar, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { FavoritesContext } from '../context/FavoritesContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme, Shadows } from '../theme';

const RoomListScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
  const [showInPicker, setShowInPicker] = useState(false);
  const [showOutPicker, setShowOutPicker] = useState(false);

  const { user, isDarkMode } = useContext(AuthContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = {
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString()
      };
      const response = await apiClient.get('/rooms', { params });
      setRooms(response.data);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const onInChange = (event, selectedDate) => {
    setShowInPicker(false);
    if (selectedDate) {
      setCheckIn(selectedDate);
      if (checkOut <= selectedDate) {
        setCheckOut(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
      }
    }
  };

  const onOutChange = (event, selectedDate) => {
    setShowOutPicker(false);
    if (selectedDate) {
      setCheckOut(selectedDate);
    }
  };

  const filteredRooms = rooms.filter(room => {
    return selectedType === 'All' || room.roomType === selectedType;
  });

  const renderRoom = ({ item }) => {
    let imageUrl = null;
    try {
      if (item.image) {
        if (item.image.startsWith('http')) {
          imageUrl = item.image;
        } else {
          const cleanPath = item.image.replace(/\\/g, '/');
          let base = apiClient.defaults.baseURL || 'http://192.168.1.19:5000';
          base = base.split('/api')[0].replace(/\/+$/, '');
          const path = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
          imageUrl = `${base}${path}`;
        }
      }
    } catch (err) {
      console.log('Image URL Error:', err);
    }

    const isFav = isFavorite(item._id);

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity 
          style={[styles.roomCard, { backgroundColor: theme.background }]}
          activeOpacity={0.9}
          onPress={() => item.isAvailable && navigation.navigate('CreateBooking', { 
            roomId: item._id,
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString()
          })}
        >
          <View style={[styles.imageWrapper, Shadows.medium]}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.roomImage} />
            ) : (
              <View style={styles.placeholder}><MaterialCommunityIcons name="image-off" size={40} color={theme.subtext} /></View>
            )}
            <TouchableOpacity 
              style={[styles.heartBtn, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)' }]} 
              onPress={() => toggleFavorite(item)}
            >
              <MaterialCommunityIcons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? "#FF2D55" : "#fff"} />
            </TouchableOpacity>
            {!item.isAvailable && (
              <View style={styles.unavailableOverlay}>
                <View style={styles.soldOutBadge}>
                  <Text style={styles.unavailableText}>FULLY BOOKED</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.roomDetails}>
            <View style={styles.titleRow}>
              <Text style={[styles.roomName, { color: theme.text }]}>Room {item.roomNumber} • {item.roomType}</Text>
              <View style={[styles.ratingBox, { backgroundColor: theme.surface }]}>
                <MaterialCommunityIcons name="star" size={14} color="#FF9500" />
                <Text style={[styles.ratingText, { color: theme.text }]}>4.9</Text>
              </View>
            </View>
            <Text style={[styles.roomType, { color: theme.subtext }]}>{item.hasAC ? 'Air Conditioned' : 'Natural Breeze'} • {item.capacity} Guests</Text>
            <Text style={[styles.datesText, { color: theme.subtext }]}>{checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            <Text style={[styles.priceText, { color: theme.text }]}><Text style={[styles.priceVal, { color: theme.primary }]}>${item.pricePerNight}</Text> / night</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Premium Pill Search Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <View style={[styles.pillSearch, { backgroundColor: theme.surface, borderColor: theme.border }, Shadows.medium]}>
          <TouchableOpacity style={styles.searchSegment} onPress={() => setShowInPicker(true)}>
            <Text style={[styles.segmentLabel, { color: theme.text }]}>CHECK IN</Text>
            <Text style={[styles.segmentValue, { color: theme.subtext }]}>{checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
          </TouchableOpacity>
          <View style={styles.vDivider} />
          <TouchableOpacity style={styles.searchSegment} onPress={() => setShowOutPicker(true)}>
            <Text style={[styles.segmentLabel, { color: theme.text }]}>CHECK OUT</Text>
            <Text style={[styles.segmentValue, { color: theme.subtext }]}>{checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.goBtn, { backgroundColor: theme.primary }]} onPress={fetchRooms}>
            <MaterialCommunityIcons name="magnify" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterList} contentContainerStyle={{ paddingRight: 40 }}>
          {['All', 'Single', 'Double', 'Suite', 'Deluxe'].map(t => (
            <TouchableOpacity 
              key={t} 
              style={[
                styles.filterChip, 
                selectedType === t ? { backgroundColor: theme.text } : { backgroundColor: theme.surface, borderColor: theme.border }
              ]}
              onPress={() => setSelectedType(t)}
            >
              <Text style={[styles.filterText, { color: selectedType === t ? theme.background : theme.subtext }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {showInPicker && <DateTimePicker value={checkIn} mode="date" display="inline" onChange={onInChange} minimumDate={new Date()} />}
      {showOutPicker && <DateTimePicker value={checkOut} mode="date" display="inline" onChange={onOutChange} minimumDate={new Date(checkIn.getTime() + 86400000)} />}

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredRooms}
          renderItem={renderRoom}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <MaterialCommunityIcons name="bed-empty" size={60} color={theme.subtext} />
              <Text style={[styles.emptyText, { color: theme.subtext }]}>No matches found. Try different dates!</Text>
            </View>
          }
        />
      )}

      {user?.role === 'admin' && (
        <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('AddRoom')}>
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 30 },
  pillSearch: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 20, 
    borderRadius: 35, 
    padding: 8,
    borderWidth: 1
  },
  searchSegment: { flex: 1, paddingLeft: 15 },
  segmentLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  segmentValue: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  vDivider: { width: 1, height: '60%', backgroundColor: '#EEEEEE' },
  goBtn: { width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  filterList: { paddingLeft: 20, marginVertical: 20 },
  filterChip: { 
    marginRight: 10, 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 25, 
    borderWidth: 1,
    height: 40,
    justifyContent: 'center'
  },
  filterText: { fontSize: 13, fontWeight: '800' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  roomCard: { marginBottom: 40 },
  imageWrapper: { height: 320, borderRadius: 20, overflow: 'hidden' },
  roomImage: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' },
  heartBtn: { position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  unavailableOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center' },
  soldOutBadge: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  unavailableText: { fontSize: 12, fontWeight: '900', letterSpacing: 2, color: '#fff' },
  roomDetails: { marginTop: 15, paddingHorizontal: 5 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomName: { fontSize: 18, fontWeight: '900' },
  ratingBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  ratingText: { fontSize: 14, fontWeight: '700', marginLeft: 4 },
  roomType: { fontSize: 15, marginTop: 4, fontWeight: '500' },
  datesText: { fontSize: 14, marginTop: 2, fontWeight: '400' },
  priceText: { fontSize: 14, marginTop: 8, fontWeight: '500' },
  priceVal: { fontWeight: '900', fontSize: 18 },
  loader: { flex: 1, justifyContent: 'center' },
  emptyView: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 15, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', ...Shadows.heavy }
});

export default RoomListScreen;
