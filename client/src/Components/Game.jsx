import React, { useState, useEffect, useContext } from 'react';
import { Easy, Medium, Hard } from '../assets/Data';
import { useDarkMode } from '../DarkModeContext';
import { LevelContext } from '../GameContext';

const TypingTestGame = () => {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [percentageCompleted, setPercentageCompleted] = useState(0);
  const [timer, setTimer] = useState(60);
  const [wpm, setWpm] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [sampleText, setSampleText] = useState(getRandomStringFromArray(Hard));
  const { isDarkMode } = useDarkMode();

  function getRandomStringFromArray(array) {
    if (!Array.isArray(array) || array.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }

  const { level, setLevel } = useContext(LevelContext);
  useEffect(() => {
    if (level === 'easy') {
      setSampleText(getRandomStringFromArray(Easy));
    } else if (level === 'medium') {
      setSampleText(getRandomStringFromArray(Medium));
    } else {
      setSampleText(getRandomStringFromArray(Hard));
    }
    let easy_size = 0;
    for (let i = 0; i < Easy.length; i++){
      easy_size += Easy[i].length;
    }
    console.log("easy" ,easy_size / 5);
    let medium_size = 0;
    for (let i = 0; i < Medium.length; i++){
      medium_size += Medium[i].length;
    }
    console.log("medium", medium_size / 5);
    let hard_size = 0;
    for (let i = 0; i < Hard.length; i++){
      hard_size += Hard[i].length;
    }
    console.log("hard" , hard_size/5)
  }, [level]);

  useEffect(() => {
    setText(sampleText);
  }, [sampleText]);

  useEffect(() => {
    if (isGameStarted && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => Math.max(prevTimer - 1, 0));
      }, 1000);

      return () => clearInterval(interval);
    }

    if (timer === 0 && !endTime) {
      setEndTime(new Date());
      setIsGameStarted(false);
      setTimer(0);
    }
  }, [isGameStarted, timer, endTime]);

  useEffect(() => {
    if (endTime && percentageCompleted < 100) {
      const timeInSeconds = (endTime - startTime) / 1000;
      const wordsTyped = userInput.trim().split(/\s+/).length;
      const errors = calculateErrors(text, userInput);
      const netWpm = Math.max(Math.round(((wordsTyped - errors) / timeInSeconds) * 60), 0);
      setWpm(netWpm);
    }
  }, [endTime, percentageCompleted, startTime, text, userInput]);

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

  const handleInputChange = (e) => {
    const { value } = e.target;
    setUserInput(value);

    if (!isGameStarted && value !== '') {
      setStartTime(new Date());
      setIsGameStarted(true);
    }

    if (value === text) {
      setEndTime(new Date());
      setIsGameStarted(false);
      setTimer(0);
    }

    // Calculate WPM, accuracy, and percentage completed in real-time
    const trimmedUserInput = value.trim();
    setWordCount(trimmedUserInput.split(/\s+/).length);

    const correctWords = text.trim().split(/\s+/);
    const typedWords = trimmedUserInput.split(/\s+/);

    let correctWordCount = 0;
    typedWords.forEach((word, index) => {
      if (word === correctWords[index]) {
        correctWordCount++;
      }
    });

    setAccuracy((correctWordCount / typedWords.length) * 100);
    setPercentageCompleted((trimmedUserInput.length / text.length) * 100);

    // Calculate and update Net WPM in real-time
    if (isGameStarted && percentageCompleted < 100) {
      const timeInSeconds = (Date.now() - startTime) / 1000;
      const wordsTyped = trimmedUserInput.trim().split(/\s+/).length;
      const errors = calculateErrors(text, trimmedUserInput);
      const netWpm = Math.max(Math.round(((wordsTyped - errors) / timeInSeconds) * 60), 0);
      setWpm(netWpm);
    }
  };

  const handleTextAreaClick = (e) => {
    if (!isGameStarted || endTime) {
      e.preventDefault();
    }
  };

  const handleCopy = (e) => {
    e.preventDefault();
  };

  const handlePaste = (e) => {
    e.preventDefault();
  };

  const isCorrectWord = (typedWord, correctWord) => typedWord === correctWord;

  return (
    <div className={`flex flex-col justify-center items-center h-screen ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`max-w-[600px] mx-auto my-8 p-4 border rounded-lg shadow ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <h1 className={`text-2xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Typing Test</h1>
        <div
          className={`h-40 overflow-y-scroll bg-gray-100 p-4 rounded-lg mb-4 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}
         
        >
          {text.split(' ').map((word, index) => {
            const typedWord = userInput.trim().split(/\s+/)[index] || '';
            const isCorrect = isCorrectWord(typedWord, word);
            const isVisited = index < userInput.trim().split(/\s+/).length;
            const color = isCorrect ? 'green' : isVisited ? 'red' : 'gray';

            return (
              <span key={index} style={{ color }}>
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
          onClick={handleTextAreaClick}
          disabled={endTime || timer === 0}
          placeholder="Start typing here..."
          style={{ caretColor: 'transparent' }}
        />
        <div className="text-center">
          {endTime || timer === 0 ? (
            <p className="text-green-600 font-bold">Time: {((endTime || 0) - startTime) / 1000 > 60 ? 60 : ((endTime || 0) - startTime) / 1000} seconds</p>
          ) : (
            <p className="text-blue-600 font-bold">Time Remaining: {timer}s</p>
          )}
          <p className="text-gray-400">Net WPM: {wpm}</p>
          <p className="text-gray-400">
            Percentage Completed: {percentageCompleted > 100 ? 100 : percentageCompleted.toFixed(2)}%
          </p>
          <p className="text-gray-400">Accuracy: {accuracy.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
};

export default TypingTestGame;
