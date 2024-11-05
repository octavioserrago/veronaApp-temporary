import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import Sales from './pages/Sales';
import Profile from './pages/Profile';
import Blueprints from './pages/Blueprints';
//import NewProfileForm from './pages/NewProfileForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ventas" element={<Sales />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/planos" element={<Blueprints />} />
          {/*<Route path="/newProfile" element={<NewProfileForm />} />*/}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
