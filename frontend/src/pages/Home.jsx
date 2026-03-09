import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/App.css';

const Home = () => {
  return (
    <div className="container">
      <h1>LIU Alumni & Opportunities Platform</h1>
      <p>Welcome to the platform. Manage your connections and discover opportunities.</p>
      <nav>
        <ul>
          <li><Link to="/users">View Directory</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
