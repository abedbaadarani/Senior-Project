import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Add more routes here as the project grows */}
    </Routes>
  );
}

export default AppRoutes;
