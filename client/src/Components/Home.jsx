import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../DarkModeContext';
import Popup from './Popup';

const Home = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
   const [showPopup, setShowPopup] = useState(false);
  const containerStyle = {
    backgroundImage: "url('')", // Replace with the actual image path
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc',
    color: isDarkMode ? '#f7fafc' : '#1a202c',
    };
   
  
  // Function to open the popup
  const openPopup = () => {
    setShowPopup(true);
  };

  // Function to close the popup
  const closePopup = () => {
    setShowPopup(false);
    };
    
    const handleClick = () => {
        console.log("pop up should work")
        setShowPopup(true);
    }

    return (
        <>
      <Popup isOpen={showPopup} onClose={closePopup}  />
      <div className="flex flex-col justify-center items-center h-screen" style={containerStyle}>
          
      <h1 className="text-4xl font-bold mb-8">Choose Game Option</h1>
      <div className="flex flex-col gap-4">
        <div className={`flex items-center justify-between bg-white py-4 px-8 rounded-lg shadow-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
          <div className="text-xl font-bold text-gray-600">Single Player</div>
          <button
            onClick={() => navigate('/single-game')}
            className={`ml-4 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-200`}
          >
            Start
          </button>
        </div>
        <div className={`flex items-center justify-between bg-white py-4 px-8 rounded-lg shadow-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
          <div className="text-xl font-bold text-gray-600">Multiplayer Player</div>
          <button
            onClick={handleClick}
            className={`ml-4 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-200`}
          >
            Start
          </button>
        </div>
      </div>
      
            </div>
            </>
  );
};

export default Home;
