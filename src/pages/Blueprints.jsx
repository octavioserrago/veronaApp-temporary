import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Blueprints = () => {
    const { branchId, logueado } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formData, setFormData] = useState({
        sale_id: '',
        blueprintCode: '',
        description: '',
        material: '',
        colour: '',
        photo_url: '',
        blueprint_id: '',
    });
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [blueprints, setBlueprints] = useState([]);
    const [isBlueprintListOpen, setIsBlueprintListOpen] = useState(false);

    const openModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalType('');
        setFormData({
            sale_id: '',
            blueprintCode: '',
            description: '',
            material: '',
            colour: '',
            photo_url: '',
            blueprint_id: '',
        });
    };

    const handleInputChange = ({ target: { name, value } }) => {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleAction = async () => {
        const { blueprint_id, photo_url, ...blueprintData } = formData;
        try {
            let response, result;
            switch (modalType) {
                case 'Crear nuevo plano':
                    response = await fetch('http://localhost:3333/blueprints', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(blueprintData),
                    });
                    result = await response.json();
                    if (response.ok) {
                        setNotification({ message: 'Plano creado exitosamente!', type: 'success' });
                        await fetchBlueprints();
                    } else {
                        throw new Error(result.message || 'Error desconocido');
                    }
                    break;

                case 'Cargar foto':
                    response = await fetch('http://localhost:3333/blueprintPhotos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ blueprint_id, photo_url }),
                    });
                    result = await response.json();
                    if (response.ok) {
                        setNotification({ message: 'Foto cargada exitosamente!', type: 'success' });
                    } else {
                        throw new Error(result.message || 'Error desconocido');
                    }
                    break;

                case 'Modificar datos de un plano':
                    response = await fetch(`http://localhost:3333/blueprints/${blueprint_id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(blueprintData),
                    });
                    result = await response.json();
                    if (response.ok) {
                        setNotification({ message: 'Plano actualizado exitosamente!', type: 'success' });
                        await fetchBlueprints();
                    } else {
                        throw new Error(result.message || 'Error desconocido');
                    }
                    break;

                case 'Eliminar un plano':
                    response = await fetch(`http://localhost:3333/blueprints/${blueprint_id}`, { method: 'DELETE' });
                    if (response.ok) {
                        setNotification({ message: 'Plano eliminado exitosamente!', type: 'success' });
                        await fetchBlueprints();
                    } else {
                        result = await response.json();
                        throw new Error(result.message || 'Error desconocido');
                    }
                    break;

                default:
                    throw new Error('Acción desconocida');
            }
        } catch (error) {
            setNotification({ message: error.message || 'Ocurrió un error.', type: 'error' });
        } finally {
            closeModal();
        }
    };

    const fetchBlueprints = async () => {
        try {
            const response = await fetch('http://localhost:3333/blueprints');
            const { success, results } = await response.json();
            if (success && Array.isArray(results)) setBlueprints(results);
            else throw new Error('La respuesta no contiene un array de resultados');
        } catch (error) {
            setNotification({ message: 'Ocurrió un error al obtener los planos.', type: 'error' });
        }
    };

    useEffect(() => {
        fetchBlueprints();
    }, []);

    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => setNotification({ message: '', type: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification.message]);

    return (
        <div className="contenedor-total">
            <Navbar />
            <div className="contenedor bg-gray-100 h-screen p-6">
                <div className="mt-10 text-center">
                    <h1 className="text-2xl font-bold mb-6">Gestión de Planos</h1>
                    <div className="flex flex-col items-center space-y-4">
                        {['Crear nuevo plano', 'Cargar foto', 'Modificar datos de un plano', 'Eliminar un plano'].map((action) => (
                            <button
                                key={action}
                                onClick={() => openModal(action)}
                                className={`bg-${action.includes('Eliminar') ? 'red' : action.includes('Modificar') ? 'yellow' : action.includes('Cargar') ? 'blue' : 'green'}-500 text-white py-2 px-4 rounded-lg hover:bg-${action.includes('Eliminar') ? 'red' : action.includes('Modificar') ? 'yellow' : action.includes('Cargar') ? 'blue' : 'green'}-600 transition duration-300`}
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </div>

                {notification.message && (
                    <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg bg-${notification.type === 'success' ? 'green' : 'red'}-500 text-white`}>
                        {notification.message}
                        <button onClick={() => setNotification({ message: '', type: '' })} className="ml-4 underline">
                            Cerrar
                        </button>
                    </div>
                )}

                <button
                    onClick={() => setIsBlueprintListOpen(!isBlueprintListOpen)}
                    className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300 mt-8"
                >
                    {isBlueprintListOpen ? 'Ocultar lista de Planos' : 'Mostrar lista de Planos'}
                </button>

                {isBlueprintListOpen && (
                    <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Lista de Planos</h2>
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2">ID</th>
                                    <th className="p-2">Venta ID</th>
                                    <th className="p-2">Código</th>
                                    <th className="p-2">Descripción</th>
                                    <th className="p-2">Material</th>
                                    <th className="p-2">Color</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blueprints.map((blueprint) => (
                                    <tr key={blueprint.blueprint_id}>
                                        <td className="border p-2">{blueprint.blueprint_id}</td>
                                        <td className="border p-2">{blueprint.sale_id}</td>
                                        <td className="border p-2">{blueprint.blueprintCode}</td>
                                        <td className="border p-2">{blueprint.description}</td>
                                        <td className="border p-2">{blueprint.material}</td>
                                        <td className="border p-2">{blueprint.colour}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4">{modalType}</h2>
                            <form>
                                {['Modificar datos de un plano', 'Eliminar un plano'].includes(modalType) && (
                                    <label className="block mb-2">
                                        ID del plano:
                                        <input
                                            type="text"
                                            name="blueprint_id"
                                            value={formData.blueprint_id}
                                            onChange={handleInputChange}
                                            className="border p-2 w-full"
                                        />
                                    </label>
                                )}
                                {modalType === 'Cargar foto' && (
                                    <>
                                        <label className="block mb-2">
                                            ID del plano:
                                            <input
                                                type="text"
                                                name="blueprint_id"
                                                value={formData.blueprint_id}
                                                onChange={handleInputChange}
                                                className="border p-2 w-full"
                                            />
                                        </label>
                                        <label className="block mb-2">
                                            URL de la foto:
                                            <input
                                                type="text"
                                                name="photo_url"
                                                value={formData.photo_url}
                                                onChange={handleInputChange}
                                                className="border p-2 w-full"
                                            />
                                        </label>
                                    </>
                                )}
                                {modalType === 'Crear nuevo plano' && (
                                    <>
                                        {['sale_id', 'blueprintCode', 'description', 'material', 'colour'].map((field) => (
                                            <label key={field} className="block mb-2">
                                                {field.replace('_', ' ').toUpperCase()}:
                                                <input
                                                    type="text"
                                                    name={field}
                                                    value={formData[field]}
                                                    onChange={handleInputChange}
                                                    className="border p-2 w-full"
                                                />
                                            </label>
                                        ))}
                                    </>
                                )}
                                <div className="flex justify-end">
                                    <button type="button" onClick={handleAction} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300">
                                        {modalType}
                                    </button>
                                    <button onClick={closeModal} className="ml-2 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300">
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blueprints;
