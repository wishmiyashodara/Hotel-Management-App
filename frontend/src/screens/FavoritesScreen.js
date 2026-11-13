import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FavoritesContext } from '../context/FavoritesContext';
import { AuthContext } from '../context/AuthContext';
import { LightTheme, DarkTheme, Shadows } from '../theme';
import apiClient from '../api/client';

const FavoritesScreen = ({ navigation }) => {
  const { favorites, toggleFavorite } = useContext(FavoritesContext);
  const { isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const renderFavorite = ({ item }) => {
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
    } catch (err) {}

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: theme.surface }]} 
        onPress={() => navigation.navigate('HotelDetails', { hotel: item })}
      >
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.details}>
          <Text style={[styles.name, { color: theme.text }]}>Room {item.roomNumber}</Text>
          <Text style={[styles.type, { color: theme.subtext }]}>{item.roomType}</Text>
          <Text style={[styles.price, { color: theme.primary }]}>${item.pricePerNight} / night</Text>
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={() => toggleFavorite(item)}>
          <MaterialCommunityIcons name="heart" size={24} color="#FF2D55" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Your Favorites</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavorite}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.surface }]}>
              <MaterialCommunityIcons name="heart-outline" size={60} color={theme.subtext} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No favorites yet</Text>
            <Text style={[styles.emptySub, { color: theme.subtext }]}>Tap the heart on any room to save it for later!</Text>
            <TouchableOpacity 
              style={[styles.browseBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('RoomList')}
            >
              <Text style={styles.browseText}>Browse Rooms</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 22, fontWeight: '900' },
  list: { padding: 20 },
  card: { flexDirection: 'row', borderRadius: 20, marginBottom: 20, overflow: 'hidden', alignItems: 'center', elevation: 2 },
  image: { width: 100, height: 100 },
  details: { flex: 1, padding: 15 },
  name: { fontSize: 16, fontWeight: '800' },
  type: { fontSize: 13, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700', marginTop: 8 },
  removeBtn: { padding: 15 },
  emptyView: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyIconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  browseBtn: { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
  browseText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});

export default FavoritesScreen;
