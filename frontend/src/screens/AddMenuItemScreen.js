import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform, StatusBar, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { LightTheme, DarkTheme } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AddMenuItemScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Drinks');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks'];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddItem = async () => {
    if (!name || !category || !price) {
      Alert.alert('Error', 'Please fill the required fields');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('itemName', name);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('description', description);

      if (image) {
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        formData.append('image', { uri: image, name: filename, type });
      }

      await apiClient.post('/restaurant/menu', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Item added to menu');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={32} color={theme.primary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Add Menu Item</Text>
        </View>

        <TouchableOpacity 
          style={[styles.imagePicker, { backgroundColor: theme.surface, borderColor: theme.border }]} 
          onPress={pickImage}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.pickerPlaceholder}>
              <MaterialCommunityIcons name="camera-plus-outline" size={40} color={theme.primary} />
              <Text style={[styles.pickerText, { color: theme.subtext }]}>Upload Dish Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={[styles.label, { color: theme.subtext }]}>Item Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Mango Juice"
          placeholderTextColor={theme.subtext}
        />

        <Text style={[styles.label, { color: theme.subtext }]}>Category</Text>
        <View style={styles.badgeContainer}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.badge, { backgroundColor: theme.surface, borderColor: theme.border }, category === cat && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.badgeText, { color: theme.subtext }, category === cat && { color: '#fff' }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.subtext }]}>Price ($)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="e.g. 12.00"
          placeholderTextColor={theme.subtext}
        />

        <Text style={[styles.label, { color: theme.subtext }]}>Description</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, height: 100, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Ingredients, taste..."
          placeholderTextColor={theme.subtext}
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleAddItem} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Publish to Menu</Text>
              <MaterialCommunityIcons name="check-decagram-outline" size={20} color="#fff" style={{ marginLeft: 10 }} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingBottom: 50 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 30, marginTop: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  imagePicker: {
    height: 200, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 10
  },
  previewImage: { width: '100%', height: '100%' },
  pickerPlaceholder: { alignItems: 'center', gap: 10 },
  pickerText: { fontSize: 14, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 20, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    padding: 18, borderRadius: 15, fontSize: 16, borderWidth: 1, fontWeight: '500'
  },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
  badge: { 
    paddingHorizontal: 16, paddingVertical: 10, 
    borderRadius: 12, borderWidth: 1
  },
  badgeText: { fontSize: 13, fontWeight: '700' },
  button: {
    height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '800' }
});

export default AddMenuItemScreen;
