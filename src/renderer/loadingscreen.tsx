import React from 'react';
import './styles/App.scss';

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <img src={require('./assets/flower.png')} className='spinner' alt="Loading icon" />
      <p>Loading...</p>
    </div>
  );
};

export default LoadingScreen;
