// App.jsx

import "./App.css";
import TypingTestGame from "./Components/Game";
import Home from "./Components/Home";
import { LevelContext, NameContext } from "./GameContext";
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SinglePlayer from "./Components/SinglePlayer";
import Multiplayer from "./Components/Multiplayer";
import { DarkModeProvider, useDarkMode } from "./DarkModeContext";
import RoomList from "./Components/RoomList"; // Updated import
import GameRoom from "./Components/GameRoom"; // Updated import
import MultiplayerTypingTestGame from "./Components/MutlGame";

const ToggleButton = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="absolute top-4 right-4">
      <label className="flex items-center cursor-pointer">
        <input type="checkbox" className="form-checkbox" checked={isDarkMode} onChange={toggleDarkMode} />
        <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Dark Mode</span>
      </label>
    </div>
  );
};

function App() {
  const [level, setLevel] = useState("easy");
  const [username, setUsername] = useState('');
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <ToggleButton />
        <NameContext.Provider value={{username , setUsername}}>
        <LevelContext.Provider value={{ level, setLevel }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/single-game" element={<SinglePlayer />} />
            <Route path="/multi-game" element={<Multiplayer />} />
            <Route path="/start" element={<TypingTestGame />} />
            <Route path="/room-list/:difficulty" element={<RoomList />} /> {/* Updated route */}
              <Route path="/room/:difficulty/:roomId" element={<GameRoom />} /> {/* Updated route */}
              <Route path="/start-mult/:roomId" element={<MultiplayerTypingTestGame/>} />
          </Routes>
          </LevelContext.Provider>
          </NameContext.Provider>
      </DarkModeProvider>
    </BrowserRouter>
  );
}

export default App;
