import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator, TextInput, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../context/AuthContext';
import { LightTheme, DarkTheme, Shadows } from '../theme';
import apiClient from '../api/client';

const TableReservationScreen = ({ navigation }) => {
  const { isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guests, setGuests] = useState(2);
  const [area, setArea] = useState('Upstairs');
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReserve = async () => {
    if (!tableNumber) {
      Alert.alert('Required', 'Please enter a table number');
      return;
    }
    try {
      setLoading(true);
      await apiClient.post('/reservations', {
        date: date.toISOString(),
        guests: guests.toString(),
        area,
        tableNumber
      });
      setLoading(false);
      Alert.alert(
        'Table Reserved! 🥂',
        `Your ${area} table (#${tableNumber}) for ${guests} guests has been reserved for ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        [{ text: 'Perfect', onPress: () => navigation.navigate('Dashboard') }]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.message || 'Failed to reserve table. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Reserve a Table</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
          <MaterialCommunityIcons name="calendar-check" size={40} color={theme.primary} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Reservation Details</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.subtext }]}>Select Date & Time</Text>
          <TouchableOpacity
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialCommunityIcons name="clock-outline" size={22} color={theme.primary} />
            <Text style={[styles.inputText, { color: theme.text }]}>
              {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display="default"
            onChange={(e, d) => {
              setShowDatePicker(false);
              if (d) setDate(d);
            }}
          />
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.subtext }]}>Number of Guests</Text>
          <View style={styles.guestRow}>
            {[1, 2, 3, 4, 5, '6+'].map(num => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.guestBtn,
                  { backgroundColor: guests === num ? theme.primary : theme.surface },
                  guests === num ? Shadows.medium : {}
                ]}
                onPress={() => setGuests(num)}
              >
                <Text style={[styles.guestText, { color: guests === num ? '#fff' : theme.text }]}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.subtext }]}>Seating Area</Text>
          <View style={styles.areaRow}>
            {['Upstairs', 'Downstairs'].map(loc => (
              <TouchableOpacity 
                key={loc} 
                style={[
                  styles.areaBtn, 
                  { backgroundColor: area === loc ? theme.primary : theme.surface },
                  area === loc ? Shadows.medium : {}
                ]}
                onPress={() => setArea(loc)}
              >
                <MaterialCommunityIcons 
                  name={loc === 'Upstairs' ? "stairs-up" : "stairs-down"} 
                  size={20} 
                  color={area === loc ? '#fff' : theme.primary} 
                />
                <Text style={[styles.areaText, { color: area === loc ? '#fff' : theme.text }]}>{loc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.subtext }]}>Table Number</Text>
          <View style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="numeric" size={22} color={theme.primary} />
            <TextInput
              style={[styles.inputText, { color: theme.text, flex: 1 }]}
              value={tableNumber}
              onChangeText={setTableNumber}
              placeholder="e.g. 05"
              placeholderTextColor={theme.subtext}
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.menuBtn, { borderColor: theme.primary }]} 
          onPress={() => navigation.navigate('RestaurantMenu', { type: 'Table Reservation' })}
        >
          <MaterialCommunityIcons name="book-open-variant" size={20} color={theme.primary} />
          <Text style={[styles.menuBtnText, { color: theme.primary }]}>Browse Dinner Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.reserveBtn, { backgroundColor: theme.primary }, Shadows.medium]}
          onPress={handleReserve}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={styles.reserveBtnText}>Confirm Reservation</Text>
              <MaterialCommunityIcons name="check-circle-outline" size={22} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.footerInfo, { color: theme.subtext }]}>
          Reservations are held for 15 minutes. For large groups (10+), please contact staff directly.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '900' },
  scroll: { padding: 25, alignItems: 'center' },
  iconCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  sectionTitle: { fontSize: 22, fontWeight: '900', alignSelf: 'flex-start', marginBottom: 25 },
  inputGroup: { width: '100%', marginBottom: 30 },
  label: { fontSize: 13, fontWeight: '800', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  input: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, borderWidth: 1, gap: 12 },
  inputText: { fontSize: 16, fontWeight: '700' },
  guestRow: { flexDirection: 'row', justifyContent: 'space-between' },
  guestBtn: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  guestText: { fontSize: 16, fontWeight: '800' },
  areaRow: { gap: 12 },
  areaBtn: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, gap: 12 },
  areaText: { fontSize: 16, fontWeight: '700' },
  menuBtn: { width: '100%', height: 55, borderRadius: 20, borderWidth: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 10 },
  menuBtnText: { fontSize: 15, fontWeight: '800' },
  reserveBtn: { width: '100%', height: 65, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 10 },
  reserveBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  footerInfo: { fontSize: 12, textAlign: 'center', marginTop: 30, lineHeight: 18, fontWeight: '600' }
});

export default TableReservationScreen;
