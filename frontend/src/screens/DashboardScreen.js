import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, StatusBar, Image, TextInput, ScrollView, Animated } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme, Shadows } from '../theme';

const DashboardScreen = ({ navigation }) => {
  const { user, logout, isDarkMode, toggleTheme } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;
  const [activeCategory, setActiveCategory] = useState('All');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const categories = [
    { name: 'Book', icon: 'calendar-plus', color: theme.primary },
    { name: 'All', icon: 'home-variant', color: theme.primary },
  ];

  const quickLinks = [
    { name: 'Dining', icon: 'silverware-fork-knife', color: theme.primary, screen: 'RestaurantHub' },
    { name: 'My Stays', icon: 'calendar-check', color: theme.primary, screen: 'MyBookings' },
    { name: 'Saved', icon: 'heart', color: '#FF2D55', screen: 'Favorites' },
    { name: 'Payments', icon: 'credit-card', color: theme.primary, screen: 'PaymentHistory' },
    { name: 'Profile', icon: 'account', color: theme.primary, screen: 'Profile' },
  ];


  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.catItem, activeCategory === item.name ? { borderBottomColor: theme.text } : {}]}
      onPress={() => {
        setActiveCategory(item.name);
        if (item.name === 'Book' || item.name === 'All') navigation.navigate('RoomList');
      }}
    >
      <MaterialCommunityIcons
        name={item.icon}
        size={24}
        color={activeCategory === item.name ? item.color : theme.subtext}
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Premium Search Bar Header - Only for Guests */}
      {user?.role === 'customer' && (
        <Animated.View style={[styles.header, { backgroundColor: theme.background, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity
            style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('RoomList')}
          >
            <Image
              source={require('../../assets/brand_logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <MaterialCommunityIcons name="magnify" size={20} color={theme.text} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.searchTitle, { color: theme.text }]}>Where to?</Text>
              <Text style={[styles.searchSub, { color: theme.subtext }]}>Anywhere • Any week • Add guests</Text>
            </View>
            <TouchableOpacity style={[styles.themeBtn, { borderColor: theme.border }]} onPress={toggleTheme}>
              <MaterialCommunityIcons name={isDarkMode ? "weather-sunny" : "moon-waning-crescent"} size={20} color={theme.text} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Simple Admin Header - For Staff/Admin only */}
        {user?.role !== 'customer' && (
          <View style={styles.adminHeader}>
            <View style={styles.adminHeaderLeft}>
              <Image
                source={require('../../assets/brand_logo.png')}
                style={styles.adminLogo}
                resizeMode="contain"
              />
              <View>
                <Text style={[styles.adminWelcome, { color: theme.text }]}>Hello, {user?.name.split(' ')[0]} 👋</Text>
                <Text style={[styles.adminRole, { color: theme.subtext }]}>{user?.role.toUpperCase()} • {user?.position || 'MANAGEMENT'}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.themeBtn, { borderColor: theme.border }]} onPress={toggleTheme}>
              <MaterialCommunityIcons name={isDarkMode ? "weather-sunny" : "moon-waning-crescent"} size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        )}
        {/* Hero Card - Stunning New View */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity
            style={[styles.heroCard, { backgroundColor: theme.surface }, Shadows.medium]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('HotelDetails')}
          >
            <Image
              source={require('../../assets/my_villa2.jpeg')}
              style={styles.heroImage}
            />
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>EXCLUSIVE</Text>
            </View>
            <View style={styles.heartBtn}>
              <MaterialCommunityIcons name="heart" size={24} color="#FF2D55" />
            </View>
            <View style={styles.heroInfo}>
              <View style={styles.heroRow}>
                <Text style={[styles.heroTitle, { color: theme.text }]}>Coconut Republik Villa & Restaurant</Text>
                <View style={styles.ratingBox}>
                  <MaterialCommunityIcons name="star" size={14} color="#FF9500" />
                  <Text style={[styles.ratingText, { color: theme.text }]}>4.9</Text>
                </View>
              </View>
              <Text style={[styles.heroSub, { color: theme.subtext }]}>The Ultimate Tropical Workspace • Ahangama</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Categories Bar - Simplified for All */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.catList}
        />

        {/* Explore Rooms Section - Customers Only */}
        {user?.role === 'customer' && (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Discover Rooms</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RoomList')}>
              <Text style={[styles.seeAll, { color: theme.text }]}>Show all</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Services Grid */}
        <View style={styles.quickGrid}>
          {quickLinks
            .filter(item => {
              if (user?.role === 'staff' && item.name === 'Payments') return false;
              if (user?.role !== 'customer' && item.name === 'Saved') return false;
              return true;
            })
            .map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[styles.quickItem, Shadows.light]}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={[styles.quickIcon, { backgroundColor: item.color + '15' }]}>
                  <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
                </View>
                <Text style={[styles.quickText, { color: theme.text }]}>{item.name}</Text>
              </TouchableOpacity>
            ))}
        </View>


        {/* Management Section for Staff and Admin */}
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <View style={styles.adminSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Operational Tools</Text>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.adminGrid}>

              {/* Common Tool for all Staff */}
              {user?.role === 'staff' && (
                <TouchableOpacity style={[styles.adminBtn, { backgroundColor: theme.surface }]} onPress={() => navigation.navigate('Attendance')}>
                  <View style={[styles.adminIconBox, { backgroundColor: theme.primary + '15' }]}>
                    <MaterialCommunityIcons name="clock-check" size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.adminBtnText, { color: theme.text }]}>Work Hub</Text>
                </TouchableOpacity>
              )}

              {/* STAFF & ADMIN tools */}
              <TouchableOpacity style={[styles.adminBtn, { backgroundColor: theme.surface }]} onPress={() => navigation.navigate('BookingList')}>
                <View style={[styles.adminIconBox, { backgroundColor: theme.primary + '15' }]}>
                  <MaterialCommunityIcons name="calendar-multiselect" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.adminBtnText, { color: theme.text }]}>Bookings</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.adminBtn, { backgroundColor: theme.surface }]} onPress={() => navigation.navigate('RoomList')}>
                <View style={[styles.adminIconBox, { backgroundColor: theme.primary + '15' }]}>
                  <MaterialCommunityIcons name="home-city" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.adminBtnText, { color: theme.text }]}>Rooms</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.adminBtn, { backgroundColor: theme.surface }]} onPress={() => navigation.navigate('OrderList')}>
                <View style={[styles.adminIconBox, { backgroundColor: theme.primary + '15' }]}>
                  <MaterialCommunityIcons name="silverware-variant" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.adminBtnText, { color: theme.text }]}>Orders</Text>
              </TouchableOpacity>

              {/* ADMIN ONLY tools */}
              {user?.role === 'admin' && (
                <>
                  <TouchableOpacity style={[styles.adminBtn, { backgroundColor: theme.surface }]} onPress={() => navigation.navigate('UserList')}>
                    <View style={[styles.adminIconBox, { backgroundColor: theme.primary + '15' }]}>
                      <MaterialCommunityIcons name="account-group" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.adminBtnText, { color: theme.text }]}>Users</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.adminBtn, { backgroundColor: theme.surface }]} onPress={() => navigation.navigate('EmployeeList')}>
                    <View style={[styles.adminIconBox, { backgroundColor: theme.primary + '15' }]}>
                      <MaterialCommunityIcons name="briefcase-account" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.adminBtnText, { color: theme.text }]}>Staff</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.adminBtn, { backgroundColor: theme.surface }]} onPress={() => navigation.navigate('PayrollList')}>
                    <View style={[styles.adminIconBox, { backgroundColor: theme.primary + '15' }]}>
                      <MaterialCommunityIcons name="cash-register" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.adminBtnText, { color: theme.text }]}>Payroll</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.adminBtn, { backgroundColor: theme.surface }]} onPress={() => navigation.navigate('EmailHub')}>
                    <View style={[styles.adminIconBox, { backgroundColor: theme.primary + '15' }]}>
                      <MaterialCommunityIcons name="email-check" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.adminBtnText, { color: theme.text }]}>Email Hub</Text>
                  </TouchableOpacity>
                </>
              )}

            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Logout Floating Button */}
      <TouchableOpacity style={[styles.logoutFab, { backgroundColor: theme.primary }, Shadows.heavy]} onPress={logout}>
        <MaterialCommunityIcons name="logout" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    zIndex: 10
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 30,
    borderWidth: 1
  },
  headerLogo: {
    width: 30,
    height: 30,
    marginRight: 10
  },
  searchTitle: { fontSize: 14, fontWeight: '800' },
  searchSub: { fontSize: 12, fontWeight: '500' },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  catList: { paddingHorizontal: 20, paddingVertical: 15 },
  catItem: { alignItems: 'center', marginRight: 30, paddingBottom: 10, borderBottomWidth: 2 },
  catText: { fontSize: 12, marginTop: 4, fontWeight: '700' },
  heroCard: { marginHorizontal: 20, marginBottom: 30, borderRadius: 15 },
  heroImage: { width: '100%', height: 350, borderRadius: 15 },
  featuredBadge: { 
    position: 'absolute', 
    top: 20, 
    left: 20, 
    backgroundColor: '#FF385C', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8,
    zIndex: 5
  },
  featuredText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  heartBtn: { position: 'absolute', top: 20, right: 20 },
  heroInfo: { marginTop: 15, paddingHorizontal: 5 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroTitle: { fontSize: 18, fontWeight: '800' },
  ratingBox: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontWeight: '600', marginLeft: 4 },
  heroSub: { fontSize: 15, marginTop: 2 },
  heroDates: { fontSize: 15, marginTop: 2 },
  heroPrice: { fontSize: 16, marginTop: 6 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  sectionSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  statusRow: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    padding: 20, 
    borderRadius: 25, 
    marginBottom: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  statusItem: { alignItems: 'center' },
  statusVal: { fontSize: 22, fontWeight: '900' },
  statusLab: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginTop: 4, letterSpacing: 0.5 },
  statusDivider: { width: 1, height: 30, backgroundColor: '#eee' },
  seeAll: { fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, marginBottom: 30 },
  quickItem: { width: '25%', alignItems: 'center', marginBottom: 20 },
  quickIcon: { width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickText: { fontSize: 12, fontWeight: '700' },
  adminSection: { paddingHorizontal: 20 },
  adminGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 15 },
  adminBtn: {
    width: '30%',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  adminIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4
  },
  adminBtnText: { fontSize: 11, fontWeight: '700' },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 20,
    marginBottom: 10
  },
  adminHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  adminLogo: { width: 50, height: 50 },
  adminWelcome: { fontSize: 20, fontWeight: '800' },
  adminRole: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  logoutFab: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' }
});

export default DashboardScreen;
