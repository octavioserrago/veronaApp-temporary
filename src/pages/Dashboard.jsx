import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/verona-escrito.png';

const Dashboard = () => {
    const { logueado, user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!logueado) {
            navigate('/');
        }
    }, [logueado, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md">
                <div className="text-center mb-4">
                    <img src={Logo} alt="Logo" className="mx-auto mb-4" />
                </div>
                <h1 className="text-2xl font-bold mb-4">Welcome, {user ? user.name : 'Guest'}!</h1>
                <p className="mb-4">This is your dashboard. Here you can view your information and settings.</p>
                <button
                    onClick={handleLogout}
                    className="py-2 px-4 text-white bg-red-500 rounded-md hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
