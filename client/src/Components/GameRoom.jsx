import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { NameContext } from '../GameContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDarkMode } from '../DarkModeContext';

const GameRoom = () => {
  const { difficulty, roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [roomLoaded, setRoomLoaded] = useState(false);
  const socketRef = useRef(null);
  const { username } = useContext(NameContext);
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    socketRef.current = newSocket;
    newSocket.emit('join-room', { roomId, username });

    newSocket.once('room-joined', (data) => {
      if (data.usernameExists) {
        console.error('Username already exists in the room');
        toast.error("Username already exists in the room. Please use a different username or enter a different room.");
      } else {
        setRoomLoaded(true);
      }
    });

    newSocket.on('room-data', (data) => {
      setRoom(data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, username]);

  useEffect(() => {
    if (roomLoaded) {
      const newRoomSocket = io('http://localhost:5000');
      newRoomSocket.emit('join-room-chat', { roomId });

      newRoomSocket.on('chat-message', (message) => {
        // Handle chat messages, if required
      });

      const interval = setInterval(() => {
        newRoomSocket.emit('get-room-data', { roomId });
      }, 5000);

      newRoomSocket.on('room-data', (data) => {
        setRoom(data);
      });

      return () => {
        clearInterval(interval);
        newRoomSocket.disconnect();
      };
    }
  }, [roomLoaded, roomId]);

  useEffect(() => {
    if (room) {
      console.log(room);
      if (room.players.length === 4) {
        toast.info("Game starting in a few seconds", { autoClose: 3000 });
        setTimeout(() => {
          navigate(`/start-mult/${roomId}`);
        }, 8000);
      } 
    }
  }, [room, roomId, navigate]);

  return (
    <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      {room ? (
        <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} shadow-lg rounded-lg p-6 w-96`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Room ID: {room.roomId}</h2>
          <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Players in the Room:</h3>
          <ul className="list-disc ml-8">
            {room.players.map((player) => (
              <li key={player.username} className={`text-${isDarkMode ? 'gray-300' : 'gray-800'}`}>
                {player.username}
              </li>
            ))}
          </ul>
          <p className='text-gray-500'>Waiting for users to join......</p>
        </div>
      ) : (
        <p className={`text-${isDarkMode ? 'gray-300' : 'gray-800'}`}>Loading...</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default GameRoom;
