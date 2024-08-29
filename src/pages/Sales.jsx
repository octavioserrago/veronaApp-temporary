import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/verona-escrito.png';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { CiFilter } from 'react-icons/ci';

const Sales = () => {
    const { branchId, logueado } = useAuth();
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
    const [editingSale, setEditingSale] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filter, setFilter] = useState({
        status: '',
        branch_id: branchId || '',
        complete_payment: '',
        start_date: '',
        end_date: '',
    });
    const [branches, setBranches] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!logueado) {
            navigate('/');
        }
    }, [logueado, navigate]);

    useEffect(() => {
        fetchSales();
        fetchBranches();
    }, [filter]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3333/sales', { params: filter });
            if (response.data.success && Array.isArray(response.data.results)) {
                setSales(response.data.results);
            } else {
                console.error('Unexpected data format:', response.data);
                setSales([]);
            }
        } catch (error) {
            console.error('Error fetching sales:', error);
            setSales([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await axios.get('http://localhost:3333/branches');
            if (response.data.success && Array.isArray(response.data.results)) {
                setBranches(response.data.results.map(branch => branch.branch_id));
            } else {
                console.error('Unexpected data format:', response.data);
                setBranches([]);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            setBranches([]);
        }
    };

    const handleSearch = async () => {
        const isNumber = !isNaN(searchTerm);
        const route = isNumber
            ? `http://localhost:3333/sales/${searchTerm}`
            : `http://localhost:3333/sales/search/${searchTerm}`;

        try {
            const response = await axios.get(route);
            if (response.data.success) {
                setSales(isNumber ? [response.data.result] : response.data.results || []);
            } else {
                setSales([]);
            }
        } catch (error) {
            console.error('Error searching sales:', error);
            setSales([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({ ...prevForm, [name]: value }));
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
            setEditingSale(null);
            fetchSales();
        } catch (error) {
            console.error('Error saving sale:', error);
        }
    };

    const handleDelete = async (sale_id) => {
        if (window.confirm('Escribe "Borrar" para confirmar la eliminación:') === 'Borrar') {
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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
    };

    const applyFilters = () => {
        fetchSales();
        setShowFilterModal(false);
    };

    const paymentMethods = ['Efectivo', 'Tarjeta de Crédito', 'Transferencia Bancaria'];
    const statuses = ['En suspenso', 'En producción', 'Terminado sin entregar', 'Entregado'];

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
                            onClick={() => setShowForm(prev => !prev)}
                            className="py-2 px-4 text-white bg-green-500 rounded-md hover:bg-green-600"
                        >
                            {showForm ? 'Cancelar' : 'Crear nueva venta'}
                        </button>

                        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                            <button
                                onClick={() => setShowFilterModal(true)}
                                className="p-2 text-white bg-gray-500 rounded-md hover:bg-gray-600"
                            >
                                <CiFilter />
                            </button>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md w-full md:w-auto"
                                placeholder="Buscar ventas..."
                            />
                            <button
                                onClick={handleSearch}
                                className="py-2 px-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 w-full md:w-auto"
                            >
                                Buscar
                            </button>
                        </div>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} className="mb-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
                                <input
                                    type="text"
                                    name="customer_name"
                                    value={form.customer_name}
                                    onChange={handleInputChange}
                                    placeholder="Nombre del Cliente"
                                    className="p-2 border border-gray-300 rounded-md w-full"
                                    required
                                />
                                <input
                                    type="text"
                                    name="details"
                                    value={form.details}
                                    onChange={handleInputChange}
                                    placeholder="Detalles"
                                    className="p-2 border border-gray-300 rounded-md w-full"
                                />
                                <select
                                    name="payment_method"
                                    value={form.payment_method}
                                    onChange={handleInputChange}
                                    className="p-2 border border-gray-300 rounded-md w-full"
                                    required
                                >
                                    <option value="">Seleccionar método de pago</option>
                                    {paymentMethods.map(method => (
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
                                    className="p-2 border border-gray-300 rounded-md w-full"
                                    required
                                />
                                <input
                                    type="number"
                                    name="total_money_entries"
                                    value={form.total_money_entries}
                                    onChange={handleInputChange}
                                    placeholder="Entradas de Dinero"
                                    className="p-2 border border-gray-300 rounded-md w-full"
                                    required
                                />
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleInputChange}
                                    className="p-2 border border-gray-300 rounded-md w-full"
                                    required
                                >
                                    <option value="">Seleccionar estado</option>
                                    {statuses.map(status => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="py-2 px-4 text-white bg-green-500 rounded-md hover:bg-green-600 w-full md:w-auto"
                            >
                                {editingSale ? 'Actualizar venta' : 'Crear venta'}
                            </button>
                        </form>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entradas de Dinero</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">Cargando...</td>
                                    </tr>
                                ) : sales.length > 0 ? (
                                    sales.map(sale => (
                                        <tr key={sale.sale_id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{sale.sale_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{sale.customer_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{sale.details}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{sale.payment_method}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{sale.total_amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{sale.total_money_entries}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{sale.status}</td>
                                            <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(sale)}
                                                    className="py-1 px-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                                >
                                                    Editar
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
                                        <td colSpan="8" className="text-center py-4">No se encontraron ventas.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showFilterModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
                            <h2 className="text-lg font-semibold mb-4">Filtrar Ventas</h2>
                            <div className="mb-4">
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={filter.status}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                >
                                    <option value="">Todos</option>
                                    {statuses.map(status => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="branch_id" className="block text-sm font-medium text-gray-700">Sucursal</label>
                                <select
                                    id="branch_id"
                                    name="branch_id"
                                    value={filter.branch_id}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                >
                                    <option value="">Todas</option>
                                    {branches.map(branch => (
                                        <option key={branch} value={branch}>
                                            {branch}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="complete_payment" className="block text-sm font-medium text-gray-700">Pago Completo</label>
                                <select
                                    id="complete_payment"
                                    name="complete_payment"
                                    value={filter.complete_payment}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                >
                                    <option value="">Todos</option>
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                                <input
                                    id="start_date"
                                    name="start_date"
                                    type="date"
                                    value={filter.start_date}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                                <input
                                    id="end_date"
                                    name="end_date"
                                    type="date"
                                    value={filter.end_date}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={applyFilters}
                                    className="py-2 px-4 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                >
                                    Aplicar Filtros
                                </button>
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    className="ml-2 py-2 px-4 text-white bg-gray-500 rounded-md hover:bg-gray-600"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sales;
