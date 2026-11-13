import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform, Image, StatusBar } from 'react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LightTheme, DarkTheme } from '../theme';

const AddEmployeeScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('RECEPTION');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [salary, setSalary] = useState('');
  const [joinDate, setJoinDate] = useState(new Date());
  const [image, setImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const positions = ['ADMIN', 'RECEPTION', 'RESTAURANT STAFF', 'HOUSEKEEPING', 'MAINTENANCE'];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to upload an employee picture.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address with an @ symbol.');
      return false;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      Alert.alert('Invalid Phone', 'Phone number must be exactly 10 digits.');
      return false;
    }
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return false;
    }
    return true;
  };

  const handleAddEmployee = async () => {
    if (!name || !salary || !phone || !password) {
      Alert.alert('Required Fields', 'Please fill in Name, Phone, Salary, and Login Password.');
      return;
    }

    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('position', position);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('password', password);
      formData.append('salary', salary);
      formData.append('joinDate', joinDate.toISOString().split('T')[0]);

      if (image) {
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('image', { uri: image, name: filename, type });
      }

      await apiClient.post('/employees', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Alert.alert('Success', 'Advanced employee profile created!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ title, icon }) => (
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons name={icon} size={20} color={theme.primary} />
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <TouchableOpacity style={[styles.imagePicker, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImg} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="camera-plus-outline" size={32} color={theme.subtext} />
              <Text style={[styles.imageText, { color: theme.subtext }]}>Upload Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <SectionHeader title="Basic Information" icon="account-details-outline" />
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={theme.subtext}
        />

        <Text style={[styles.label, { color: theme.subtext }]}>Job Position</Text>
        <View style={styles.chipRow}>
          {positions.map((p) => (
            <TouchableOpacity 
              key={p} 
              style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }, position === p && { backgroundColor: theme.primary, borderColor: theme.primary }]} 
              onPress={() => setPosition(p)}
            >
              <Text style={[styles.chipText, { color: theme.subtext }, position === p && { color: '#fff' }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <SectionHeader title="Contact Details" icon="phone-outline" />
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={theme.subtext}
        />
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor={theme.subtext}
        />
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Set Login Password (min 8 chars)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={theme.subtext}
        />

        <SectionHeader title="Employment & Salary" icon="briefcase-outline" />
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Monthly Salary (USD)"
          value={salary}
          onChangeText={setSalary}
          keyboardType="numeric"
          placeholderTextColor={theme.subtext}
        />



        <TouchableOpacity style={[styles.datePickerBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setShowDatePicker(true)}>
          <MaterialCommunityIcons name="calendar-outline" size={20} color={theme.text} />
          <Text style={[styles.dateText, { color: theme.text }]}>Joining Date: {joinDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={joinDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setJoinDate(selectedDate);
            }}
          />
        )}

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleAddEmployee} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Create Employee Profile</Text>
              <MaterialCommunityIcons name="check-decagram-outline" size={20} color="#fff" style={styles.btnIcon} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingBottom: 60 },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  profileImg: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  imageText: { fontSize: 12, marginTop: 5, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginLeft: 10, letterSpacing: -0.5 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 10 },
  input: {
    padding: 18,
    borderRadius: 15,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    borderWidth: 1
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  chip: { 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12, 
    borderWidth: 1
  },
  chipText: { fontSize: 13, fontWeight: '700' },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 15,
    marginTop: 10,
    borderWidth: 1
  },
  dateText: { fontSize: 16, fontWeight: '600', marginLeft: 10 },
  submitBtn: {
    padding: 20,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20
  },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  btnIcon: { marginLeft: 10 }
});

export default AddEmployeeScreen;
