import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/verona-escrito.png';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import jsPDF from 'jspdf';
import { CiFilter } from 'react-icons/ci';
import { IoRefreshCircleOutline, IoReceiptOutline } from 'react-icons/io5';
import mail from "../assets/correo-electronico.png";
import ubicacion from "../assets/ubicacion.png"
import sitioWeb from "../assets/sitio-web.png"
import phone from "../assets/ring-phone.png"

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
        total_money_entries: '',
        total_amount: '',
        status: '',
    });
    const [showForm, setShowForm] = useState(false);
    const [editingSale, setEditingSale] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filter, setFilter] = useState({
        status: '',
        branch_id: branchId || '',
        complete_payment: '',
        created_at: '',
    });
    const [branches, setBranches] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const [blueprintDetails, setBlueprintDetails] = useState([]);
    const [blueprintPhotos, setBlueprintPhotos] = useState([]);
    const [showBlueprintModal, setShowBlueprintModal] = useState(false);


    useEffect(() => {
        if (!logueado) {
            navigate('/');
        }
    }, [logueado, navigate]);

    useEffect(() => {
        fetchBranches();
        fetchSales();
    }, []);

    const fetchSales = async () => {
        setLoading(true);
        setErrorMessage('');

        try {
            const response = await axios.get('http://localhost:3333/sales');
            if (response.data.success && Array.isArray(response.data.results)) {
                if (response.data.results.length === 0) {
                    setErrorMessage('No hubo ventas para mostrar.');
                }
                setSales(response.data.results);
            } else {
                setErrorMessage('Hubo un problema con los datos recibidos.');
                setSales([]);
            }
        } catch (error) {
            setErrorMessage('Error al obtener las ventas. Por favor, intenta de nuevo más tarde.');
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
        setLoading(true);
        setErrorMessage('');
        const isNumber = !isNaN(searchTerm);
        const route = isNumber
            ? `http://localhost:3333/sales/${searchTerm}`
            : `http://localhost:3333/sales/search/${searchTerm}`;

        try {
            const response = await axios.get(route);
            if (response.data.success) {
                if (response.data.results && response.data.results.length === 0) {
                    setErrorMessage('No hubo coincidencias en las ventas con esa búsqueda.');
                }
                setSales(isNumber ? [response.data.result] : response.data.results || []);
            } else {
                setErrorMessage('No se encontraron ventas.');
                setSales([]);
            }
        } catch (error) {
            setErrorMessage('Error al buscar ventas. Por favor, intenta de nuevo más tarde.');
            console.error('Error searching sales:', error);
            setSales([]);
        } finally {
            setLoading(false);
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
        const userConfirmation = window.prompt('Escribe "Borrar" para confirmar la eliminación:');
        if (userConfirmation === 'Borrar') {
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
            total_money_entries: sale.total_money_entries,
            total_amount: sale.total_amount,
            status: sale.status,
        });
        setEditingSale(sale.sale_id);
        setShowForm(true);
    };

    const handleVerPlanos = async (saleId) => {
        try {
            const detailsResponse = await axios.get(`http://localhost:3333/blueprints/sales/${saleId}`);
            const photosResponse = await axios.get(`http://localhost:3333/blueprints/sales/photos/${saleId}`);

            if (detailsResponse.data.success && photosResponse.data.success) {
                setBlueprintDetails(detailsResponse.data.results);
                setBlueprintPhotos(photosResponse.data.results);
            } else {
                setBlueprintDetails([]);
                setBlueprintPhotos([]);
            }

            setShowBlueprintModal(true);
        } catch (error) {
            console.error('Error al obtener los planos:', error);
        }
    };


    const handleCloseModal = () => {
        setShowBlueprintModal(false);
        setBlueprintDetails([]);
        setBlueprintPhotos([]);
    };


    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
    };

    const applyFilters = async () => {
        setLoading(true);
        setErrorMessage('');

        let url = `http://localhost:3333/sales/filter`;

        const params = [
            filter.status ? encodeURIComponent(filter.status) : '',
            filter.branch_id || '',
            filter.complete_payment || '',
            filter.created_at || ''
        ];

        url += `/${params.join('/')}`;
        console.log('Final URL:', url);

        try {
            const response = await axios.get(url);
            if (response.data.success) {
                setSales(response.data.results);
            } else {
                setErrorMessage(response.data.message);
                setSales([]);
            }
        } catch (error) {
            setErrorMessage('Error al obtener las ventas. Por favor, intenta de nuevo más tarde.');
            console.error('Error fetching sales with filters:', error);
            setSales([]);
        } finally {
            setLoading(false);
        }

        setShowFilterModal(false);
    };


    const paymentMethods = ['Efectivo', 'Tarjeta de Crédito', 'Transferencia Bancaria'];
    const statuses = ['En suspenso', 'En produccion', 'Terminado sin entregar', 'Entregado'];

    const loadImage = (imgSrc) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = imgSrc;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${imgSrc}`));
        });
    };

    const handleDescargarComprobante = async (saleId) => {
        try {
            const response = await fetch(`http://localhost:3333/sales/${saleId}`);

            if (!response.ok) {
                throw new Error('Error al obtener los datos de la venta');
            }

            const saleData = await response.json();
            console.log('Datos de la venta:', saleData); // Debug: mostrar datos

            if (!saleData || !saleData.success || !saleData.result) {
                throw new Error('No se encontraron datos para la venta solicitada');
            }

            // Crear una nueva instancia de jsPDF
            const doc = new jsPDF();

            // Datos de la empresa según branchId
            const branchInfo = {
                1: {
                    address: "Juan Bautista Alberdi 3333",
                    phone: "11 5990-6984",
                    email: "marmoleriaverona@gmail.com"
                },
                2: {
                    address: "Juan Bautista Alberdi 3778",
                    phone: "11 6292-2173",
                    email: "localverona@hotmail.com"
                }
            };

            const currentBranch = branchInfo[branchId];

            // Cargar las imágenes de forma asincrónica
            const imgPromises = [
                loadImage(Logo),  // Logo en la parte superior
                loadImage(mail),
                loadImage(ubicacion),
                loadImage(sitioWeb),
                loadImage(phone)
            ];

            const [logoImage, mailImage, pinImage, sitioImage, phoneImage] = await Promise.all(imgPromises);

            // Añadir el logo en la parte superior
            const logoWidth = 80; // Ajusta el tamaño del logo según sea necesario
            const logoHeight = 20; // Ajusta el tamaño del logo según sea necesario
            doc.addImage(logoImage.src, 'PNG', 1, 10, logoWidth, logoHeight); // Logo en la parte superior
            let yOffset = 35; // Ajustar el Y después del logo

            // Otras secciones antes de la información de la empresa
            // Fecha actual
            const today = new Date();
            const formattedDate = today.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            doc.setFontSize(12);
            doc.text(`Fecha: ${formattedDate}`, 10, yOffset);
            yOffset += 10; // Espacio después de la fecha

            // Título
            doc.setFontSize(18);
            doc.text("Comprobante de Venta", 10, yOffset);
            doc.setLineWidth(0.5);
            yOffset += 10; // Incrementar el desplazamiento vertical para el título
            doc.line(10, yOffset, 200, yOffset); // Línea horizontal
            yOffset += 5; // Espaciado después de la línea

            // Detalles de la venta
            doc.setFontSize(12);
            const maxWidth = 190; // Ancho máximo en mm

            // Usar splitTextToSize para cada detalle
            const details = [
                `ID de Venta: ${saleData.result.sale_id}`,
                `Cliente: ${saleData.result.customer_name}`,
                `Detalle: ${saleData.result.details}`,
                `Método de Pago: ${saleData.result.payment_method}`,
                `Dinero del Cliente: $${saleData.result.total_money_entries}`,
                `Importe Total de la Compra: $${saleData.result.total_amount}`
            ];

            details.forEach((detail) => {
                const lines = doc.splitTextToSize(detail, maxWidth);
                doc.text(lines, 10, yOffset);
                yOffset += (lines.length * 10); // Ajusta el espaciado según sea necesario
            });

            // Agregar una línea de separación
            doc.setLineWidth(0.5);
            doc.line(10, yOffset, 200, yOffset); // Línea horizontal
            yOffset += 5; // Espaciado después de la línea

            // Agregar nuevos textos con saltos de línea
            const mensajesAdicionales = [
                "El horario de retiro es de lunes a viernes de 9:00 a 12:00 y de 13:30 a 16:30, sábados de 9:00 a 11:30.",
                "Flete y colocación (en caso de ser solicitado) corren por cuenta del cliente.",
                "Tratándose de un producto natural, deberán admitirse pequeñas variaciones en la tonalidad y el vetado de las mercaderías entregadas con respecto a las muestras exhibidas.",
                "La fecha estimada de terminación no es completamente precisa; para retirar, debe esperar a ser contactado/a por nosotros.",
                "Este documento no es válido como factura."
            ];

            // Espacio entre textos
            mensajesAdicionales.forEach((mensaje) => {
                const lines = doc.splitTextToSize(mensaje, maxWidth);
                doc.text(lines, 10, yOffset);
                yOffset += (lines.length * 10); // Ajusta el espaciado según sea necesario
            });

            // Mensaje de agradecimiento
            doc.setFontSize(12);
            const mensajeAgradecimiento = "¡Gracias por elegirnos! Valoramos tu preferencia y estamos comprometidos a ofrecerte el mejor servicio posible.";
            const linesAgradecimiento = doc.splitTextToSize(mensajeAgradecimiento, maxWidth);
            doc.text(linesAgradecimiento, 10, yOffset);

            // Ahora, establecemos un nuevo yOffset para la información de la empresa
            yOffset += 20; // Aumentar el espacio antes de la información de la empresa

            // Línea de separación
            doc.setLineWidth(0.5);
            doc.line(10, yOffset, 200, yOffset); // Línea horizontal
            yOffset += 5; // Espaciado después de la línea


            // Información de la empresa (izquierda)
            const xOffsetLeft = 10;  // Posición X para el lado izquierdo
            const xOffsetRight = 130; // Posición X para el lado derecho
            const imgWidth = 8; // Ancho de las imágenes
            const imgHeight = 8; // Alto de las imágenes

            // Información de la empresa (izquierda)
            doc.addImage(mailImage.src, 'PNG', xOffsetLeft, yOffset, imgWidth, imgHeight);
            doc.text(currentBranch.email, xOffsetLeft + imgWidth + 5, yOffset + 7);

            yOffset += 15; // Incrementar el desplazamiento vertical para la siguiente imagen
            doc.addImage(phoneImage.src, 'PNG', xOffsetLeft, yOffset, imgWidth, imgHeight);
            doc.text(currentBranch.phone, xOffsetLeft + imgWidth + 5, yOffset + 7);

            // Ahora continuamos con la información de la empresa (derecha)
            yOffset = yOffset - 15; // Ajustar el yOffset para la ubicación y web
            doc.addImage(pinImage.src, 'PNG', xOffsetRight, yOffset, imgWidth, imgHeight);
            doc.text(currentBranch.address, xOffsetRight + imgWidth + 5, yOffset + 7);

            yOffset += 15; // Incrementar el desplazamiento vertical para la siguiente imagen
            doc.addImage(sitioImage.src, 'PNG', xOffsetRight, yOffset, imgWidth, imgHeight);
            doc.text("marmoleriaverona.com.ar", xOffsetRight + imgWidth + 5, yOffset + 7);

            yOffset += 10; // Espacio adicional antes de la línea de separación

            // Guardar el PDF
            doc.save(`comprobante_venta_${saleId}.pdf`);
            setNotification({ message: 'Comprobante descargado exitosamente!', type: 'success' });

        } catch (error) {
            console.error('Error al descargar comprobante:', error);
            setNotification({ message: 'Ocurrió un error al descargar el comprobante.', type: 'error' });
        }
    };



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
                            <button
                                onClick={fetchSales}
                                className="p-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                            >
                                <IoRefreshCircleOutline />
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
                                    required
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
                                    placeholder="Seña del Cliente"
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
                                className="py-2 px-4 text-white bg-green-500 rounded-md hover:bg-green-600 w-full"
                            >
                                {editingSale ? 'Guardar cambios' : 'Crear Venta'}
                            </button>
                        </form>
                    )}

                    {errorMessage && (
                        <div className="mb-4 p-4 bg-red-100 text-red-800 border border-red-300 rounded-md">
                            {errorMessage}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-left">ID</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-left">Sucursal</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-left">Fecha</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-left">Cliente</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-left">Dinero del Cliente Cobrado</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-left">Monto Total</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-left">Estado</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-left">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Cargando...</td>
                                    </tr>
                                ) : sales.length > 0 ? (
                                    sales.map(sale => (
                                        <tr key={sale.sale_id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{sale.sale_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{sale.branch_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(sale.created_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{sale.customer_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">${sale.total_money_entries}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">${sale.total_amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{sale.status}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleEdit(sale)}
                                                    className="text-blue-500 hover:text-blue-700 mr-2"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDescargarComprobante(sale.sale_id)}
                                                    className="text-blue-500 hover:text-blue-700 mr-2"
                                                >
                                                    <IoReceiptOutline />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(sale.sale_id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Eliminar
                                                </button>

                                                <button onClick={() => handleVerPlanos(sale.sale_id)} className="text-green-500 hover:underline ml-2">Ver Planos</button>

                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No se encontraron ventas.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal para mostrar los planos */}
            {showBlueprintModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-medium mb-4">Detalles de Planos</h2>

                        {/* Sección de detalles */}
                        <div className="mb-4">
                            <h3 className="font-medium">Detalles:</h3>
                            <ul>
                                {blueprintDetails.map(detail => (
                                    <React.Fragment key={detail.id}>
                                        <li>{detail.description}</li>
                                    </React.Fragment>
                                ))}
                            </ul>
                        </div>

                        {/* Sección de planos */}
                        {blueprintPhotos.length > 0 ? (
                            <div className="mb-4">
                                <h3 className="font-medium">Planos:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {blueprintPhotos.map((photo, index) => (
                                        <a
                                            key={index} // Usa index si no tienes un id único para cada elemento
                                            href={photo.photo_url} // Aquí usamos photo.photo_url
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            {blueprintDetails[index]?.blueprintCode || `Plano ${index + 1}`} {/* Código del plano o texto por defecto */}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <p className="text-red-500">No hay planos linkeados.</p>
                            </div>
                        )}

                        <button onClick={handleCloseModal} className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600">Cerrar</button>
                    </div>
                </div>
            )}

            {
                showFilterModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-lg font-medium mb-4">Filtrar Ventas</h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <select
                                    name="status"
                                    value={filter.status}
                                    onChange={handleFilterChange}
                                    className="p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Seleccionar estado</option>
                                    {statuses.map(status => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    name="branch_id"
                                    value={filter.branch_id}
                                    onChange={handleFilterChange}
                                    className="p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Seleccionar sucursal</option>
                                    {branches.map(branch => (
                                        <option key={branch} value={branch}>
                                            {branch}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    name="complete_payment"
                                    value={filter.complete_payment}
                                    onChange={handleFilterChange}
                                    className="p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Seleccionar estado de pago</option>
                                    <option value="true">Pago Completo</option>
                                    <option value="false">Pago Incompleto</option>
                                </select>

                                <input
                                    type="date"
                                    name="created_at"
                                    value={filter.created_at}
                                    onChange={handleFilterChange}
                                    className="p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div className="mt-6 flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    className="py-2 px-4 bg-gray-300 rounded-md hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Sales;