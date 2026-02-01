import { useState, useCallback } from "react";
import "./App.css";

function App() {
  const [length, setLength] = useState(8);
  const [numbersAllowed, setNumbersAllowed] = useState(false);
  const [symbolsAllowed, setSymbolsAllowed] = useState(false);
  const [password, setPassword] = useState("");
  const passwordGenerator = useCallback(() => {
    let pass = "";
    let str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (numbersAllowed) str += "012345689";
    if (symbolsAllowed) str += "!@#$%^&*";

    for (let index = 0; index < length; index++) {
      let char = Math.floor(Math.random() * str.length);
      pass += str.charAt(char);
    }
    setPassword(pass);
  }, [length, numbersAllowed, symbolsAllowed, setPassword]);
  const copyPasswordToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    alert("Password copied to clipboard!");
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col gap-4 p-6 bg-gray-800 w-1/2 max-w-lg rounded-lg shadow-lg text-white">
        <h1 className="text-2xl font-bold text-center">Password Generator</h1>

        {/* Password Output + Copy Button */}
        <div className="flex">
          <input
            type="text"
            placeholder="Generated password"
            readOnly
            value={password}
            className="w-full p-2 rounded bg-gray-900 text-white text-center"
          />
          <button
            className="bg-gray-700 hover:bg-gray-600 px-4 rounded"
            onClick={copyPasswordToClipboard}
          >
            Copy
          </button>
        </div>

        {/* Length */}
        <div className="flex items-center justify-between">
          <label className="text-sm">Length: ({length})</label>
          <input
            type="range"
            min="6"
            max="100"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-2/3 cursor-pointer"
          />
        </div>

        {/* Options */}
        <div className="flex justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked={numbersAllowed}
              id="numberInput"
              onChange={() => {
                setNumbersAllowed((prev) => !prev);
              }}
            />
            Numbers
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked={symbolsAllowed}
              id="SymbolInput"
              onChange={() => {
                setSymbolsAllowed((prev) => !prev);
              }}
            />
            Symbols
          </label>
        </div>

        {/* Generate Button */}
        <button
          className="bg-blue-600 hover:bg-blue-700 transition rounded py-2 font-semibold"
          onClick={passwordGenerator}
        >
          Generate Password
        </button>
      </div>
    </div>
  );
}

export default App;
