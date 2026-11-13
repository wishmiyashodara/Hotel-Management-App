import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, StatusBar, TouchableOpacity } from 'react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LightTheme, DarkTheme } from '../theme';

const UserListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isDarkMode } = useContext(AuthContext);
  const theme = isDarkMode ? DarkTheme : LightTheme;

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Permission Denied', 'Only administrators can manage system users.');
      navigation.goBack();
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auth/users');
      setUsers(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  const getRoleConfig = (role) => {
    switch(role) {
      case 'admin': return { label: 'ADMIN', color: theme.error, icon: 'crown' };
      case 'staff': return { label: 'STAFF', color: theme.primary, icon: 'badge-account' };
      default: return { label: 'CUSTOMER', color: theme.success, icon: 'account-heart' };
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    Alert.alert('Update Role', `Are you sure you want to change this user to ${newRole.toUpperCase()}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Update',
        onPress: async () => {
          try {
            setLoading(true);
            await apiClient.put(`/auth/users/${userId}/role`, { role: newRole });
            Alert.alert('Success', 'Role updated successfully!');
            fetchUsers();
          } catch (error) {
            Alert.alert('Error', 'Failed to update role');
            setLoading(false);
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => {
    const { label, color, icon } = getRoleConfig(item.role);
    return (
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.avatarBox, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
            <View style={[styles.badge, { backgroundColor: color + '15', borderColor: color }]}>
              <MaterialCommunityIcons name={icon} size={10} color={color} />
              <Text style={[styles.badgeText, { color }]}>{label}</Text>
            </View>
          </View>
          <Text style={[styles.email, { color: theme.subtext }]}>{item.email}</Text>
          <Text style={[styles.phone, { color: theme.primary }]}>{item.phone || 'No phone set'}</Text>
        </View>

        <TouchableOpacity 
          style={styles.roleBtn} 
          onPress={() => {
            Alert.alert('Select Role', 'Choose a new role for this user:', [
              { text: 'Staff', onPress: () => handleRoleChange(item._id, 'staff') },
              { text: 'Admin', onPress: () => handleRoleChange(item._id, 'admin') },
              { text: 'Customer', onPress: () => handleRoleChange(item._id, 'customer') },
              { text: 'Cancel', style: 'cancel' }
            ]);
          }}
        >
          <MaterialCommunityIcons name="account-edit-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Manage Users</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>{users.length} Total Accounts Registered</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.subtext }]}>No registered users found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingBottom: 15 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  avatarBox: { 
    width: 55, 
    height: 55, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 17, fontWeight: '700' },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 8, 
    marginLeft: 10,
    borderWidth: 1
  },
  badgeText: { fontSize: 9, fontWeight: '800', marginLeft: 4 },
  email: { fontSize: 13, fontWeight: '500' },
  phone: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  roleBtn: { padding: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 }
});

export default UserListScreen;
