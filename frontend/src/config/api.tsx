// src/config/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://votre-app-flask.herokuapp.com/api'  // URL de prod
  : 'http://localhost:5000/api';  // URL de dev

export default API_BASE_URL;