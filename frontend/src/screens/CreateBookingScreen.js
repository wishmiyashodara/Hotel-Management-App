import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform, StatusBar } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme } from '../theme';

const CreateBookingScreen = ({ route, navigation }) => {
  const { isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;
  const preSelectedRoomId = route.params?.roomId || '';
  const preCheckIn = route.params?.checkIn ? new Date(route.params.checkIn) : new Date();
  const preCheckOut = route.params?.checkOut ? new Date(route.params.checkOut) : new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

  const [roomId, setRoomId] = useState(preSelectedRoomId);
  const [room, setRoom] = useState(null);

  const [checkInDate, setCheckInDate] = useState(preCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(preCheckOut);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calculationShown, setCalculationShown] = useState(!!route.params?.checkIn);

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      const response = await apiClient.get(`/rooms/${roomId}`);
      setRoom(response.data);
    } catch (error) {
      console.log('Error fetching room details:', error);
    }
  };

  const onStartChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setCheckInDate(selectedDate);
      setCalculationShown(false);
      if (checkOutDate <= selectedDate) {
        setCheckOutDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
      }
    }
  };

  const onEndChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setCheckOutDate(selectedDate);
      setCalculationShown(false);
    }
  };

  const handleCalculate = () => {
    if (checkOutDate <= checkInDate) {
      Alert.alert('Invalid Dates', 'Check-out date must be after Check-in date.');
      return;
    }
    setCalculationShown(true);
  };

  const calculateNights = () => {
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const totalPrice = room ? nights * room.pricePerNight : 0;

  const handleCreateBooking = async () => {
    if (loading) return;
    if (!roomId) {
      Alert.alert('Missing Field', 'Please enter a Room ID');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/bookings', {
        roomId,
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        totalPrice
      });
      Alert.alert(
        'Stay Confirmed! 🏰',
        'Your booking request has been sent successfully. You can track the status in your booking history.',
        [{ text: 'View My Stays', onPress: () => navigation.navigate('MyBookings') }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Booking Error', error.response?.data?.message || 'Failed to create booking.');
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>Complete Your Reservation</Text>

        {room && (
          <View style={[styles.roomShortInfo, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
              <MaterialCommunityIcons name="bed-king-outline" size={24} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.roomInfoText, { color: theme.text }]}>Room {room.roomNumber}</Text>
              <Text style={[styles.roomPriceText, { color: theme.subtext }]}>{room.roomType} • Luxury Suite</Text>
            </View>
            <Text style={[styles.pricePerNight, { color: theme.primary }]}>${room.pricePerNight}/nt</Text>
          </View>
        )}

        <View style={styles.dateSection}>
          <View style={styles.dateGroup}>
            <Text style={[styles.label, { color: theme.subtext }]}>Check-in</Text>
            <TouchableOpacity style={[styles.dateInputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setShowStartPicker(true)}>
              <MaterialCommunityIcons name="calendar-import" size={20} color={theme.primary} />
              <Text style={[styles.dateInputText, { color: theme.text }]}>{checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateGroup}>
            <Text style={[styles.label, { color: theme.subtext }]}>Check-out</Text>
            <TouchableOpacity style={[styles.dateInputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setShowEndPicker(true)}>
              <MaterialCommunityIcons name="calendar-export" size={20} color={theme.primary} />
              <Text style={[styles.dateInputText, { color: theme.text }]}>{checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={checkInDate}
            mode="date"
            display="inline"
            onChange={onStartChange}
            minimumDate={new Date()}
            accentColor={theme.primary}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={checkOutDate}
            mode="date"
            display="inline"
            onChange={onEndChange}
            minimumDate={new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)}
            accentColor={theme.primary}
          />
        )}

        {!calculationShown ? (
          <TouchableOpacity style={[styles.calculateBtn, { backgroundColor: theme.primary }]} onPress={handleCalculate}>
            <Text style={styles.calculateBtnText}>View Stay Summary</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={[styles.priceSummary, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.summaryHeader}>
              <Text style={[styles.summaryTitle, { color: theme.text }]}>Stay Summary</Text>
              <View style={[styles.nightsBadge, { backgroundColor: theme.primary + '15' }]}>
                <Text style={[styles.nightsBadgeText, { color: theme.primary }]}>{nights} Nights</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.subtext }]}>Total for {nights} nights</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>${totalPrice}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.subtext }]}>Service Charge</Text>
              <Text style={[styles.summaryValue, { color: theme.success }]}>Included</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount</Text>
              <Text style={[styles.totalValue, { color: theme.primary }]}>${totalPrice}</Text>
            </View>

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleCreateBooking} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.submitBtnText}>Confirm Booking</Text>
                  <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCalculationShown(false)} style={styles.resetContainer}>
              <Text style={[styles.resetText, { color: theme.subtext }]}>Edit Dates</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingBottom: 50 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 25 },
  roomShortInfo: { padding: 18, borderRadius: 22, marginBottom: 30, flexDirection: 'row', gap: 15, alignItems: 'center', borderWidth: 1 },
  iconCircle: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  roomInfoText: { fontSize: 18, fontWeight: '900' },
  roomPriceText: { fontSize: 14, marginTop: 2, fontWeight: '600' },
  pricePerNight: { fontSize: 16, fontWeight: '800' },
  dateSection: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  dateGroup: { flex: 1 },
  label: { fontSize: 11, fontWeight: '900', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  input: { borderRadius: 18, padding: 18, fontSize: 16, marginBottom: 20, borderWidth: 1 },
  dateInputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 18, padding: 18,
    borderWidth: 1, height: 65
  },
  dateInputText: { fontSize: 16, fontWeight: '800' },
  calculateBtn: {
    height: 65,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    gap: 10,
    elevation: 4
  },
  calculateBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  priceSummary: { padding: 30, borderRadius: 30, marginTop: 40, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 15, borderWidth: 1 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  summaryTitle: { fontSize: 20, fontWeight: '900' },
  nightsBadge: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  nightsBadgeText: { fontSize: 14, fontWeight: '900' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  summaryLabel: { fontSize: 16, fontWeight: '600' },
  summaryValue: { fontSize: 16, fontWeight: '800' },
  divider: { height: 1, marginVertical: 20 },
  totalLabel: { fontSize: 20, fontWeight: '900' },
  totalValue: { fontSize: 28, fontWeight: '900' },
  submitBtn: { height: 65, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30, gap: 12 },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  resetContainer: { marginTop: 20, alignItems: 'center' },
  resetText: { fontSize: 15, fontWeight: '700', textDecorationLine: 'underline' }
});

export default CreateBookingScreen;
