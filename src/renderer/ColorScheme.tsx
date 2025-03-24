import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Toast from './Toast'; // Import the Toast component
import icons from './icons'; // Import the icons object

// Function to calculate luminance (brightness) of a hex color
const getLuminance = (hex: string): number => {
  const r = parseInt(hex.substring(1, 3), 16) / 255;
  const g = parseInt(hex.substring(3, 5), 16) / 255;
  const b = parseInt(hex.substring(5, 7), 16) / 255;

  const a = [r, g, b].map((x) =>
    x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4,
  );

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// Function to determine if the color is light or dark
const getTextColor = (hex: string): string => {
  return getLuminance(hex) > 0.5 ? 'black' : 'white';
};

const getRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`;
};

interface Color {
  hex: string;
  locked: boolean;
  unlocked?: boolean;
}

interface Scheme {
  id: number;
  name: string;
  colors: Color[];
  locked: boolean;
}

interface ColorSchemeProps {
  schemeIndex: number;
  scheme: Scheme;
  setColorSchemes: React.Dispatch<React.SetStateAction<Scheme[]>>;
  colorSchemes: Scheme[];
  deleteScheme: (id: number) => void;
}

function ColorScheme({
  schemeIndex,
  scheme,
  setColorSchemes,
  colorSchemes,
  deleteScheme,
}: ColorSchemeProps) {
  useEffect(() => {
    const savedSchemes = localStorage.getItem('colorSchemes');
    if (savedSchemes) {
      setColorSchemes(JSON.parse(savedSchemes));
    }
  }, [setColorSchemes]);
  const [schemeName, setSchemeName] = useState(scheme.name);
  const [toastMessage, setToastMessage] = useState('');

  const colors = Array.isArray(scheme.colors) ? scheme.colors : [];

  const saveColorSchemesToLocalStorage = (newSchemes: Scheme[]) => {
    // Save the full list of colors without filtering out unlocked ones
    localStorage.setItem('colorSchemes', JSON.stringify(newSchemes));
  };

  // Retrieve schemes from localStorage on initial load
  useEffect(() => {
    const savedSchemes = localStorage.getItem('colorSchemes');
    if (savedSchemes) {
      setColorSchemes(JSON.parse(savedSchemes));
    }
  }, [setColorSchemes]);

  const toggleLock = (colorIndex: number) => {
    // Don't allow the toggle action if the scheme is locked
    if (scheme.locked) return;

    const updatedSchemes = colorSchemes.map((s, index) => {
      if (index === schemeIndex) {
        const updatedColors = s.colors.map((color, idx) => {
          if (idx === colorIndex) {
            const updatedColor = { ...color, locked: !color.locked };
            return updatedColor; // Update only the clicked color's lock state
          }
          return color;
        });

        return { ...s, colors: updatedColors }; // Return updated scheme with colors
      }
      return s; // Return scheme as-is if not the correct index
    });

    setColorSchemes(updatedSchemes);
    saveColorSchemesToLocalStorage(updatedSchemes);
  };

  const updateSchemeName = (newName: string) => {
    const updatedSchemes = colorSchemes.map((s, index) =>
      index === schemeIndex ? { ...s, name: newName } : s,
    );
    setColorSchemes(updatedSchemes);
    saveColorSchemesToLocalStorage(updatedSchemes);
  };

  const addColor = () => {
    if (scheme.locked) return;

    const updatedSchemes = colorSchemes.map((s, index) => {
      if (index !== schemeIndex) return s; // Only update the target scheme

      // Here we add a new color to the scheme
      return {
        ...s,
        colors: [
          ...s.colors, // Preserve existing colors
          { hex: getRandomColor(), locked: false }, // Add the new color
        ],
      };
    });

    // Update the state with the modified color schemes
    setColorSchemes(updatedSchemes);
    saveColorSchemesToLocalStorage(updatedSchemes); // Make sure to save to localStorage
    setToastMessage('Color added!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const removeColor = (colorIndex: number) => {
    if (scheme.locked || colors[colorIndex].locked) return;

    const updatedSchemes = colorSchemes.map((s, index) =>
      index === schemeIndex
        ? {
            ...s,
            colors: s.colors.filter((_, idx) => idx !== colorIndex),
          }
        : s,
    );

    setColorSchemes(updatedSchemes);
    saveColorSchemesToLocalStorage(updatedSchemes);
    setToastMessage('Color removed!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setToastMessage(`Copied: ${hex}`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const removeScheme = () => {
    deleteScheme(scheme.id);
    setToastMessage('Color scheme removed!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const toggleSchemeLock = () => {
    const updatedSchemes = colorSchemes.map((s, index) => {
      if (index === schemeIndex) {
        return { ...s, locked: !s.locked };
      }
      return s;
    });

    setColorSchemes(updatedSchemes);
    saveColorSchemesToLocalStorage(updatedSchemes);
    setToastMessage(scheme.locked ? 'Scheme Unlocked!' : 'Scheme Locked!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const refreshSchemes = () => {
    const updatedSchemes = colorSchemes.map((s, index) => {
      if (index === schemeIndex) {
        const updatedColors = s.colors.map((color) => {
          // Only refresh non-locked colors
          if (!color.locked) {
            return { ...color, hex: getRandomColor() };
          }
          return color; // Keep locked colors unchanged
        });

        return { ...s, colors: updatedColors };
      }
      return s;
    });

    setColorSchemes(updatedSchemes);
    saveColorSchemesToLocalStorage(updatedSchemes);

    setToastMessage('Schemes refreshed!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className={`color-scheme ${scheme.locked ? 'locked' : ''}`}>
      <header>
        <input
          type="text"
          placeholder={schemeName}
          onChange={(e) => setSchemeName(e.target.value)}
          onBlur={() => updateSchemeName(schemeName)}
          disabled={scheme.locked}
        />
        <div className="header-controls">
          <button type="button" onClick={toggleSchemeLock}>
            <img
              src={scheme.locked ? icons.unlock : icons.lock}
              alt={scheme.locked ? 'Unlock Scheme' : 'Lock Scheme'}
            />
          </button>
          <button type="button" onClick={removeScheme}>
            <img
              src={icons.trash}
              alt="Remove Scheme"
              style={{
                fill: getTextColor(scheme.colors[0]?.hex || '#ffffff'), // Dynamically apply fill color
              }}
            />
          </button>
          <button type="button" onClick={addColor} disabled={scheme.locked}>
            <img src={icons.add} alt="Add Color" />
          </button>
          <button type="button" onClick={refreshSchemes}>
            <img src={icons.refresh} alt="Refresh Schemes" />
          </button>
        </div>
      </header>

      <div className="swatch-row">
        {colors.map((color, colorIndex) => (
          <div className="swatch-wrap" key={color.hex + color.hex}>
            <div
              className="swatch"
              style={{
                backgroundColor: color.hex,
                borderBottom: color.locked
                  ? '3px solid black'
                  : '3px solid transparent',
              }}
              role="button"
              tabIndex={0}
              aria-label={`Copy color ${color.hex}`}
            >
              <div className="controls">
                <span
                  className="color-text"
                  style={{ color: getTextColor(color.hex) }}
                >
                  {color.hex}
                </span>

                <button
                  type="button"
                  onClick={() => copyToClipboard(color.hex)}
                  aria-label="copy color"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_1_97"
                      style={{ maskType: 'alpha' }}
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="24"
                      height="24"
                    >
                      <rect width="24" height="24" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_1_97)">
                      <path
                        fill={getTextColor(color.hex)}
                        d="M9.1155 17C8.65517 17 8.27083 16.8458 7.9625 16.5375C7.65417 16.2292 7.5 15.8448 7.5 15.3845V4.6155C7.5 4.15517 7.65417 3.77083 7.9625 3.4625C8.27083 3.15417 8.65517 3 9.1155 3H16.8845C17.3448 3 17.7292 3.15417 18.0375 3.4625C18.3458 3.77083 18.5 4.15517 18.5 4.6155V15.3845C18.5 15.8448 18.3458 16.2292 18.0375 16.5375C17.7292 16.8458 17.3448 17 16.8845 17H9.1155ZM9.1155 16H16.8845C17.0385 16 17.1796 15.9359 17.3077 15.8077C17.4359 15.6796 17.5 15.5385 17.5 15.3845V4.6155C17.5 4.4615 17.4359 4.32042 17.3077 4.19225C17.1796 4.06408 17.0385 4 16.8845 4H9.1155C8.9615 4 8.82042 4.06408 8.69225 4.19225C8.56408 4.32042 8.5 4.4615 8.5 4.6155V15.3845C8.5 15.5385 8.56408 15.6796 8.69225 15.8077C8.82042 15.9359 8.9615 16 9.1155 16ZM6.1155 20C5.65517 20 5.27083 19.8458 4.9625 19.5375C4.65417 19.2292 4.5 18.8449 4.5 18.3848V7.1155C4.5 6.97317 4.54775 6.85425 4.64325 6.75875C4.73875 6.66325 4.85767 6.6155 5 6.6155C5.14233 6.6155 5.26125 6.66325 5.35675 6.75875C5.45225 6.85425 5.5 6.97317 5.5 7.1155V18.3848C5.5 18.5386 5.56408 18.6796 5.69225 18.8077C5.82042 18.9359 5.9615 19 6.1155 19H14.3845C14.5268 19 14.6458 19.0477 14.7413 19.1432C14.8368 19.2387 14.8845 19.3577 14.8845 19.5C14.8845 19.6423 14.8368 19.7613 14.7413 19.8568C14.6458 19.9523 14.5268 20 14.3845 20H6.1155Z"
                      />
                    </g>
                  </svg>
                </button>
                <button type="button" onClick={() => toggleLock(colorIndex)}>
                  {color.locked ? (
                    // Locked Icon
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <mask
                        id="mask0_1_67"
                        style={{ maskType: 'alpha' }}
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="24"
                        height="24"
                      >
                        <rect width="24" height="24" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_1_67)">
                        <path
                          d="M6.6155 21C6.168 21 5.78683 20.8427 5.472 20.528C5.15733 20.2132 5 19.832 5 19.3845V10.6155C5 10.168 5.15733 9.78683 5.472 9.472C5.78683 9.15733 6.168 9 6.6155 9H15V7C15 6.16667 14.7083 5.45833 14.125 4.875C13.5417 4.29167 12.8333 4 12 4C11.2487 4 10.5945 4.24458 10.0375 4.73375C9.4805 5.22275 9.14875 5.82883 9.04225 6.552C9.01408 6.68267 8.95033 6.79 8.851 6.874C8.75167 6.958 8.63467 7 8.5 7C8.35767 7 8.23875 6.95 8.14325 6.85C8.04775 6.75 8.01217 6.63267 8.0365 6.498C8.1545 5.50183 8.5885 4.66983 9.3385 4.002C10.0885 3.334 10.9757 3 12 3C13.1142 3 14.0593 3.38817 14.8355 4.1645C15.6118 4.94067 16 5.88583 16 7V9H17.3845C17.832 9 18.2132 9.15733 18.528 9.472C18.8427 9.78683 19 10.168 19 10.6155V19.3845C19 19.832 18.8427 20.2132 18.528 20.528C18.2132 20.8427 17.832 21 17.3845 21H6.6155ZM6.6155 20H17.3845C17.564 20 17.7115 19.9423 17.827 19.827C17.9423 19.7115 18 19.564 18 19.3845V10.6155C18 10.436 17.9423 10.2885 17.827 10.173C17.7115 10.0577 17.564 10 17.3845 10H6.6155C6.436 10 6.2885 10.0577 6.173 10.173C6.05767 10.2885 6 10.436 6 10.6155V19.3845C6 19.564 6.05767 19.7115 6.173 19.827C6.2885 19.9423 6.436 20 6.6155 20ZM12 16.5C12.4218 16.5 12.7773 16.3554 13.0663 16.0663C13.3554 15.7773 13.5 15.4218 13.5 15C13.5 14.5782 13.3554 14.2228 13.0663 13.9338C12.7773 13.6446 12.4218 13.5 12 13.5C11.5782 13.5 11.2228 13.6446 10.9338 13.9338C10.6446 14.2228 10.5 14.5782 10.5 15C10.5 15.4218 10.6446 15.7773 10.9338 16.0663C11.2228 16.3554 11.5782 16.5 12 16.5Z"
                          fill={getTextColor(color.hex)}
                        />
                      </g>
                    </svg>
                  ) : (
                    // Unlocked Icon
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <mask
                        id="mask0_1_55"
                        style={{ maskType: 'alpha' }}
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="24"
                        height="24"
                      >
                        <rect width="24" height="24" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_1_55)">
                        <path
                          d="M6.6155 21C6.168 21 5.78683 20.8427 5.472 20.528C5.15733 20.2132 5 19.832 5 19.3845V10.6155C5 10.168 5.15733 9.78683 5.472 9.472C5.78683 9.15733 6.168 9 6.6155 9H8V7C8 5.88583 8.38817 4.94067 9.1645 4.1645C9.94067 3.38817 10.8858 3 12 3C13.1142 3 14.0593 3.38817 14.8355 4.1645C15.6118 4.94067 16 5.88583 16 7V9H17.3845C17.832 9 18.2132 9.15733 18.528 9.472C18.8427 9.78683 19 10.168 19 10.6155V19.3845C19 19.832 18.8427 20.2132 18.528 20.528C18.2132 20.8427 17.832 21 17.3845 21H6.6155ZM6.6155 20H17.3845C17.564 20 17.7115 19.9423 17.827 19.827C17.9423 19.7115 18 19.564 18 19.3845V10.6155C18 10.436 17.9423 10.2885 17.827 10.173C17.7115 10.0577 17.564 10 17.3845 10H6.6155C6.436 10 6.2885 10.0577 6.173 10.173C6.05767 10.2885 6 10.436 6 10.6155V19.3845C6 19.564 6.05767 19.7115 6.173 19.827C6.2885 19.9423 6.436 20 6.6155 20ZM12 16.5C12.4218 16.5 12.7773 16.3554 13.0663 16.0663C13.3554 15.7773 13.5 15.4218 13.5 15C13.5 14.5782 13.3554 14.2228 13.0663 13.9338C12.7773 13.6446 12.4218 13.5 12 13.5C11.5782 13.5 11.2228 13.6446 10.9338 13.9338C10.6446 14.2228 10.5 14.5782 10.5 15C10.5 15.4218 10.6446 15.7773 10.9338 16.0663C11.2228 16.3554 11.5782 16.5 12 16.5ZM9 9H15V7C15 6.16667 14.7083 5.45833 14.125 4.875C13.5417 4.29167 12.8333 4 12 4C11.1667 4 10.4583 4.29167 9.875 4.875C9.29167 5.45833 9 6.16667 9 7V9Z"
                          fill={getTextColor(color.hex)}
                        />
                      </g>
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => removeColor(colorIndex)}
                  aria-label="Remove color"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_2_109"
                      style={{ maskType: 'alpha' }}
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="24"
                      height="24"
                    >
                      <rect width="24" height="24" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_2_109)">
                      <path
                        fill={getTextColor(color.hex)}
                        d="M7.6155 20C7.17117 20 6.79083 19.8418 6.4745 19.5255C6.15817 19.2092 6 18.8288 6 18.3845V6H5.5C5.35833 6 5.23958 5.952 5.14375 5.856C5.04792 5.76 5 5.64108 5 5.49925C5 5.35742 5.04792 5.23875 5.14375 5.14325C5.23958 5.04775 5.35833 5 5.5 5H9C9 4.79367 9.07658 4.61383 9.22975 4.4605C9.38292 4.30733 9.56275 4.23075 9.76925 4.23075H14.2308C14.4373 4.23075 14.6171 4.30733 14.7703 4.4605C14.9234 4.61383 15 4.79367 15 5H18.5C18.6417 5 18.7604 5.048 18.8562 5.144C18.9521 5.24 19 5.35892 19 5.50075C19 5.64259 18.9521 5.76125 18.8562 5.85675C18.7604 5.95225 18.6417 6 18.5 6H18V18.3845C18 18.8288 17.8418 19.2092 17.5255 19.5255C17.2092 19.8418 16.8288 20 16.3845 20H7.6155ZM17 6H7V18.3845C7 18.564 7.05767 18.7115 7.173 18.827C7.2885 18.9423 7.436 19 7.6155 19H16.3845C16.564 19 16.7115 18.9423 16.827 18.827C16.9423 18.7115 17 18.564 17 18.3845V6ZM10.3082 17C10.4502 17 10.569 16.9521 10.6645 16.8563C10.76 16.7604 10.8078 16.6417 10.8078 16.5V8.5C10.8078 8.35833 10.7597 8.23958 10.6637 8.14375C10.5677 8.04792 10.4488 8 10.307 8C10.1652 8 10.0465 8.04792 9.951 8.14375C9.8555 8.23958 9.80775 8.35833 9.80775 8.5V16.5C9.80775 16.6417 9.85575 16.7604 9.95175 16.8563C10.0476 16.9521 10.1664 17 10.3082 17ZM13.693 17C13.8348 17 13.9535 16.9521 14.049 16.8563C14.1445 16.7604 14.1923 16.6417 14.1923 16.5V8.5C14.1923 8.35833 14.1443 8.23958 14.0483 8.14375C13.9524 8.04792 13.8336 8 13.6917 8C13.5497 8 13.431 8.04792 13.3355 8.14375C13.24 8.23958 13.1923 8.35833 13.1923 8.5V16.5C13.1923 16.6417 13.2403 16.7604 13.3363 16.8563C13.4323 16.9521 13.5512 17 13.693 17Z"
                      />
                    </g>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}
    </div>
  );
}

ColorScheme.propTypes = {
  schemeIndex: PropTypes.number.isRequired,
  scheme: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    colors: PropTypes.arrayOf(
      PropTypes.shape({
        hex: PropTypes.string.isRequired,
        locked: PropTypes.bool.isRequired,
        unlocked: PropTypes.bool,
      }),
    ).isRequired,
    locked: PropTypes.bool.isRequired,
  }).isRequired,
  setColorSchemes: PropTypes.func.isRequired,
  colorSchemes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      colors: PropTypes.arrayOf(
        PropTypes.shape({
          hex: PropTypes.string.isRequired,
          locked: PropTypes.bool.isRequired,
        }),
      ).isRequired,
      locked: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  deleteScheme: PropTypes.func.isRequired,
};

export default ColorScheme;
