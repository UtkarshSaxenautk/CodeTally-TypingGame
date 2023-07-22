import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { useDarkMode } from '../DarkModeContext';
import { useNavigate, useParams } from 'react-router-dom';
import { LevelContext, NameContext } from '../GameContext';
import { Easy, Medium, Hard } from '../assets/Data';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:5000'); // Replace 'http://localhost:5000' with your server URL

const MultiplayerTypingTestGame = () => {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [index, setIndex] = useState(0);
  const [startTimer, setStartTimer] = useState(5); // Timer to start the game
  const [typingTimer, setTypingTimer] = useState(60); // Timer for typing the paragraph
  const [isGameStarted, setIsGameStarted] = useState(false);
  const { level, setLevel } = useContext(LevelContext);
  const { isDarkMode } = useDarkMode();
  const { roomId } = useParams(); // Get the roomId and index from the URL
  const [roomData, setRoomData] = useState(null); // State to store room data
  const [scoreboard, setScoreboard] = useState([]); // State to store scoreboard
  const [wpm, setWpm] = useState(0); // State to store WPM
  const [accuracy, setAccuracy] = useState(100); // State to store accuracy
  const [percentageCompleted, setPercentageCompleted] = useState(0);
  const { username } = useContext(NameContext) // State to store percentage completion
  const [winner, setWinner] = useState('');
  const navigate = useNavigate()

  // Fetch Room Data
  useEffect(() => {
    // Get the latest room data from the server
    socket.emit('get-room-data', { roomId });

    // Listen for room data updates from the server
    socket.on('room-data', (data) => {
      setRoomData(data);
      setIndex(data.index);
      setText(getSampleTextByDifficulty(data.difficulty, data.index));
    });

    // Listen for scoreboard updates from the server
    socket.on('scoreboard-update', (data) => {
      setScoreboard(data);
    });

    // Cleanup the socket connection when component unmounts
    return () => {
      socket.off('room-data');
      socket.off('scoreboard-update');
    };
  }, []);

  useEffect(() => {
   
    if (!endTime) {
      // Calculate WPM, accuracy, and percentage completed when the game is running
      const timeInSeconds = (Date.now() - startTime) / 1000;
      const wordsTyped = userInput.trim().split(/\s+/).length;
      const errors = calculateErrors(text, userInput);
      const netWpm = Math.max(Math.round(((wordsTyped - errors) / timeInSeconds) * 60), 0);
      setWpm(netWpm);

      const correctWordCount = calculateCorrectWords(text, userInput);
      //const totalWords = text.trim().split(/\s+/).length;
      const calculatedAccuracy = (correctWordCount / wordsTyped) * 100;
      setAccuracy(calculatedAccuracy);

      const calculatedPercentage = (userInput.length / text.length) * 100;
      setPercentageCompleted(calculatedPercentage);
      console.log(wpm)
      socket.emit('update-score', {
        roomId,
        username,
        clientId: socket.id,
        wpm: wpm,
        accuracy,
        percentageCompleted,
      })

    } 
    
  }, [isGameStarted, typingTimer, endTime, startTime, text, userInput]);

  
  useEffect(() => {
    if (!endTime) {
      // Listen for 'scoreboard-update' event from the server
      console.log("get scoreboard")
      socket.on('scoreboard-update', ({ scoreboard }) => {
        // Update the scoreboard state with the received data
        setScoreboard(scoreboard);
        console.log(scoreboard)
        if (scoreboard.length > 0) {
        setWinner(scoreboard[0].username);
      }
      });
 

      // Clean up the socket connection when the component unmounts
      return () => {
        socket.off('scoreboard-update');
      };
    }
  }, []);

  const calculateErrors = (originalText, typedText) => {
    const originalWords = originalText.trim().split(/\s+/);
    const typedWords = typedText.trim().split(/\s+/);

    let errors = 0;
    typedWords.forEach((word, index) => {
      if (word !== originalWords[index]) {
        errors++;
      }
    });

    return errors;
  };

  const calculateCorrectWords = (originalText, typedText) => {
    const originalWords = originalText.trim().split(/\s+/);
    const typedWords = typedText.trim().split(/\s+/);

    let correctWordCount = 0;
    typedWords.forEach((word, index) => {
      if (word === originalWords[index]) {
        correctWordCount++;
      }
    });

    return correctWordCount;
  };

  const getSampleTextByDifficulty = (difficulty, index) => {
    switch (difficulty) {
      case 'easy':
        return Easy[index];
      case 'medium':
        return Medium[index];
      case 'hard':
        return Hard[index];
      default:
        return '';
    }
  };

  // Start the game after the start timer
  useEffect(() => {
    if (startTimer > 0) {
      const interval = setInterval(() => {
        setStartTimer((prevTimer) => Math.max(prevTimer - 1, 0));
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setIsGameStarted(true);
      setStartTime(new Date());
    }
  }, [startTimer]);

  // Update user input as they type the text
  const handleInputChange = (e) => {
    const { value } = e.target;
    setUserInput(value);
  };

  

  // Start the typing timer after the start timer ends
  useEffect(() => {
    if (isGameStarted && startTimer === 0) {
      const interval = setInterval(() => {
        setTypingTimer((prevTimer) => Math.max(prevTimer - 1, 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isGameStarted, startTimer]);

 

  // Render Test Area
  return (
    <div className={`flex  justify-between items-center h-screen ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={` max-w-[600px] mx-auto my-8 p-4 border rounded-lg shadow ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <h1 className={`text-2xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Typing Test
        </h1>
        <div className={`h-40 overflow-y-scroll bg-gray-100 p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          {text && text.split(' ').map((word, idx) => {
            const typedWord = userInput.trim().split(/\s+/)[idx] || '';
            const isCorrect = typedWord === word;
            const isVisited = idx < userInput.trim().split(/\s+/).length;
            const color = isCorrect ? 'green' : isVisited ? 'red' : 'gray';

            return (
              <span key={idx} style={{ color }}>
                {word}{' '}
              </span>
            );
          })}
        </div>
        <textarea
          className={`w-full p-2 border rounded mb-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
          rows="5"
          value={userInput}
          onChange={handleInputChange}
          disabled={!isGameStarted || (endTime && typingTimer === 0)}
          placeholder="Start typing here..."
          style={{ caretColor: 'transparent' }}
        />
        <div className="text-center">
          {endTime || typingTimer === 0 ? (
            <p className="text-green-600 font-bold">Time: {((endTime || 0) - startTime) / 1000 < 0 ? 60 : ((endTime || 0) - startTime) / 1000} seconds</p>
          ) : startTimer > 0 ? (
            <p className="text-blue-600 font-bold">Preparing to start: {startTimer}s</p>
          ) : (
            <p className="text-blue-600 font-bold">Time Remaining: {typingTimer}s</p>
          )}
          <p className="text-gray-400">Net WPM: {wpm}</p>
          <p className="text-gray-400">
            Percentage Completed: {percentageCompleted > 100 ? 100 : percentageCompleted.toFixed(2)}%
          </p>
          <p className="text-gray-400">Accuracy: {accuracy.toFixed(2)}%</p>
        </div>
      </div>
      {isGameStarted && endTime - startTime > 0 && <p className="text-blue-600 font-bold">Game in Progress...</p>}
      
        <div className={`max-w-[600px] mx-auto my-8 p-4 border rounded-lg shadow ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Scoreboard:</h2>
          <div className="text-center">
            <table className="table-auto mx-auto">
              <thead>
              <tr>
                  <th className='px-4 py-2'>Rank</th>
                  <th className="px-4 py-2">Username</th>
                  <th className="px-4 py-2">WPM</th>
                </tr>
              </thead>
              <tbody>
                {scoreboard && scoreboard.map((score, idx) => (
                  <tr key={idx}>
                    <td className='border px-4 py-2'>{idx + 1}</td>
                    <td className="border px-4 py-2">{score.username}</td>
                    <td className="border px-4 py-2">{score.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      <ToastContainer/>
    </div>
  );
};

export default MultiplayerTypingTestGame;
