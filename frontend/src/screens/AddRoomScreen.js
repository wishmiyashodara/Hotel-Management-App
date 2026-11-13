import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme } from '../theme';

const AddRoomScreen = ({ navigation }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('Single');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [hasAC, setHasAC] = useState(true);
  const [amenities, setAmenities] = useState({
    wifi: true,
    tv: true,
    minibar: false
  });
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const toggleAmenity = (key) => {
    setAmenities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const roomTypes = ['Single', 'Double', 'Suite', 'Deluxe'];

  const handleAddRoom = async () => {
    if (!roomNumber || !price) {
      Alert.alert('Error', 'Room number and price are required');
      return;
    }

    const amenityString = Object.entries(amenities)
      .filter(([_, val]) => val)
      .map(([key]) => key.toUpperCase())
      .join(', ');

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('roomNumber', roomNumber);
      formData.append('roomType', roomType);
      formData.append('pricePerNight', price);
      formData.append('description', description + (amenityString ? `\nAmenities: ${amenityString}` : ''));
      formData.append('hasAC', String(hasAC));
      formData.append('capacity', roomType === 'Single' ? '1' : roomType === 'Double' ? '2' : '4');

      if (selectedImage) {
        const uri = selectedImage.uri;
        const name = uri.split('/').pop();
        const type = `image/${name.split('.').pop()}`;
        formData.append('image', { uri, name, type });
      }

      await apiClient.post('/rooms', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Alert.alert('Success', 'Room added successfully! 🏨');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.text }]}>Add New Room</Text>

        <Text style={[styles.label, { color: theme.subtext }]}>Room Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          value={roomNumber}
          onChangeText={setRoomNumber}
          placeholder="e.g. 101"
          placeholderTextColor={theme.subtext}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: theme.subtext }]}>Room Type</Text>
        <View style={styles.typeContainer}>
          {roomTypes.map((t) => (
            <TouchableOpacity 
              key={t} 
              style={[styles.typeBadge, { backgroundColor: theme.surface, borderColor: theme.border }, roomType === t && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setRoomType(t)}
            >
              <Text style={[styles.typeText, { color: theme.subtext }, roomType === t && { color: '#fff' }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.subtext }]}>Price per Night ($)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          value={price}
          onChangeText={setPrice}
          placeholder="e.g. 150"
          placeholderTextColor={theme.subtext}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: theme.subtext }]}>Room Photo</Text>
        <TouchableOpacity style={[styles.imagePickerBtn, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]} onPress={pickImage}>
          <MaterialCommunityIcons name="image-plus" size={24} color={theme.primary} />
          <Text style={[styles.imagePickerText, { color: theme.primary }]}>
            {selectedImage ? 'Change Photo' : 'Select Room Photo from Gallery'}
          </Text>
        </TouchableOpacity>

        {selectedImage && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImage} onPress={() => setSelectedImage(null)}>
              <MaterialCommunityIcons name="close-circle" size={24} color={theme.error} />
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.label, { color: theme.subtext }]}>AC Status</Text>
        <View style={styles.typeContainer}>
          {[
            { label: 'AC Room', value: true, icon: 'snowflake' },
            { label: 'Non-AC', value: false, icon: 'fan' }
          ].map((item) => (
            <TouchableOpacity 
              key={item.label} 
              style={[styles.typeBadge, { backgroundColor: theme.surface, borderColor: theme.border }, hasAC === item.value && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setHasAC(item.value)}
            >
              <MaterialCommunityIcons 
                name={item.icon} 
                size={16} 
                color={hasAC === item.value ? '#fff' : theme.subtext} 
                style={{ marginRight: 5 }} 
              />
              <Text style={[styles.typeText, { color: theme.subtext }, hasAC === item.value && { color: '#fff' }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.subtext }]}>Amenities</Text>
        <View style={styles.typeContainer}>
          {[
            { key: 'wifi', label: 'WiFi', icon: 'wifi' },
            { key: 'tv', label: 'TV', icon: 'television' },
            { key: 'minibar', label: 'Mini Bar', icon: 'fridge-outline' }
          ].map((item) => (
            <TouchableOpacity 
              key={item.key} 
              style={[styles.typeBadge, { backgroundColor: theme.surface, borderColor: theme.border }, amenities[item.key] && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => toggleAmenity(item.key)}
            >
              <MaterialCommunityIcons 
                name={item.icon} 
                size={16} 
                color={amenities[item.key] ? '#fff' : theme.subtext} 
                style={{ marginRight: 5 }} 
              />
              <Text style={[styles.typeText, { color: theme.subtext }, amenities[item.key] && { color: '#fff' }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.subtext }]}>Description</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, height: 100, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Special features, views..."
          placeholderTextColor={theme.subtext}
          multiline
        />

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleAddRoom} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitText}>Create Room</Text>
              <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 25 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 25 },
  label: { fontSize: 12, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { 
    padding: 15, 
    borderRadius: 15, 
    fontSize: 16, 
    marginBottom: 20,
    borderWidth: 1,
    fontWeight: '600'
  },
  typeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeBadge: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 12, 
    borderWidth: 1, 
    flexDirection: 'row',
    alignItems: 'center'
  },
  typeText: { fontSize: 14, fontWeight: '800' },
  submitBtn: { 
    height: 60, 
    borderRadius: 18, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10,
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  imagePickerBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20
  },
  imagePickerText: { fontSize: 15, fontWeight: '800' },
  previewContainer: { position: 'relative', marginBottom: 20 },
  imagePreview: { width: '100%', height: 200, borderRadius: 15 },
  removeImage: { position: 'absolute', top: -10, right: -10, backgroundColor: '#fff', borderRadius: 20 }
});

export default AddRoomScreen;
