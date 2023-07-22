import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { NameContext } from '../GameContext';
import { useDarkMode } from '../DarkModeContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RoomCard = ({ room, handleJoinRoom }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`bg-${isDarkMode ? 'gray-700' : 'white'} p-4 rounded-md shadow-md w-full h-full flex flex-col justify-between`}>
      <div>
        <p className={`text-lg font-semibold text-${isDarkMode ? 'white' : 'black'}`}>Room ID: {room.roomId}</p>
        <p className={`text-sm text-${isDarkMode ? 'gray-400' : 'gray-600'}`}>
          ({room.players.length}/4 players)
        </p>
        <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {room.players.map((player) => player.username).join(', ')}
        </p>
      </div>
      <button
        onClick={() => handleJoinRoom(room.roomId)}
        className={`w-full px-4 py-2 mt-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${
          isDarkMode ? 'text-black' : ''
        }`}
        disabled={room.players.length === 4}
      >
        Join Room
      </button>
    </div>
  );
};

const RoomList = () => {
  const { difficulty } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const { username } = useContext(NameContext);
  const { isDarkMode } = useDarkMode();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('get-rooms', { difficulty });

    newSocket.on('room-list', (data) => {
      const updatedRooms = data.rooms.map((room) => ({
        ...room,
        players: room.players.map((player) => ({
          ...player,
          username: player.clientId === newSocket.id ? username : player.username,
        })),
      }));
      setRooms(updatedRooms);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [difficulty, username]);

  const handleCreateRoom = () => {
    socket.emit('create-room', { difficulty, username });

    socket.once('room-created', ({ roomId }) => {
      if (roomId === "no") {
        toast("max rooms are formed join one of them")
      } else {
        navigate(`/room/${difficulty}/${roomId}`);
      }
    });
  };

  const handleJoinRoom = (roomId) => {
    console.log('join room : ', roomId + ' ' + username);
    navigate(`/room/${difficulty}/${roomId}`);
  };

  const waitingRooms = rooms.filter((room) => room.players.length < 4);
  const startedRooms = rooms.filter((room) => room.players.length === 4);

  return (
    <div className={`container mx-auto min-h-screen min-w-screen bg-${isDarkMode ? 'gray-800' : 'white'}`}>
      <div className="container mx-auto py-8">
        <h2 className={`text-2xl font-bold text-center mb-4 text-${isDarkMode ? 'white' : 'black'}`}>
          Rooms with {difficulty} Difficulty
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {waitingRooms.length > 0 ? (
            waitingRooms.map((room) => (
              <div key={room.roomId} className="w-full">
                <RoomCard room={room} handleJoinRoom={handleJoinRoom} />
              </div>
            ))
          ) : (
            <p className={`text-gray-600 ${isDarkMode ? 'text-white' : 'text-black'}`}>No waiting rooms available.</p>
          )}
        </div>

        {startedRooms.length > 0 && (
          <div className="mt-8">
            <h3 className={`text-xl font-semibold mb-2 text-${isDarkMode ? 'white' : 'black'}`}>Started Rooms:</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {startedRooms.map((room) => (
                <div key={room.roomId} className="w-full">
                  <RoomCard room={room} handleJoinRoom={handleJoinRoom} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleCreateRoom}
            className={`px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 ${
              isDarkMode ? 'text-black' : ''
            }`}
          >
            Create Room
          </button>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default RoomList;
