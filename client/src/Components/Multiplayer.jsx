import React, { useContext } from 'react';
import { LevelContext } from '../GameContext';
import { useDarkMode } from '../DarkModeContext';
import { useNavigate } from 'react-router-dom';

const Multiplayer = () => {
  const { level, setLevel } = useContext(LevelContext);
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();


  const buttonStyle = `py-2 px-4 rounded-lg hover:bg-${isDarkMode ? 'white' : 'black'} ${
    isDarkMode ? 'text-black' : 'text-white'
  }`;

  const handleDifficultyClick = (difficulty) => {
    setLevel(difficulty);
    navigate(`/room-list/${difficulty}`); // Navigate to the RoomList page for the selected difficulty
  };

  return (
    <div className={`flex justify-center items-center h-screen ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`max-w-md mx-auto p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-lg`}>
        <h2 className={`text-2xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Select Difficulty Level
        </h2>
        <div className="flex flex-col gap-4">
          <button onClick={() => handleDifficultyClick('easy')} className={`${buttonStyle} bg-blue-500 focus:ring focus:ring-blue-200`}>
            Easy
          </button>
          <button onClick={() => handleDifficultyClick('medium')} className={`${buttonStyle} bg-green-500 focus:ring focus:ring-green-200`}>
            Medium
          </button>
          <button onClick={() => handleDifficultyClick('hard')} className={`${buttonStyle} bg-red-500 focus:ring focus:ring-red-200`}>
            Hard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Multiplayer;
