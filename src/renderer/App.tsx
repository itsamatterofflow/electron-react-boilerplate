/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import './styles/App.scss';
import ColorScheme from './ColorScheme'; // Import the reusable ColorScheme component
import icons from './icons'; // Import the icons object
import { v4 as uuidv4 } from 'uuid'; // Import uuid

// Type definition for a color scheme
interface Color {
  hex: string;
  locked: boolean;
  unlocked?: boolean;
}

interface Scheme {
  id: string; // Change id type to string
  name: string;
  colors: Color[];
  locked: boolean;
}
interface ColorSchemeProps {
  schemeIndex: number;
  scheme: Scheme;
  setColorSchemes: React.Dispatch<React.SetStateAction<Scheme[]>>;
  colorSchemes: Scheme[];
  deleteScheme: (id: string) => void;
}

const generateRandomColorName = () => {
  const adjectives = [
    'Vibrant',
    'Mystic',
    'Fiery',
    'Bold',
    'Ethereal',
    'Electric',
    'Dusky',
    'Radiant',
    'Shimmering',
    'Cosmic',
    'Fiery',
    'Frosty',
    'Sunset',
    'Twilight',
    'Lush',
    'Blissful',
    'Neon',
    'Velvety',
    'Golden',
    'Royal',
    'Misty',
    'Snowy',
  ];

  const themes = [
    'Blues',
    'Purples',
    'Reds',
    'Greens',
    'Yellows',
    'Pinks',
    'Oranges',
    'Shades',
    'Tones',
    'Hues',
    'Lights',
    'Dreams',
    'Waves',
    'Squad',
    'Rush',
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const theme = themes[Math.floor(Math.random() * themes.length)];

  return `${adjective} ${theme}`;
};

// Helper function to generate a random color
const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`;

// Helper function to create a new scheme with random colors
const createNewScheme = (): Scheme => ({
  id: uuidv4(), // Use uuid to generate a unique id
  name: generateRandomColorName(),
  colors: new Array(4)
    .fill(null)
    .map(() => ({ hex: getRandomColor(), locked: false })),
  locked: false, // Add default value for locked
});

function App() {
  // Load color schemes from localStorage on initial load or use a default
  const loadColorSchemesFromStorage = (): Scheme[] => {
    const storedSchemes = localStorage.getItem('colorSchemes');
    if (storedSchemes) {
      const parsedSchemes = JSON.parse(storedSchemes);
      // Check if the stored schemes are valid and an array
      if (Array.isArray(parsedSchemes) && parsedSchemes.length > 0) {
        console.log('Loaded color schemes from localStorage:', parsedSchemes); // Debug log
        // Return the stored schemes as they are without modifying their IDs
        return parsedSchemes;
      }
    }
    // If no schemes are found or if the array is empty, add a default scheme
    const defaultScheme = createNewScheme();
    localStorage.setItem('colorSchemes', JSON.stringify([defaultScheme])); // Save to localStorage
    return [defaultScheme]; // Return default scheme
  };

  const [colorSchemes, setColorSchemes] = useState<Scheme[]>(
    loadColorSchemesFromStorage,
  );

  // Save color schemes to localStorage whenever they are updated
  const saveColorSchemesToLocalStorage = (newSchemes: Scheme[]) => {
    localStorage.setItem('colorSchemes', JSON.stringify(newSchemes));
  };

  // On component mount, load color schemes from localStorage
  useEffect(() => {
    const savedSchemes = JSON.parse(
      localStorage.getItem('colorSchemes') || '[]',
    );
    if (savedSchemes.length > 0) {
      setColorSchemes(savedSchemes); // Set the color schemes if they exist in localStorage
    }
  }, []);

  const addNewScheme = () => {
    const newScheme = createNewScheme(); // Generate a new scheme
    const updatedSchemes = [...colorSchemes, newScheme];
    setColorSchemes(updatedSchemes); // Update state with the new scheme
    saveColorSchemesToLocalStorage(updatedSchemes); // Save to localStorage
  };

  const deleteScheme = (id: string) => {
    const updatedSchemes = colorSchemes.filter((scheme) => scheme.id !== id);
    setColorSchemes(updatedSchemes);
    saveColorSchemesToLocalStorage(updatedSchemes);
  };

  return (
    <div className="page-wrap">
      <header className="page-header">
        <h2>Color Picker</h2>

        <div className="button-group">
          <button type="button" onClick={addNewScheme}>
            <img src={icons.add} alt="Add scheme" />
          </button>
        </div>
      </header>

      <div className="color-schemes-container">
        {colorSchemes.length > 0 ? (
          colorSchemes.map((scheme, index) => (
            <div key={scheme.id}>
              <ColorScheme
                scheme={scheme}
                deleteScheme={deleteScheme}
                schemeIndex={index} // Pass the index here
                setColorSchemes={setColorSchemes}
                colorSchemes={colorSchemes}
              />
            </div>
          ))
        ) : (
          <p>No color schemes available</p>
        )}
      </div>
    </div>
  );
}

export default App;
