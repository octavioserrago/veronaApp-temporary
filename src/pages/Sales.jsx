import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Logo from '../assets/verona-escrito.png';
import { useAuth } from '../context/AuthContext'; // Importa el hook useAuth

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

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const response = await axios.get('http://localhost:3333/sales');
            if (Array.isArray(response.data)) {
                setSales(response.data);
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
        try {
            const response = await axios.get('http://localhost:3333/sales', {
                params: { search: searchTerm }
            });
            if (Array.isArray(response.data)) {
                setSales(response.data);
            } else {
                console.error('Unexpected data format:', response.data);
                setSales([]);
            }
        } catch (error) {
            console.error('Error searching sales:', error);
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
            fetchSales(); // Refresh the sales list
        } catch (error) {
            console.error('Error creating sale:', error);
        }
    };

    // Opciones para el método de pago
    const paymentMethods = ['Efectivo', 'Tarjeta de Crédito', 'Transferencia Bancaria'];

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md">
                <div className="text-center mb-4">
                    <img src={Logo} alt="Logo" className="mx-auto mb-4" />
                </div>

                <div className="mb-6">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="py-2 px-4 text-white bg-green-500 rounded-md hover:bg-green-600"
                    >
                        {showForm ? 'Cancelar' : 'Crear nueva venta'}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="mb-6">
                        <div className="grid grid-cols-1 gap-4 mb-4">

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
                            <input
                                type="text"
                                name="status"
                                value={form.status}
                                onChange={handleInputChange}
                                placeholder="Estado"
                                className="p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <button
                            type="submit"
                            className="py-2 px-4 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                        >
                            Guardar Venta
                        </button>
                    </form>
                )}

                <div className="mb-6 flex space-x-2">
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

                {loading ? (
                    <p>Cargando...</p>
                ) : (
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
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(sale.created_at).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(sale.updated_at).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="px-6 py-4 text-center text-gray-500">No se encontraron ventas</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Sales;

