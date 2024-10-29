import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [logueado, setLogueado] = useState(false);
    const [branchId, setBranchId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const login = (user, accessToken) => {
        setLogueado(true);
        setBranchId(user.branch_id);
        setUserId(user.user_id);
        setUser(user);
        setToken(accessToken);
    };

    const logout = () => {
        setLogueado(false);
        setBranchId(null);
        setUserId(null);
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ logueado, branchId, userId, user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
