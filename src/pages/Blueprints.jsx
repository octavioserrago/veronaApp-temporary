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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAction = async () => {
        if (modalType === 'Crear nuevo plano') {
            // Lógica para crear un nuevo plano
            try {
                const response = await fetch('http://localhost:3333/blueprints', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();
                if (response.ok) {
                    setNotification({ message: 'Plano creado exitosamente!', type: 'success' });
                    await fetchBlueprints(); // Actualiza la lista de planos
                } else {
                    setNotification({ message: `Error: ${result.message || 'Error desconocido'}`, type: 'error' });
                }
            } catch (error) {
                console.error('Error al crear plano:', error);
                setNotification({ message: 'Ocurrió un error al crear el plano.', type: 'error' });
            }
        } else if (modalType === 'Cargar foto') {
            try {
                const response = await fetch('http://localhost:3333/blueprintPhotos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        blueprint_id: formData.blueprint_id, // ID del plano al que se le carga la foto
                        photo_url: formData.photo_url, // URL de la foto
                    }),
                });

                const result = await response.json();
                if (response.ok) {
                    setNotification({ message: 'Foto cargada exitosamente!', type: 'success' });
                } else {
                    setNotification({ message: `Error: ${result.message || 'Error desconocido'}`, type: 'error' });
                }
            } catch (error) {
                console.error('Error al cargar foto:', error);
                setNotification({ message: 'Ocurrió un error al cargar la foto.', type: 'error' });
            }
        } else if (modalType === 'Modificar datos de un plano') {
            try {
                const response = await fetch(`http://localhost:3333/blueprints/${formData.blueprint_id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sale_id: formData.sale_id,
                        blueprintCode: formData.blueprintCode,
                        description: formData.description,
                        material: formData.material,
                        colour: formData.colour,
                    }),
                });

                const result = await response.json();
                if (response.ok) {
                    setNotification({ message: 'Plano actualizado exitosamente!', type: 'success' });
                    await fetchBlueprints(); // Actualiza la lista de planos
                } else {
                    setNotification({ message: `Error: ${result.message || 'Error desconocido'}`, type: 'error' });
                }
            } catch (error) {
                console.error('Error al actualizar plano:', error);
                setNotification({ message: 'Ocurrió un error al actualizar el plano.', type: 'error' });
            }
        } else if (modalType === 'Eliminar un plano') {
            try {
                const response = await fetch(`http://localhost:3333/blueprints/${formData.blueprint_id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setNotification({ message: 'Plano eliminado exitosamente!', type: 'success' });
                    await fetchBlueprints(); // Actualiza la lista de planos
                } else {
                    const result = await response.json();
                    setNotification({ message: `Error: ${result.message || 'Error desconocido'}`, type: 'error' });
                }
            } catch (error) {
                console.error('Error al eliminar plano:', error);
                setNotification({ message: 'Ocurrió un error al eliminar el plano.', type: 'error' });
            }
        }
        closeModal();
    };

    const fetchBlueprints = async () => {
        try {
            const response = await fetch('http://localhost:3333/blueprints');
            const data = await response.json();
            if (data.success && Array.isArray(data.results)) {
                setBlueprints(data.results);
            } else {
                throw new Error('La respuesta no contiene un array de resultados');
            }
        } catch (error) {
            console.error('Error al obtener planos:', error);
            setNotification({ message: 'Ocurrió un error al obtener los planos.', type: 'error' });
        }
    };

    useEffect(() => {
        fetchBlueprints();
    }, []);

    const closeNotification = () => {
        setNotification({ message: '', type: '' });
    };

    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(closeNotification, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const toggleBlueprintList = () => {
        setIsBlueprintListOpen((prev) => !prev);
    };

    return (
        <div className="contenedor-total">
            <Navbar />
            <div className="contenedor bg-gray-100 h-screen p-6">
                <div className="mt-10 text-center">
                    <h1 className="text-2xl font-bold mb-6">Gestión de Planos</h1>
                    <div className="flex flex-col items-center space-y-4">
                        <button
                            onClick={() => openModal('Crear nuevo plano')}
                            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
                        >
                            Crear nuevo plano
                        </button>
                        <button
                            onClick={() => openModal('Cargar foto')}
                            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                        >
                            Cargar foto a un plano
                        </button>
                        <button
                            onClick={() => openModal('Modificar datos de un plano')}
                            className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-300"
                        >
                            Modificar datos de un plano
                        </button>
                        <button
                            onClick={() => openModal('Eliminar un plano')}
                            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
                        >
                            Eliminar un plano
                        </button>
                    </div>
                </div>

                {notification.message && (
                    <div
                        className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                            } text-white`}
                    >
                        {notification.message}
                        <button onClick={closeNotification} className="ml-4 underline">
                            Cerrar
                        </button>
                    </div>
                )}

                <button
                    onClick={toggleBlueprintList}
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
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold mb-4">{modalType}</h2>
                        <form>
                            {modalType === 'Modificar datos de un plano' || modalType === 'Eliminar un plano' ? (
                                <div>
                                    <label className="block mb-2">
                                        ID del plano:
                                        <input
                                            type="text"
                                            name="blueprint_id"
                                            value={formData.blueprint_id}
                                            onChange={handleInputChange}
                                            className="border p-2 w-full mb-4"
                                            required
                                        />
                                    </label>
                                </div>
                            ) : null}

                            {modalType === 'Crear nuevo plano' || modalType === 'Modificar datos de un plano' ? (
                                <>
                                    <label className="block mb-2">
                                        ID de venta:
                                        <input
                                            type="text"
                                            name="sale_id"
                                            value={formData.sale_id}
                                            onChange={handleInputChange}
                                            className="border p-2 w-full mb-4"
                                            required
                                        />
                                    </label>
                                    <label className="block mb-2">
                                        Código del plano:
                                        <input
                                            type="text"
                                            name="blueprintCode"
                                            value={formData.blueprintCode}
                                            onChange={handleInputChange}
                                            className="border p-2 w-full mb-4"
                                            required
                                        />
                                    </label>
                                    <label className="block mb-2">
                                        Descripción:
                                        <input
                                            type="text"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="border p-2 w-full mb-4"
                                            required
                                        />
                                    </label>
                                    <label className="block mb-2">
                                        Material:
                                        <input
                                            type="text"
                                            name="material"
                                            value={formData.material}
                                            onChange={handleInputChange}
                                            className="border p-2 w-full mb-4"
                                            required
                                        />
                                    </label>
                                    <label className="block mb-2">
                                        Color:
                                        <input
                                            type="text"
                                            name="colour"
                                            value={formData.colour}
                                            onChange={handleInputChange}
                                            className="border p-2 w-full mb-4"
                                            required
                                        />
                                    </label>
                                </>
                            ) : null}

                            {modalType === 'Cargar foto' ? (
                                <>
                                    <label className="block mb-2">
                                        ID del plano:
                                        <input
                                            type="text"
                                            name="blueprint_id"
                                            value={formData.blueprint_id}
                                            onChange={handleInputChange}
                                            className="border p-2 w-full mb-4"
                                            required
                                        />
                                    </label>
                                    <label className="block mb-2">
                                        URL de la foto:
                                        <input
                                            type="text"
                                            name="photo_url"
                                            value={formData.photo_url}
                                            onChange={handleInputChange}
                                            className="border p-2 w-full mb-4"
                                            required
                                        />
                                    </label>
                                </>
                            ) : null}

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleAction}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                    {modalType}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-300 ml-2"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Blueprints;
