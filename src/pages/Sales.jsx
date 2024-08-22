import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/verona-escrito.png';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Sales = () => {
    const { branchId } = useAuth();
    const [sales, setSales] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        branch_id: branchId || '',
        customer_name: '',
        details: '',
        payment_method: '',
        total_amount: '',
        total_money_entries: '',
        status: '',
    });
    const [showForm, setShowForm] = useState(false);
    const { logueado, user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!logueado) {
            navigate('/');
        }
    }, [logueado, navigate]);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const response = await axios.get('http://localhost:3333/sales');
            if (response.data.success && Array.isArray(response.data.results)) {
                setSales(response.data.results);
            } else {
                console.error('Unexpected data format:', response.data);
                setSales([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching sales:', error);
            setSales([]);
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        const isNumber = !isNaN(searchTerm);
        const route = isNumber
            ? `http://localhost:3333/sales/${searchTerm}`
            : `http://localhost:3333/sales/search/${searchTerm}`;

        console.log('Fetching data from:', route);

        try {
            const response = await axios.get(route);
            console.log('Search Response:', response.data);

            if (isNumber) {
                if (response.data.success && response.data.result) {
                    setSales([response.data.result]);
                } else {
                    console.error('Unexpected data format or no sale found:', response.data);
                    setSales([]);
                }
            } else {
                if (response.data.success && Array.isArray(response.data.results)) {
                    setSales(response.data.results);
                } else {
                    console.error('Unexpected data format:', response.data);
                    setSales([]);
                }
            }
        } catch (error) {
            console.error('Error searching sales:', error);
            setSales([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3333/sales', form);
            setShowForm(false);
            fetchSales();
        } catch (error) {
            console.error('Error creating sale:', error);
        }
    };

    const handleDelete = async (sale_id) => {
        const confirmText = prompt('Escribe "Borrar" para confirmar la eliminación:');
        if (confirmText === 'Borrar') {
            try {
                await axios.delete(`http://localhost:3333/sales/${sale_id}`);
                fetchSales();
            } catch (error) {
                console.error('Error deleting sale:', error);
            }
        } else {
            alert('Confirmación incorrecta. La venta no se ha eliminado.');
        }
    };

    const paymentMethods = ['Efectivo', 'Tarjeta de Crédito', 'Transferencia Bancaria'];
    const statuses = ['En suspenso', 'En producción']; // Opciones para el estado

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <div className="flex flex-col items-center w-full p-4 bg-gray-100 flex-grow">
                <div className="w-full p-4 bg-white rounded-lg shadow-md">
                    <div className="text-center mb-4">
                        <img src={Logo} alt="Logo" className="mx-auto mb-4 w-48" />
                    </div>

                    <div className="mb-6 flex justify-between items-center">
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="py-2 px-4 text-white bg-green-500 rounded-md hover:bg-green-600"
                        >
                            {showForm ? 'Cancelar' : 'Crear nueva venta'}
                        </button>

                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md"
                                placeholder="Buscar ventas..."
                            />
                            <button
                                onClick={handleSearch}
                                className="py-2 px-4 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                            >
                                Buscar
                            </button>
                        </div>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} className="mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    name="customer_name"
                                    value={form.customer_name}
                                    onChange={handleInputChange}
                                    placeholder="Nombre del Cliente"
                                    className="p-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <input
                                    type="text"
                                    name="details"
                                    value={form.details}
                                    onChange={handleInputChange}
                                    placeholder="Detalles"
                                    className="p-2 border border-gray-300 rounded-md"
                                />
                                <select
                                    name="payment_method"
                                    value={form.payment_method}
                                    onChange={handleInputChange}
                                    className="p-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">Selecciona un método de pago</option>
                                    {paymentMethods.map((method, index) => (
                                        <option key={index} value={method}>
                                            {method}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    name="total_amount"
                                    value={form.total_amount}
                                    onChange={handleInputChange}
                                    placeholder="Monto Total"
                                    className="p-2 border border-gray-300 rounded-md"
                                    step="0.01"
                                    required
                                />
                                <input
                                    type="number"
                                    name="total_money_entries"
                                    value={form.total_money_entries}
                                    onChange={handleInputChange}
                                    placeholder="Entradas de Dinero"
                                    className="p-2 border border-gray-300 rounded-md"
                                    step="0.01"
                                />
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleInputChange}
                                    className="p-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">Selecciona un estado</option>
                                    {statuses.map((status, index) => (
                                        <option key={index} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="py-2 px-4 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                            >
                                Guardar Venta
                            </button>
                        </form>
                    )}

                    {loading ? (
                        <p>Cargando...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sucursal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entradas de Dinero</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actualizado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th> {/* Nueva columna */}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {Array.isArray(sales) && sales.length > 0 ? (
                                        sales.map((sale) => (
                                            <tr key={sale.sale_id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{sale.sale_id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{sale.branch_id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{sale.customer_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{sale.details}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{sale.payment_method}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{sale.total_amount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{sale.total_money_entries}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{sale.status}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{new Date(sale.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{new Date(sale.updated_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => console.log('Modificar', sale.sale_id)}
                                                        className="py-1 px-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600 mr-2"
                                                    >
                                                        Modificar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(sale.sale_id)}
                                                        className="py-1 px-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                                                    >
                                                        Borrar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="11" className="px-6 py-4 whitespace-nowrap text-center">
                                                No se encontraron ventas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sales;
