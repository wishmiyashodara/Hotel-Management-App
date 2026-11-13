import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar, Platform, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { LightTheme, DarkTheme, Shadows } from '../theme';
import apiClient from '../api/client';

const HotelDetailsScreen = ({ navigation }) => {
  const { isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const hotelInfo = {

    name: 'COCONUT REPUBLIK VILLA AND RESTAURANT',
    rating: 4.9,
    reviews: 124,
    address: 'Aranwala, Ahangama 80650, Sri Lanka',
    description: 'A serene tropical escape nestled in the heart of Ahangama. Coconut Republik offers a unique blend of modern luxury and traditional island charm. Whether you are here for our world-class restaurant or our luxury villa suites, we promise an unforgettable experience under the palms.',
    hours: 'Open 24 Hours (Restaurant: 7 AM - 10 PM)',
    amenities: [
      { name: 'Private Pool', icon: 'pool' },
      { name: 'Ultra WiFi', icon: 'wifi' },
      { name: 'Fine Dining', icon: 'food-fork-drink' },
      { name: 'Private Beach', icon: 'beach' },
      { name: 'VIP Shuttle', icon: 'van-passenger' }
    ]
  };

  const openMap = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${hotelInfo.name}@${hotelInfo.address}`,
      android: `geo:0,0?q=${hotelInfo.address}(${hotelInfo.name})`
    });
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView bounces={false}>
        {/* Header Image */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/my_villa2.jpeg')}
            style={styles.headerImage}
          />
          <View style={styles.headerOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.heartBtn}>
            <MaterialCommunityIcons name="heart-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: theme.background }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.hotelName, { color: theme.text }]}>{hotelInfo.name}</Text>
          </View>

          <View style={styles.ratingRow}>
            <View style={[styles.ratingBadge, { backgroundColor: theme.primary + '15' }]}>
              <MaterialCommunityIcons name="star" size={16} color="#FF9500" />
              <Text style={[styles.ratingText, { color: theme.primary }]}>{hotelInfo.rating}</Text>
            </View>
            <Text style={[styles.reviewText, { color: theme.subtext }]}>{hotelInfo.reviews} Verified Reviews</Text>
            <View style={[styles.openBadge, { backgroundColor: theme.success + '15' }]}>
              <Text style={[styles.openText, { color: theme.success }]}>OPEN NOW</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.locationRow} onPress={openMap}>
            <View style={[styles.locIcon, { backgroundColor: theme.primary + '10' }]}>
              <MaterialCommunityIcons name="map-marker" size={18} color={theme.primary} />
            </View>
            <Text style={[styles.address, { color: theme.subtext }]}>{hotelInfo.address}</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Villa Experience</Text>
          <Text style={[styles.description, { color: theme.subtext }]}>{hotelInfo.description}</Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Luxury Gallery</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
            <Image source={require('../../assets/my_villa2.jpeg')} style={styles.galleryImg} />
            <Image source={require('../../assets/my_villa3.jpeg')} style={styles.galleryImg} />
            <Image source={require('../../assets/my_villa4.jpeg')} style={styles.galleryImg} />
            <Image source={require('../../assets/my_villa5.jpeg')} style={styles.galleryImg} />
            <Image source={require('../../assets/my_villa6.jpeg')} style={styles.galleryImg} />
            <Image source={require('../../assets/my_villa7.jpeg')} style={styles.galleryImg} />
            <Image source={require('../../assets/my_villa8.jpeg')} style={styles.galleryImg} />
            <Image source={require('../../assets/my_villa9.jpeg')} style={styles.galleryImg} />
            <Image source={require('../../assets/my_villa10.jpeg')} style={styles.galleryImg} />

            <Image source={require('../../assets/my_room1.jpeg')} style={styles.galleryImg} />
            <Image source={require('../../assets/my_room3.jpeg')} style={styles.galleryImg} />
            <Image source={require('../../assets/my_pool.jpeg')} style={styles.galleryImg} />
            <Image source={require('../../assets/my_pool1.jpeg')} style={styles.galleryImg} />

            <Image source={require('../../assets/brand_logo.png')} style={[styles.galleryImg, { backgroundColor: theme.surface, padding: 20 }]} resizeMode="contain" />
          </ScrollView>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Curated Amenities</Text>
          <View style={styles.amenityGrid}>
            {hotelInfo.amenities.map((item, index) => (
              <View key={index} style={styles.amenityItem}>
                <View style={[styles.iconBox, { backgroundColor: theme.primary + '10' }]}>
                  <MaterialCommunityIcons name={item.icon} size={26} color={theme.primary} />
                </View>
                <Text style={[styles.amenityName, { color: theme.text }]}>{item.name}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={[styles.bookBtn, { backgroundColor: theme.primary }, Shadows.medium]} onPress={() => navigation.navigate('RoomList')}>
            <Text style={styles.bookBtnText}>Check Availability</Text>
            <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 400, position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)' },
  backBtn: { position: 'absolute', top: 60, left: 20, backgroundColor: 'rgba(0,0,0,0.3)', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  heartBtn: { position: 'absolute', top: 60, right: 20, backgroundColor: 'rgba(0,0,0,0.3)', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  content: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    padding: 25,
    paddingTop: 35
  },
  hotelName: { fontSize: 26, fontWeight: '900', marginBottom: 15, lineHeight: 34 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12
  },
  ratingText: { fontWeight: '900', marginLeft: 4, fontSize: 15 },
  reviewText: { fontWeight: '700', fontSize: 14, flex: 1 },
  openBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  openText: { fontWeight: '900', fontSize: 10, letterSpacing: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  locIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  address: { fontSize: 14, fontWeight: '600', flex: 1 },
  divider: { height: 1, marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 15, marginTop: 10 },
  description: { fontSize: 15, lineHeight: 26, marginBottom: 30, fontWeight: '500' },
  gallery: { marginBottom: 30, marginLeft: -5 },
  galleryImg: { width: 150, height: 150, borderRadius: 20, marginRight: 15 },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 30 },
  amenityItem: { width: '30%', alignItems: 'center', marginBottom: 15 },
  iconBox: {
    width: 65,
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  amenityName: { fontSize: 12, fontWeight: '800', textAlign: 'center' },

  bookBtn: {
    height: 65,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  bookBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' }
});

export default HotelDetailsScreen;
