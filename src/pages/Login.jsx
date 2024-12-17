import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/verona-escrito.png';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handlerLogin = async (e) => {
        e.preventDefault();


        console.log('Datos enviados al backend:', { name, password });

        try {
        
            const response = await axios.post("http://localhost:4000/users/login", {
                name,
                password
            });

          
            console.log("Respuesta completa del backend:", response);
            console.log("Datos de la respuesta del backend:", response.data);

         
            const { success, message, user } = response.data;

            if (success) {
                console.log("Login exitoso:", message);
                console.log("Usuario:", user);

               
                login(user, response.data.token);
                navigate('/dashboard');
            } else {
               
                setError(message);
                console.log("Mensaje de error desde el servidor:", message);
            }
        } catch (error) {
            console.error("Error en la solicitud de login:", error);

         
            if (error.response) {
               
                console.error("Detalles del error de respuesta:", error.response);
                setError(error.response.data.message || 'Error en la autenticación');
            } else if (error.request) {
              
                console.error("La solicitud no recibió respuesta:", error.request);
                setError('No se pudo conectar al servidor');
            } else {
           
                console.error("Error desconocido:", error.message);
                setError('Error interno del servidor');
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <img src={Logo} alt="Logo" className="mx-auto mb-4 pl-8" />
                </div>
                <form onSubmit={handlerLogin} className="space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="name" className="mb-1 font-medium text-gray-700">Nombre de Usuario</label>
                        <input
                            type="text"
                            id="name"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter username"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="password" className="mb-1 font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <div className="p-2 text-red-600 bg-red-100 border border-red-400 rounded">
                            {error}
                        </div>
                    )}
                    <button type="submit" className="w-full py-2 text-white bg-yellow-400 rounded-md hover:bg-yellow-500">
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
