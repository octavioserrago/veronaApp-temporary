import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const NewProfileForm = () => {
    const navigate = useNavigate();
    const { token, logueado } = useAuth();
    const [formData, setFormData] = useState({
        user_name: '',
        password: '',
        branch_id: '',
        is_adm: '0',
    });
    const [notification, setNotification] = useState({ message: '', type: '' });

    // Verificar si el usuario está logueado
    useEffect(() => {
        if (!logueado) {
            navigate('/');
        }
    }, [logueado, navigate]);

    // Manejar cambios en los campos del formulario
    const handleInputChange = ({ target: { name, value } }) => {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Enviar el formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:4000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setNotification({ message: 'Usuario creado exitosamente!', type: 'success' });
                // Opcional: Redirigir o limpiar el formulario
                setFormData({ user_name: '', password: '', branch_id: '', is_admin: '0' });
            } else {
                setNotification({ message: data.message || 'Error al crear el usuario.', type: 'error' });
            }
        } catch (error) {
            setNotification({ message: 'Error de red: ' + error.message, type: 'error' });
        }
    };

    return (
        <div className="contenedor">
            <Navbar />

            <div className="flex items-center justify-center h-screen">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
                    <h2 className="text-lg font-bold mb-4">Nuevo Perfil</h2>

                    <div className="mb-4">
                        <label htmlFor="user_name" className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
                        <input
                            type="text"
                            name="user_name"
                            value={formData.user_name}
                            onChange={handleInputChange}
                            className="mt-1 p-2 border border-gray-300 rounded w-full"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="mt-1 p-2 border border-gray-300 rounded w-full"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="branch_id" className="block text-sm font-medium text-gray-700">Sucursal</label>
                        <input
                            type="text"
                            name="branch_id"
                            value={formData.branch_id}
                            onChange={handleInputChange}
                            className="mt-1 p-2 border border-gray-300 rounded w-full"
                            required
                        />
                    </div>

                    {/* Campo para el rol (Administrador o no) */}
                    <div className="mb-4">
                        <label htmlFor="is_admin" className="block text-sm font-medium text-gray-700">Rol</label>
                        <select
                            name="is_admin"
                            value={formData.is_admin}
                            onChange={handleInputChange}
                            className="mt-1 p-2 border border-gray-300 rounded w-full"
                            required
                        >
                            <option value="0">No Administrador</option>
                            <option value="1">Administrador</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Crear Perfil
                    </button>

                    {notification.message && (
                        <div className={`mt-4 text-sm ${notification.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                            {notification.message}
                        </div>
                    )}
                </form>
            </div>
        </div>

    );
};

export default NewProfileForm;
