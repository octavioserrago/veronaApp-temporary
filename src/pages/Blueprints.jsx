import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:4000/blueprints';
const PHOTO_URL = 'http://localhost:4000/blueprintPhotos';

const Blueprints = () => {
    const { branchId, logueado, token } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formData, setFormData] = useState({
        sale_id: '',
        blueprintCode: '',
        material: '',
        colour: '',
        status: '',
        photo_url: '',
        blueprint_id: '',
    });
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [blueprints, setBlueprints] = useState([]);
    const [isBlueprintListOpen, setIsBlueprintListOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!logueado) {
            navigate('/');
        }
    }, [logueado, navigate]);

    const openModal = (type, blueprint = {}) => {
        setModalType(type);
        setFormData({
            ...formData,
            ...blueprint // Cargar datos existentes si se está modificando un plano
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalType('');
        resetFormData();
    };

    const resetFormData = () => {
        setFormData({
            sale_id: '',
            blueprintCode: '',
            material: '',
            colour: '',
            status: '',
            photo_url: '',
            blueprint_id: '',
        });
    };

    const handleInputChange = ({ target: { name, value } }) => {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const fetchBlueprints = async () => {
        try {
            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const { success, results } = await response.json();
            if (success && Array.isArray(results)) {
                setBlueprints(results);
            } else {
                throw new Error('La respuesta no contiene un array de resultados');
            }
        } catch (error) {
            setNotification({ message: 'Ocurrió un error al obtener los planos.', type: 'error' });
        }
    };

    const apiRequest = async (url, method, body) => {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });
        return response.json();
    };

    const handleAction = async () => {
        const { blueprint_id, photo_url, status } = formData;
        try {
            let result;
            switch (modalType) {
                case 'Crear nuevo plano':
                    result = await apiRequest(API_URL, 'POST', formData);
                    handleResponse(result, 'Plano creado exitosamente!');
                    break;

                case 'Cargar foto':
                    result = await apiRequest(PHOTO_URL, 'POST', { blueprint_id, photo_url });
                    handleResponse(result, 'Foto cargada exitosamente!');
                    break;

                case 'Modificar datos de un plano':
                    result = await apiRequest(`${API_URL}/${blueprint_id}`, 'PUT', { ...formData, blueprint_id });
                    handleResponse(result, 'Plano actualizado exitosamente!');
                    break;

                case 'Eliminar un plano':
                    const deleteResponse = await fetch(`${API_URL}/${blueprint_id}`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (deleteResponse.ok) {
                        setNotification({ message: 'Plano eliminado exitosamente!', type: 'success' });
                        await fetchBlueprints();
                    } else {
                        throw new Error('No se pudo eliminar el plano');
                    }
                    break;

                case 'Actualizar estado de un plano':
                    result = await apiRequest(`${API_URL}/${blueprint_id}`, 'PUT', { status });
                    handleResponse(result, 'Estado del plano actualizado exitosamente!');
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

    const handleResponse = (result, successMessage) => {
        if (result.success) {
            setNotification({ message: successMessage, type: 'success' });
            fetchBlueprints();
        } else {
            throw new Error(result.message || 'Error desconocido');
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
                        {['Crear nuevo plano', 'Cargar foto', 'Modificar datos de un plano', 'Eliminar un plano', 'Actualizar estado de un plano'].map((action) => (
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
                                    <th className="p-2">Material</th>
                                    <th className="p-2">Color</th>
                                    <th className="p-2">Estado</th>
                                    <th className="p-2">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blueprints.map((blueprint) => (
                                    <tr key={blueprint.blueprint_id}>
                                        <td className="border rounded-sm p-2">{blueprint.blueprint_id}</td>
                                        <td className="border rounded-sm p-2">{blueprint.sale_id}</td>
                                        <td className="border rounded-sm p-2">{blueprint.blueprintCode}</td>
                                        <td className="border rounded-sm p-2">{blueprint.material}</td>
                                        <td className="border rounded-sm p-2">{blueprint.colour}</td>
                                        <td className="border rounded-sm p-2">{blueprint.status}</td>
                                        <td className="border rounded-sm p-2">
                                            <button onClick={() => openModal('Modificar datos de un plano', blueprint)} className="bg-yellow-500 text-white px-2 py-1 rounded">Modificar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h2 className="text-lg font-semibold mb-4">{modalType}</h2>
                            <form onSubmit={(e) => { e.preventDefault(); handleAction(); }}>
                                {modalType === 'Crear nuevo plano' && (
                                    <>
                                        <input

                                            type="text"
                                            name="sale_id"
                                            placeholder="ID de Venta"
                                            value={formData.sale_id}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="blueprintCode"
                                            placeholder="Código del plano"
                                            value={formData.blueprintCode}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="material"
                                            placeholder="Material"
                                            value={formData.material}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="colour"
                                            placeholder="Color"
                                            value={formData.colour}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        />
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        >
                                            <option value="" disabled>Selecciona un estado</option>
                                            <option value="Suspendido">Suspendido</option>
                                            <option value="En producción">En producción</option>
                                            <option value="Terminado">Terminado</option>
                                        </select>
                                    </>
                                )}

                                {modalType === 'Modificar datos de un plano' && (
                                    <>
                                        <input
                                            type="text"
                                            name="blueprint_id"
                                            placeholder="ID de Plano"
                                            value={formData.blueprint_id}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="sale_id"
                                            placeholder="ID de Venta"
                                            value={formData.sale_id}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="blueprintCode"
                                            placeholder="Código del plano"
                                            value={formData.blueprintCode}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="material"
                                            placeholder="Material"
                                            value={formData.material}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="colour"
                                            placeholder="Color"
                                            value={formData.colour}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        />
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        >
                                            <option value="" disabled>Selecciona un estado</option>
                                            <option value="Suspendido">Suspendido</option>
                                            <option value="En producción">En producción</option>
                                            <option value="Terminado">Terminado</option>
                                        </select>
                                    </>
                                )}

                                {modalType === 'Cargar foto' && (
                                    <>
                                        <input
                                            type="text"
                                            name="blueprint_id"
                                            placeholder="ID de Plano"
                                            value={formData.blueprint_id}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="photo_url"
                                            placeholder="URL de la foto"
                                            value={formData.photo_url}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        />
                                    </>
                                )}

                                {modalType === 'Eliminar un plano' && (
                                    <input
                                        type="text"
                                        name="blueprint_id"
                                        placeholder="ID de Plano"
                                        value={formData.blueprint_id}
                                        onChange={handleInputChange}
                                        className="border p-2 mb-2 w-full rounded-md"
                                        required
                                    />
                                )}

                                {modalType === 'Actualizar estado de un plano' && (
                                    <>
                                        <input
                                            type="text"
                                            name="blueprint_id"
                                            placeholder="ID de Plano"
                                            value={formData.blueprint_id}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        />
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="border p-2 mb-2 w-full rounded-md"
                                            required
                                        >
                                            <option value="" disabled>Selecciona un estado</option>
                                            <option value="Suspendido">Suspendido</option>
                                            <option value="En producción">En producción</option>
                                            <option value="Terminado">Terminado</option>
                                        </select>
                                    </>
                                )}

                                <div className="flex justify-between mt-4">
                                    <button type="button" onClick={closeModal} className="bg-gray-400 text-white py-2 px-4 rounded-lg">Cancelar</button>
                                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-lg">{modalType.includes('Eliminar') ? 'Eliminar' : 'Guardar'}</button>
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
