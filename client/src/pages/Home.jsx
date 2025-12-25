import React from 'react'
import { useSelector } from "react-redux";
import DeliveryBoy from '../components/DeliveryBoy.jsx';
import OwnerDashboard from '../components/OwnerDashboard.jsx';
import UserDashboard from '../components/UserDashboard.jsx';

const Home = () => {

    const { userData } = useSelector((state) => state.user);
    
  return (
    <div>
      {userData.role === 'user' && <UserDashboard />}
      {userData.role === 'owner' && <OwnerDashboard />}
      {userData.role === 'deliveryBoy' && <DeliveryBoy />}
    </div>
  )
}

export default Home
