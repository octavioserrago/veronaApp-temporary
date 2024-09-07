import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/verona-escrito.png';
import Navbar from '../components/Navbar';

const Blueprints = () => {
    return (
        <div className="contenedor">
            <Navbar />
        </div>
    );
};

export default Blueprints;
