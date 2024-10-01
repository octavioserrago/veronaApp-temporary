import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/verona-escrito.png';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const { logueado, user, logout } = useAuth();
    const navigate = useNavigate();
    const [dolarOficial, setDolarOficial] = useState(null);
    const [dolarBlue, setDolarBlue] = useState(null);

    useEffect(() => {
        if (!logueado) {
            navigate('/');
        }
    }, [logueado, navigate]);

    useEffect(() => {
        fetch("https://dolarapi.com/v1/dolares/oficial")
            .then(response => response.json())
            .then(data => {
                const formattedDate = new Date(data.fechaActualizacion).toLocaleString();
                setDolarOficial({
                    compra: data.compra,
                    venta: data.venta,
                    fechaActualizacion: formattedDate
                });
            })
            .catch(error => console.error('Error fetching Dolar Oficial:', error));

        fetch("https://dolarapi.com/v1/dolares/blue")
            .then(response => response.json())
            .then(data => {
                const formattedDate = new Date(data.fechaActualizacion).toLocaleString();
                setDolarBlue({
                    compra: data.compra,
                    venta: data.venta,
                    fechaActualizacion: formattedDate
                });
            })
            .catch(error => console.error('Error fetching Dolar Blue:', error));
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (

        <div className="contenedor">
            <Navbar />
            <div className="flex flex-col items-center min-h-screen bg-gray-100">
                <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md">
                    <div className="text-center mb-4">
                        <img src={Logo} alt="Logo" className="mx-auto mb-4" />
                    </div>
                    <div className="max-w-4xl mx-auto p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-300 text-black p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <h2 className="text-xl font-bold mb-3 text-green-800">Dólar Oficial</h2>
                                {dolarOficial ? (
                                    <>
                                        <p className="text-lg">Compra: <span className="font-medium">${dolarOficial.compra}</span></p>
                                        <p className="text-lg">Venta: <span className="font-medium">${dolarOficial.venta}</span></p>
                                        <p className="text-sm mt-3 text-gray-700">Última actualización: {dolarOficial.fechaActualizacion}</p>
                                    </>
                                ) : (
                                    <p>Cargando...</p>
                                )}
                            </div>

                            <div className="bg-gray-700 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <h2 className="text-xl font-bold mb-3">Dólar Blue</h2>
                                {dolarBlue ? (
                                    <>
                                        <p className="text-lg">Compra: <span className="font-medium">${dolarBlue.compra}</span></p>
                                        <p className="text-lg">Venta: <span className="font-medium">${dolarBlue.venta}</span></p>
                                        <p className="text-sm mt-3 text-gray-300">Última actualización: {dolarBlue.fechaActualizacion}</p>
                                    </>
                                ) : (
                                    <p>Cargando...</p>
                                )}
                            </div>
                        </div>
                    </div>


                    <button
                        onClick={handleLogout}
                        className="mt-6 py-2 px-4 text-white bg-red-500 rounded-md hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
