import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { LightTheme, DarkTheme, Shadows } from '../theme';

const RestaurantHubScreen = ({ navigation }) => {
  const { isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const services = [
    {
      id: 'room_service',
      title: 'Room Service',
      sub: 'Order food to your villa',
      icon: 'room-service-outline',
      screen: 'RestaurantMenu',
      params: { type: 'Room Service' }
    },
    {
      id: 'takeaway',
      title: 'Takeaway',
      sub: 'Order and pick up yourself',
      icon: 'bag-personal-outline',
      screen: 'RestaurantMenu',
      params: { type: 'Takeaway' }
    },
    {
      id: 'table',
      title: 'Table Reservation',
      sub: 'Book a table at the restaurant',
      icon: 'table-chair',
      screen: 'TableReservation',
      params: {}
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Island Dining</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.heroCard, Shadows.medium]}>
          <Image source={require('../../assets/my_villa2.jpeg')} style={styles.heroImage} />
          <View style={styles.overlay}>
            <Text style={styles.heroTitle}>Coconut Republik</Text>
            <Text style={styles.heroSub}>Gourmet Kitchen & Bar</Text>
          </View>
        </View>

        <View style={styles.trackRow}>
          <TouchableOpacity 
            style={[styles.trackBtn, { backgroundColor: '#34C759' }]} 
            onPress={() => navigation.navigate('OrderList')}
          >
            <MaterialCommunityIcons name="moped" size={20} color="#fff" />
            <Text style={styles.trackText}>My Food Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.trackBtn, { backgroundColor: theme.primary }]} 
            onPress={() => navigation.navigate('MyReservations')}
          >
            <MaterialCommunityIcons name="calendar-clock" size={20} color="#fff" />
            <Text style={styles.trackText}>My Table Bookings</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose a Service</Text>
        
        {services.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.serviceCard, { backgroundColor: theme.surface }]}
            onPress={() => navigation.navigate(item.screen, item.params)}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
              <MaterialCommunityIcons name={item.icon} size={32} color={theme.primary} />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={[styles.serviceTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.serviceSub, { color: theme.subtext }]}>{item.sub}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.subtext} />
          </TouchableOpacity>
        ))}

        <View style={[styles.infoBox, { backgroundColor: theme.primary + '05' }]}>
          <MaterialCommunityIcons name="information-outline" size={20} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.subtext }]}>Restaurant is open from 7:00 AM to 10:00 PM</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900' },
  scroll: { padding: 20 },
  heroCard: { height: 200, borderRadius: 25, overflow: 'hidden', marginBottom: 30 },
  heroImage: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end', padding: 20 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  trackRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  trackBtn: { flex: 1, height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  trackText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 25, marginBottom: 15 },
  iconBox: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  serviceInfo: { flex: 1 },
  serviceTitle: { fontSize: 18, fontWeight: '800' },
  serviceSub: { fontSize: 14, marginTop: 2, fontWeight: '500' },
  infoBox: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, gap: 10, marginTop: 10 },
  infoText: { fontSize: 13, fontWeight: '600' }
});

export default RestaurantHubScreen;
