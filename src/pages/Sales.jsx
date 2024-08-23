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
    const [editingSale, setEditingSale] = useState(null); // Nuevo estado
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
            if (editingSale) {
                await axios.put(`http://localhost:3333/sales/${editingSale}`, form);
            } else {
                await axios.post('http://localhost:3333/sales', form);
            }

            setShowForm(false);
            setEditingSale(null); // Resetear el estado de edición
            fetchSales();
        } catch (error) {
            console.error('Error al guardar la venta:', error);
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

    const handleEdit = (sale) => {
        setForm({
            branch_id: sale.branch_id,
            customer_name: sale.customer_name,
            details: sale.details,
            payment_method: sale.payment_method,
            total_amount: sale.total_amount,
            total_money_entries: sale.total_money_entries,
            status: sale.status,
        });
        setEditingSale(sale.sale_id);
        setShowForm(true);
    };

    const paymentMethods = ['Efectivo', 'Tarjeta de Crédito', 'Transferencia Bancaria'];
    const statuses = ['En suspenso', 'En producción'];

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
                                    <option value="">Seleccionar método de pago</option>
                                    {paymentMethods.map((method) => (
                                        <option key={method} value={method}>
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
                                    required
                                />
                                <input
                                    type="number"
                                    name="total_money_entries"
                                    value={form.total_money_entries}
                                    onChange={handleInputChange}
                                    placeholder="Entradas de Dinero Totales"
                                    className="p-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleInputChange}
                                    className="p-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">Seleccionar estado</option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="py-2 px-4 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                            >
                                {editingSale ? 'Guardar Cambios' : 'Guardar Venta'}
                            </button>
                        </form>
                    )}

                    <div className="overflow-x-auto">
                        {loading ? (
                            <p>Cargando ventas...</p>
                        ) : (
                            <table className="min-w-full bg-white rounded-md shadow-md overflow-hidden">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 bg-gray-200">ID</th>
                                        <th className="py-2 px-4 bg-gray-200">Cliente</th>
                                        <th className="py-2 px-4 bg-gray-200">Detalles</th>
                                        <th className="py-2 px-4 bg-gray-200">Método de Pago</th>
                                        <th className="py-2 px-4 bg-gray-200">Monto Total</th>
                                        <th className="py-2 px-4 bg-gray-200">Entradas de Dinero</th>
                                        <th className="py-2 px-4 bg-gray-200">Estado</th>
                                        <th className="py-2 px-4 bg-gray-200">Fecha de Creación</th>
                                        <th className="py-2 px-4 bg-gray-200">Fecha de Actualización</th>
                                        <th className="py-2 px-4 bg-gray-200">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.map((sale) => (
                                        <tr key={sale.sale_id}>
                                            <td className="py-2 px-4 border-b">{sale.sale_id}</td>
                                            <td className="py-2 px-4 border-b">{sale.customer_name}</td>
                                            <td className="py-2 px-4 border-b">{sale.details}</td>
                                            <td className="py-2 px-4 border-b">{sale.payment_method}</td>
                                            <td className="py-2 px-4 border-b">{sale.total_amount}</td>
                                            <td className="py-2 px-4 border-b">{sale.total_money_entries}</td>
                                            <td className="py-2 px-4 border-b">{sale.status}</td>
                                            <td className="py-2 px-4 border-b">{new Date(sale.created_at).toLocaleDateString()}</td>
                                            <td className="py-2 px-4 border-b">{new Date(sale.updated_at).toLocaleDateString()}</td>
                                            <td className="py-2 px-4 border-b">
                                                <button
                                                    onClick={() => handleEdit(sale)}
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
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;
