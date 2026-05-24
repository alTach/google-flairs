import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './app/globals.css'; // Make sure styles are imported

hydrateRoot(document.getElementById('root'), <App />);
