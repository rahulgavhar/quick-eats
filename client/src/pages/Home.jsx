import { useSelector } from "react-redux";
import DeliveryBoyDashboard from "../components/DeliveryBoyDashboard.jsx";
import OwnerDashboard from "../components/OwnerDashboard.jsx";
import UserDashboard from "../components/UserDashboard.jsx";

const Home = ({ activePopup, popupShown, setActivePopup, setPopupShown }) => {
  const { userData } = useSelector((state) => state.user);

  return (
    <div>
      {userData.role === "user" && (
        <UserDashboard
          activePopup={activePopup}
          popupShown={popupShown}
          setActivePopup={setActivePopup}
          setPopupShown={setPopupShown}
        />
      )}
      {userData.role === "owner" && (
        <OwnerDashboard
          activePopup={activePopup}
          popupShown={popupShown}
          setActivePopup={setActivePopup}
          setPopupShown={setPopupShown}
        />
      )}
      {userData.role === "deliveryBoy" && (
        <DeliveryBoyDashboard
          activePopup={activePopup}
          popupShown={popupShown}
          setActivePopup={setActivePopup}
          setPopupShown={setPopupShown}
        />
      )}
    </div>
  );
};

export default Home;
