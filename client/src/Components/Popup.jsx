import React, { useContext, useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { NameContext } from '../GameContext';
import { useDarkMode } from '../DarkModeContext'; // Import the useDarkMode hook or access isDarkMode prop from DarkModeContext

Modal.setAppElement('#root');

const Popup = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { username, setUsername } = useContext(NameContext);
  const { isDarkMode } = useDarkMode(); // Use the useDarkMode hook or access isDarkMode prop

  const handlePlayAsGuest = () => {
    setUsername(name);
      navigate('/multi-game');
      
  };

  const customStyles = {
    content: {
      top: '50%', // Move the modal to 50% from the top of the screen
      left: '50%', // Move the modal to 50% from the left of the screen
      right: 'auto', // Set the right position to 'auto' to center horizontally
      bottom: 'auto', // Set the bottom position to 'auto' to center vertically
      transform: 'translate(-50%, -50%)', // Translate the modal to center it
      backgroundColor: isDarkMode ? '#1a202c' : 'white', // Apply dark mode background color
      color: isDarkMode ? '#f7fafc' : 'black', // Apply dark mode text color
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles} // Use the custom styles here
    >
      <div className="p-6">
        <h3 className="text-2xl mb-4">Play as Guest</h3>
        <input
          type="text"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 py-2 px-4 text-base bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
          style={{
            backgroundColor: isDarkMode ? '#2d3748' : 'white', // Apply dark mode input background color
            color: isDarkMode ? '#f7fafc' : 'black', // Apply dark mode input text color
          }}
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 py-2 px-4 text-base bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
          style={{
            backgroundColor: isDarkMode ? '#2d3748' : 'white', // Apply dark mode input background color
            color: isDarkMode ? '#f7fafc' : 'black', // Apply dark mode input text color
          }}
        />
        
        <button
          className={`w-full mt-4 ${
            isDarkMode ? 'bg-blue-800' : 'bg-blue-500'
          } rounded-lg hover:bg-blue-700 py-2 px-4 text-base font-semibold text-white transition duration-300 ease-in-out focus:outline-none focus:ring focus:ring-blue-200`}
          onClick={handlePlayAsGuest}
        >
          Play as Guest
        </button>
      </div>
    </Modal>
  );
};

export default Popup;
