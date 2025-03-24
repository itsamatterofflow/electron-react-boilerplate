// src/Toast.js
import React from 'react';
import PropTypes from 'prop-types';

function Toast({ message, onClose }) {
  if (!message) return null; // Don't render if there's no message.

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        zIndex: 1000,
      }}
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onClose}
        style={{
          backgroundColor: 'transparent',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          marginTop: '5px',
        }}
      >
        Close
      </button>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Toast;
