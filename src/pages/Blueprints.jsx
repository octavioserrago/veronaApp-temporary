import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const Blueprints = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formData, setFormData] = useState({
        sale_id: '',
        blueprintCode: '',
        description: '',
        material: '',
        colour: ''
    });

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
            colour: ''
        });
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleAction = async () => {
        if (modalType === 'Linkear plano a una venta') {
            try {
                const response = await fetch('http://localhost:3333/blueprints', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                if (result.success) {
                    alert('Plano linkeado exitosamente!');
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error al linkear plano:', error);
                alert('Ocurrió un error al linkear el plano.');
            }
        }
        closeModal();
    };

    return (
        <div className="contenedir-total">


            <Navbar />
            <div className="contenedor bg-gray-100 h-screen p-6">

                <div className="mt-10 text-center">
                    <h1 className="text-2xl font-bold mb-6">Gestión de Planos</h1>
                    <div className="flex flex-col items-center space-y-4">
                        {/* Botón para abrir modal para linkear un plano */}
                        <button
                            onClick={() => openModal('Linkear plano a una venta')}
                            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                        >
                            Linkear plano a una venta
                        </button>

                        {/* Botón para abrir modal para modificar datos de un plano */}
                        <button
                            onClick={() => openModal('Modificar datos de un plano')}
                            className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-300"
                        >
                            Modificar datos de un plano
                        </button>

                        {/* Botón para abrir modal para eliminar un plano */}
                        <button
                            onClick={() => openModal('Eliminar un plano')}
                            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
                        >
                            Eliminar un plano
                        </button>
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                            <h2 className="text-xl font-semibold mb-4">{modalType}</h2>
                            <form>
                                {modalType === 'Linkear plano a una venta' && (
                                    <>

                                        <div className="mb-4">
                                            <label className="block text-gray-700">ID de la Venta</label>
                                            <input
                                                type="text"
                                                name="sale_id"
                                                value={formData.sale_id}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                                placeholder="Ingresa el ID de la venta"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700">Código del Plano</label>
                                            <input
                                                type="text"
                                                name="blueprintCode"
                                                value={formData.blueprintCode}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                                placeholder="Ingresa el código del plano"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-gray-700">Descripción</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                                placeholder="Ingresa la descripción del plano"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700">Material</label>
                                            <input
                                                type="text"
                                                name="material"
                                                value={formData.material}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                                placeholder="Ingresa el material"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700">Color</label>
                                            <input
                                                type="text"
                                                name="colour"
                                                value={formData.colour}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                                placeholder="Ingresa el color"
                                            />
                                        </div>
                                    </>
                                )}

                                {modalType === 'Modificar datos de un plano' && (
                                    <>
                                        <div className="mb-4">
                                            <label className="block text-gray-700">Nuevo Código del Plano</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-yellow-500"
                                                placeholder="Ingresa el nuevo código del plano"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700">Descripción</label>
                                            <textarea
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-yellow-500"
                                                placeholder="Ingresa la descripción"
                                            />
                                        </div>
                                    </>
                                )}

                                {modalType === 'Eliminar un plano' && (
                                    <p className="text-red-500">¿Estás seguro que deseas eliminar este plano? Esta acción no se puede deshacer.</p>
                                )}

                                {/* Botones del modal */}
                                <div className="flex justify-end space-x-4 mt-4">
                                    <button
                                        type="button"
                                        className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300"
                                        onClick={closeModal}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className={`py-2 px-4 rounded-lg ${modalType === 'Eliminar un plano' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white transition duration-300`}
                                        onClick={handleAction}
                                    >
                                        {modalType === 'Eliminar un plano' ? 'Eliminar' : 'Confirmar'}
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
