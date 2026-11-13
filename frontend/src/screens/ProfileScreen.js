import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ScrollView, TextInput, Alert, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme } from '../theme';
import apiClient from '../api/client';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await apiClient.put('/auth/profile', { name, phone });
      Alert.alert('Success', 'Profile updated! Please sign in again to reflect changes.');
      logout(); 
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const ProfileItem = ({ icon, label, value, color = theme.primary }) => (
    <View style={styles.itemContainer}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.itemTextContent}>
        <Text style={[styles.itemLabel, { color: theme.subtext }]}>{label}</Text>
        <Text style={[styles.itemValue, { color: theme.text }]}>{value || 'Not Set'}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.headerGradient, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Image 
          source={require('../../assets/brand_logo.png')} 
          style={styles.logoSmall} 
          resizeMode="contain"
        />
        <View style={styles.profileImageContainer}>
          <View style={[styles.profilePlaceholder, { backgroundColor: theme.primary }]}>
            <Text style={styles.profileLetter}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <TouchableOpacity style={[styles.editBadge, { backgroundColor: theme.text, borderColor: theme.surface }]} onPress={() => setIsEditing(!isEditing)}>
            <MaterialCommunityIcons name={isEditing ? "close" : "pencil"} size={16} color={theme.background} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.userName, { color: theme.text }]}>{user?.name}</Text>
        <View style={[styles.roleBadge, { backgroundColor: user?.role === 'admin' ? theme.error + '15' : user?.role === 'staff' ? theme.primary + '15' : theme.success + '15' }]}>
          <MaterialCommunityIcons 
            name={user?.role === 'admin' ? 'crown' : user?.role === 'staff' ? 'badge-account' : 'account-heart'} 
            size={12} 
            color={user?.role === 'admin' ? theme.error : user?.role === 'staff' ? theme.primary : theme.success} 
          />
          <Text style={[styles.roleText, { color: user?.role === 'admin' ? theme.error : user?.role === 'staff' ? theme.primary : theme.success }]}>
            {user?.role?.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={[styles.contentCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Information</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={[styles.editLink, { color: theme.primary }]}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {isEditing ? (
          <View style={styles.editForm}>
            <Text style={[styles.inputLabel, { color: theme.subtext }]}>Full Name</Text>
            <TextInput 
              style={[styles.editInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]} 
              value={name} 
              onChangeText={setName}
              placeholderTextColor={theme.subtext}
            />
            <Text style={[styles.inputLabel, { color: theme.subtext }]}>Phone Number</Text>
            <TextInput 
              style={[styles.editInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]} 
              value={phone} 
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={theme.subtext}
            />
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleUpdate} disabled={loading}>
              <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ProfileItem 
              icon="account-outline" 
              label="Full Name" 
              value={user?.name} 
              color={theme.primary}
            />
            <ProfileItem 
              icon="email-outline" 
              label="Email Address" 
              value={user?.email} 
              color="#5856D6"
            />
            <ProfileItem 
              icon="phone-outline" 
              label="Phone Number" 
              value={user?.phone} 
              color="#FF2D55"
            />
            <ProfileItem 
              icon="shield-check-outline" 
              label="Access Level" 
              value={
                user?.role === 'admin' ? 'Administrator' : 
                user?.role === 'staff' ? `${user?.position || 'Hotel Staff'}` : 'Customer'
              } 
              color="#4CD964"
            />
          </>
        )}

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.versionText, { color: theme.subtext }]}>Coconut Republik v1.1.0 - Premium Edition</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { 
    paddingTop: 40, 
    paddingBottom: 30, 
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderBottomWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  logoSmall: {
    width: 60,
    height: 60,
    marginBottom: 15
  },
  profileImageContainer: { position: 'relative', marginBottom: 15 },
  profilePlaceholder: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  profileLetter: { color: '#fff', fontSize: 40, fontWeight: '800' },
  editBadge: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 3
  },
  userName: { fontSize: 24, fontWeight: '800' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
    gap: 6
  },
  roleText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1
  },
  contentCard: { 
    margin: 20, 
    borderRadius: 24, 
    padding: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemTextContent: { flex: 1 },
  itemLabel: { fontSize: 13, fontWeight: '500' },
  itemValue: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  divider: { height: 1, marginVertical: 10 },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 15,
    marginTop: 10
  },
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '700', marginLeft: 10 },
  versionText: { textAlign: 'center', fontSize: 12, marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  editLink: { fontWeight: '700', fontSize: 14 },
  editForm: { marginTop: 5 },
  inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  editInput: { 
    borderRadius: 12, 
    padding: 15, 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 20,
    borderWidth: 1
  },
  saveBtn: { 
    padding: 16, 
    borderRadius: 15, 
    alignItems: 'center',
    marginTop: 10,
    elevation: 4
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});

export default ProfileScreen;
