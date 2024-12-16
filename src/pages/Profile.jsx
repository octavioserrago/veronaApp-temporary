import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

const Profile = () => {
    const { user, logueado, logout, token } = useAuth();
    const navigate = useNavigate();

    const API_BASE_URL = 'http://localhost:3306/users';

    const [newUserName, setNewUserName] = useState(user?.user_name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!logueado || !user) {
            navigate('/');
        }
    }, [logueado, navigate, user]);

    const axiosConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    const handleUpdateUserName = async () => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/${user.user_id}`,
                { name: newUserName, password: currentPassword },
                axiosConfig
            );
            if (response.data.success) {
                setSuccessMessage('Nombre de usuario actualizado con éxito.');
            } else {
                setErrorMessage(response.data.message || 'Error al actualizar el nombre de usuario.');
            }
        } catch (error) {
            setErrorMessage('Error al actualizar el nombre de usuario.');
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden.');
            return;
        }

        try {
            const response = await axios.put(
                `${API_BASE_URL}/${user.user_id}`,
                { name: user.user_name, password: newPassword },
                axiosConfig
            );
            if (response.data.success) {
                setSuccessMessage('Contraseña actualizada con éxito.');
            } else {
                setErrorMessage(response.data.message || 'Error al actualizar la contraseña.');
            }
        } catch (error) {
            setErrorMessage('Error al actualizar la contraseña.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">Perfil</h1>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Cambiar Nombre de Usuario</h2>
                    {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
                    {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
                    <div className="mb-6">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nuevo Nombre de Usuario</label>
                        <input
                            type="text"
                            id="username"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <button
                            onClick={handleUpdateUserName}
                            className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Actualizar Nombre
                        </button>
                    </div>

                    <h2 className="text-xl font-semibold mb-4">Cambiar Contraseña</h2>
                    <div className="mb-6">
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                        <input
                            type="password"
                            id="current-password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                        <input
                            type="password"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <button
                        onClick={handleUpdatePassword}
                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Actualizar Contraseña
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
