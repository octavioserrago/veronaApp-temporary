import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const UsersABM = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:4000/users", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(response.data.results || []);
                setLoading(false);
            } catch (err) {
                setError("Error al cargar los usuarios. Inténtelo más tarde.");
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token]);

    const deleteUser = async (userId) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este usuario?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:4000/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(users.filter((user) => user.user_id !== userId));
            alert("Usuario eliminado exitosamente.");
        } catch (error) {
            console.error("Error eliminando usuario:", error);
            alert("Ocurrió un error al eliminar el usuario.");
        }
    };

    if (loading) return <p>Cargando usuarios...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="contenedor">
            <Navbar />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border px-4 py-2">User ID</th>
                            <th className="border px-4 py-2">User Name</th>
                            <th className="border px-4 py-2">Branch ID</th>
                            <th className="border px-4 py-2">Admin</th>
                            <th className="border px-4 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.user_id} className="text-center">
                                <td className="border px-4 py-2">{user.user_id}</td>
                                <td className="border px-4 py-2">{user.user_name}</td>
                                <td className="border px-4 py-2">{user.branch_id}</td>
                                <td className="border px-4 py-2">{user.is_adm ? "Sí" : "No"}</td>
                                <td className="border px-4 py-2">
                                    {!user.is_adm && (
                                        <button
                                            onClick={() => deleteUser(user.user_id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                        >
                                            Borrar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersABM;
