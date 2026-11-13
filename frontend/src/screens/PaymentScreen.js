import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform, StatusBar, KeyboardAvoidingView } from 'react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme } from '../theme';

const PaymentScreen = ({ route, navigation }) => {
  const { user, isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;
  const [unpaidBookings, setUnpaidBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [method, setMethod] = useState('Card');
  const [receipt, setReceipt] = useState(null);

  // Card Info States
  const [cardName, setCardName] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const matched = cleaned.match(/.{1,4}/g);
    return matched ? matched.join(' ') : cleaned;
  };

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  useEffect(() => {
    fetchUnpaidBookings();
  }, []);

  const fetchUnpaidBookings = async () => {
    try {
      setFetching(true);
      const response = await apiClient.get('/bookings/mybookings');
      // Only show Approved and Unpaid
      const filtered = response.data.filter(b => b.status === 'Approved' && b.paymentStatus === 'Unpaid');
      setUnpaidBookings(filtered);
      
      // AUTO-SELECT LOGIC:
      // 1. If a specific booking was passed via route, select it
      if (route.params?.bookingId) {
        const found = filtered.find(b => b._id === route.params.bookingId);
        if (found) {
          setSelectedBooking(found);
          return;
        }
      }

      // 2. If there is only ONE unpaid entry, select it automatically
      if (filtered.length === 1) {
        setSelectedBooking(filtered[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedBooking) {
      Alert.alert('Selection Required', 'Please select a booking to pay for.');
      return;
    }

    if (method === 'Card') {
      const cleanCard = cardNumber.replace(/\D/g, '');
      if (cleanCard.length !== 16) {
        Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number.');
        return;
      }
      if (!expiry.includes('/') || expiry.length !== 5) {
        Alert.alert('Invalid Expiry', 'Please use MM/YY format.');
        return;
      }
      if (cvv.length !== 3) {
        Alert.alert('Invalid CVV', 'CVV must be 3 digits.');
        return;
      }
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/payments', {
        userId: user._id,
        bookingId: selectedBooking._id,
        amount: selectedBooking.grandTotal,
        method
      });
      
      setReceipt(response.data);
      Alert.alert('Success! ✅', `Payment processed via ${method}.`);
    } catch (error) {
      console.error(error);
      Alert.alert('Payment Error', error.response?.data?.message || 'Failed to process payment.');
    } finally {
      setLoading(false);
    }
  };

  if (receipt) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <View style={styles.successBox}>
          <MaterialCommunityIcons name="check-decagram" size={100} color={theme.success} />
          <Text style={[styles.successTitle, { color: theme.text }]}>Payment Received!</Text>
          <Text style={[styles.successSub, { color: theme.subtext }]}>Thank you for choosing our hotel.</Text>
          
          <View style={[styles.receiptDetails, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.receiptRow}>
              <Text style={[styles.rLabel, { color: theme.subtext }]}>Transaction ID</Text>
              <Text style={[styles.rValue, { color: theme.text }]}>#{receipt._id.slice(-8).toUpperCase()}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={[styles.rLabel, { color: theme.subtext }]}>Amount Paid</Text>
              <Text style={[styles.rValue, { color: theme.success }]}>${receipt.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={[styles.rLabel, { color: theme.subtext }]}>Method</Text>
              <Text style={[styles.rValue, { color: theme.text }]}>{receipt.method}</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.doneBtn, { backgroundColor: theme.text }]} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={[styles.doneBtnText, { color: theme.background }]}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: theme.text }]}>Process Payment</Text>
          
          <View style={[styles.vCard, { backgroundColor: isDarkMode ? theme.surface : '#1C1C1E' }]}>
            <View style={styles.vCardHeader}>
              <MaterialCommunityIcons name="integrated-circuit-chip" size={40} color="#FFD700" />
              <MaterialCommunityIcons name="wifi" size={24} color="#fff" style={{ transform: [{ rotate: '90deg' }] }} />
            </View>
            <Text style={styles.vCardNumber}>**** **** **** 4242</Text>
            <View style={styles.vCardFooter}>
              <View>
                <Text style={styles.vCardLabel}>CARD HOLDER</Text>
                <Text style={styles.vCardValue}>{user?.name?.toUpperCase()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.vCardLabel}>EXPIRES</Text>
                <Text style={styles.vCardValue}>12/28</Text>
              </View>
            </View>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.subtext }]}>Choose Approved Booking</Text>
            {fetching ? <ActivityIndicator color={theme.primary} style={{ marginBottom: 20 }} /> : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bookingSelector}>
                {unpaidBookings.length === 0 ? (
                  <Text style={[styles.noBookingText, { color: theme.subtext }]}>No approved unpaid bookings found.</Text>
                ) : (
                  unpaidBookings.map(b => (
                    <TouchableOpacity 
                      key={b._id} 
                      style={[styles.bookingChip, { backgroundColor: theme.surface, borderColor: theme.border }, selectedBooking?._id === b._id && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                      onPress={() => setSelectedBooking(b)}
                    >
                      <Text style={[styles.chipTitle, { color: theme.text }, selectedBooking?._id === b._id && { color: '#fff' }]}>
                        {b.virtual ? b.roomId?.roomNumber : `Room ${b.roomId?.roomNumber}`}
                      </Text>
                      <Text style={[styles.chipSub, { color: theme.subtext }, selectedBooking?._id === b._id && { color: '#fff' }]}>
                        ${b.grandTotal?.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}

            {selectedBooking && (
              <View style={[styles.billBreakdown, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: theme.subtext }]}>Room Total</Text>
                  <Text style={[styles.billValue, { color: theme.text }]}>${selectedBooking.totalPrice?.toFixed(2)}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: theme.subtext }]}>Restaurant Orders</Text>
                  <Text style={[styles.billValue, { color: theme.text }]}>+${(selectedBooking.orderTotal || 0).toFixed(2)}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.billRow}>
                  <Text style={[styles.grandLabel, { color: theme.text }]}>Grand Total</Text>
                  <Text style={[styles.grandValue, { color: theme.primary }]}>${selectedBooking.grandTotal?.toFixed(2)}</Text>
                </View>
              </View>
            )}

            <Text style={[styles.label, { color: theme.subtext }]}>Select Payment Method</Text>
            <View style={styles.methodRow}>
              {[
                { id: 'Card', icon: 'credit-card-outline' },
                { id: 'Cash', icon: 'cash-multiple' }
              ].map(m => (
                <TouchableOpacity 
                  key={m.id} 
                  style={[styles.mBadge, { backgroundColor: theme.surface, borderColor: theme.border }, method === m.id && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                  onPress={() => setMethod(m.id)}
                >
                  <MaterialCommunityIcons name={m.icon} size={24} color={method === m.id ? '#fff' : theme.subtext} />
                  <Text style={[styles.mText, { color: theme.subtext }, method === m.id && { color: '#fff' }]}>{m.id}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {method === 'Card' && (
              <View style={styles.cardForm}>
                <Text style={[styles.label, { color: theme.subtext }]}>Secure Card Gateway</Text>
                <View style={[styles.inputBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <MaterialCommunityIcons name="credit-card-chip-outline" size={20} color={theme.subtext} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor={theme.subtext}
                    value={cardNumber}
                    onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={[styles.inputBox, { flex: 1, backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <MaterialCommunityIcons name="calendar-clock" size={20} color={theme.subtext} />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder="MM/YY"
                      placeholderTextColor={theme.subtext}
                      value={expiry}
                      onChangeText={(t) => setExpiry(formatExpiry(t))}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View style={[styles.inputBox, { flex: 1, backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <MaterialCommunityIcons name="shield-check-outline" size={20} color={theme.subtext} />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder="CVV"
                      placeholderTextColor={theme.subtext}
                      value={cvv}
                      onChangeText={setCvv}
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>
                <Text style={[styles.secureText, { color: theme.subtext }]}>
                  <MaterialCommunityIcons name="lock" size={12} color={theme.subtext} /> Encrypted & Secure Payment
                </Text>
              </View>
            )}

            {method === 'Cash' && (
              <View style={[styles.cashNotice, { backgroundColor: theme.subtext + '15' }]}>
                <MaterialCommunityIcons name="information-outline" size={20} color={theme.subtext} />
                <Text style={[styles.cashText, { color: theme.subtext }]}>Please proceed to the reception counter to settle this bill via Cash.</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.payBtn, { backgroundColor: theme.success }, !selectedBooking && { opacity: 0.5 }]} 
              onPress={handlePayment} 
              disabled={loading || !selectedBooking}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.payBtnText}>
                    {method === 'Cash' ? 'Confirm Cash Intent' : `Pay Now — $${selectedBooking?.grandTotal?.toFixed(2) || '0.00'}`}
                  </Text>
                  <MaterialCommunityIcons name="lock-outline" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 25 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 25 },
  vCard: { 
    height: 200, 
    borderRadius: 25, 
    padding: 25, 
    justifyContent: 'space-between',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20
  },
  vCardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  vCardNumber: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: 2 },
  vCardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  vCardLabel: { color: '#8E8E93', fontSize: 10, fontWeight: '800', marginBottom: 5 },
  vCardValue: { color: '#fff', fontSize: 14, fontWeight: '800' },
  form: { marginTop: 30 },
  label: { fontSize: 13, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase' },
  inputBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 15, 
    paddingHorizontal: 15, 
    height: 60,
    marginBottom: 20,
    borderWidth: 1
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: '700' },
  bookingSelector: { marginBottom: 25 },
  bookingChip: { padding: 15, borderRadius: 20, marginRight: 12, borderWidth: 1, minWidth: 120, alignItems: 'center' },
  chipTitle: { fontSize: 14, fontWeight: '800' },
  chipSub: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  noBookingText: { fontSize: 14, fontStyle: 'italic' },
  billBreakdown: { padding: 20, borderRadius: 25, marginBottom: 30, borderWidth: 1 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billLabel: { fontSize: 14, fontWeight: '700' },
  billValue: { fontSize: 14, fontWeight: '800' },
  divider: { height: 1, marginVertical: 12 },
  grandLabel: { fontSize: 16, fontWeight: '900' },
  grandValue: { fontSize: 20, fontWeight: '900' },
  cardForm: { marginBottom: 20 },
  secureText: { fontSize: 12, textAlign: 'center', marginTop: 10, fontWeight: '600' },
  cashNotice: { flexDirection: 'row', padding: 15, borderRadius: 15, alignItems: 'center', gap: 10, marginBottom: 30 },
  cashText: { flex: 1, fontSize: 13, fontWeight: '700' },
  methodRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  mBadge: { flex: 1, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1 },
  mText: { fontSize: 12, fontWeight: '800' },
  payBtn: { height: 65, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 5 },
  payBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  
  // Success View
  successBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  successTitle: { fontSize: 26, fontWeight: '900', marginTop: 20 },
  successSub: { fontSize: 16, marginTop: 5, textAlign: 'center' },
  receiptDetails: { width: '100%', padding: 25, borderRadius: 25, marginTop: 40, gap: 15, borderWidth: 1 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between' },
  rLabel: { fontWeight: '700' },
  rValue: { fontWeight: '800' },
  doneBtn: { paddingVertical: 18, width: '100%', borderRadius: 20, alignItems: 'center', marginTop: 40 },
  doneBtnText: { fontSize: 16, fontWeight: '800' }
});

export default PaymentScreen;

