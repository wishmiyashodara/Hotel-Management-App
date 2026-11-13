import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import { View, Text } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import RoomListScreen from '../screens/RoomListScreen';
import AddRoomScreen from '../screens/AddRoomScreen';

// New Modules
import EmployeeListScreen from '../screens/EmployeeListScreen';
import AddEmployeeScreen from '../screens/AddEmployeeScreen';
import EmployeeDetailScreen from '../screens/EmployeeDetailScreen';
import PayrollListScreen from '../screens/PayrollListScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import BookingListScreen from '../screens/BookingListScreen';
import CreateBookingScreen from '../screens/CreateBookingScreen';
import PaymentHistoryScreen from '../screens/PaymentHistoryScreen';
import PaymentScreen from '../screens/PaymentScreen';
import RestaurantMenuScreen from '../screens/RestaurantMenuScreen';
import AddMenuItemScreen from '../screens/AddMenuItemScreen';
import OrderListScreen from '../screens/OrderListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UserListScreen from '../screens/UserListScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import HotelDetailsScreen from '../screens/HotelDetailsScreen';
import EmailHubScreen from '../screens/EmailHubScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import RestaurantHubScreen from '../screens/RestaurantHubScreen';
import TableReservationScreen from '../screens/TableReservationScreen';
import MyReservationsScreen from '../screens/MyReservationsScreen';






const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useContext(AuthContext);
  
  console.log('AppNavigator: user=', user, 'isLoading=', isLoading);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading application...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {user ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="RoomList" component={RoomListScreen} options={{ title: 'Rooms' }} />
            <Stack.Screen name="AddRoom" component={AddRoomScreen} options={{ title: 'Add New Room' }} />
            
            {/* Employee Flow */}
            <Stack.Screen name="EmployeeList" component={EmployeeListScreen} options={{ title: 'Employee Portal' }} />
            <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} options={{ title: 'Add Employee' }} />
            <Stack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} options={{ title: 'Employee Details' }} />
            <Stack.Screen name="PayrollList" component={PayrollListScreen} options={{ title: 'Staff Payroll' }} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Work Hub' }} />
            
            {/* Booking Flow */}
            <Stack.Screen name="BookingList" component={BookingListScreen} options={{ title: 'Booking History' }} />
            <Stack.Screen name="CreateBooking" component={CreateBookingScreen} options={{ title: 'Book a Room' }} />

            {/* Payment Flow */}
            <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{ title: 'Billing & Payments' }} />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Process Payment' }} />

            {/* Restaurant Flow */}
            <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} options={{ title: 'Restaurant Menu' }} />
            <Stack.Screen name="AddMenuItem" component={AddMenuItemScreen} options={{ title: 'Add Menu Item' }} />
            <Stack.Screen name="OrderList" component={OrderListScreen} options={{ title: 'Orders' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
            <Stack.Screen name="UserList" component={UserListScreen} options={{ title: 'All Registered Users' }} />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Bookings' }} />
            <Stack.Screen name="HotelDetails" component={HotelDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EmailHub" component={EmailHubScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RestaurantHub" component={RestaurantHubScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TableReservation" component={TableReservationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MyReservations" component={MyReservationsScreen} options={{ headerShown: false }} />





          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
