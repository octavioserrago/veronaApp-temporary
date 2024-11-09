import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Asegúrate de que este es tu contexto de autenticación

const NewProfileForm = () => {
    const navigate = useNavigate();
    const { token, logueado } = useAuth();
    const [formData, setFormData] = useState({
        user_name: '',
        password: '',
        branch_id: '',
    });
    const [notification, setNotification] = useState({ message: '', type: '' });

    // Verificar si el usuario está logueado
    React.useEffect(() => {
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
            const response = await fetch('https://veronaappapi-temporary.onrender.com/users', {
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
                setFormData({ user_name: '', password: '', branch_id: '' });
            } else {
                setNotification({ message: data.message || 'Error al crear el usuario.', type: 'error' });
            }
        } catch (error) {
            setNotification({ message: 'Error de red: ' + error.message, type: 'error' });
        }
    };

    return (
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
    );
};

export default NewProfileForm;