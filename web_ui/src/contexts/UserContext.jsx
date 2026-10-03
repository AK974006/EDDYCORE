import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Load users from localStorage
        const storedUsers = localStorage.getItem('systemUsers');
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        }

        // Load current user session
        const currentSession = sessionStorage.getItem('currentUser');
        if (currentSession) {
            setCurrentUser(JSON.parse(currentSession));
        } else {
            // Default user for development/bypass login
            const defaultUser = {
                id: 'default-user',
                name: 'Cloud Admin',
                email: 'admin@cloud.os',
                settings: {
                    wallpaper: '/default-wallpaper.jpg',
                    brightness: 100,
                    volume: 70,
                    theme: 'dark',
                },
                storage: {},
            };
            setCurrentUser(defaultUser);
        }
    }, []);

    const saveUsers = (updatedUsers) => {
        localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
    };

    const createUser = (userData) => {
        const newUser = {
            id: Date.now().toString(),
            ...userData,
            createdAt: new Date().toISOString(),
            settings: {
                wallpaper: '/default-wallpaper.jpg',
                brightness: 100,
                volume: 70,
                theme: 'dark',
            },
            storage: {},
        };

        const updatedUsers = [...users, newUser];
        saveUsers(updatedUsers);
        return newUser;
    };

    const loginUser = (user) => {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    };

    const logoutUser = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
    };

    const updateUserSettings = (settings) => {
        if (!currentUser) return;

        const updatedUsers = users.map(u =>
            u.id === currentUser.id
                ? { ...u, settings: { ...u.settings, ...settings } }
                : u
        );

        saveUsers(updatedUsers);

        const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
        setCurrentUser(updatedCurrentUser);
        sessionStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    };

    const updateUserData = (data) => {
        if (!currentUser) return;

        const updatedUsers = users.map(u =>
            u.id === currentUser.id
                ? { ...u, ...data }
                : u
        );

        saveUsers(updatedUsers);

        const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
        setCurrentUser(updatedCurrentUser);
        sessionStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    };

    const getUserByEmail = (email) => {
        return users.find(u => u.email === email);
    };

    const getUserById = (id) => {
        return users.find(u => u.id === id);
    };

    const value = {
        currentUser,
        users,
        createUser,
        loginUser,
        logoutUser,
        updateUserSettings,
        updateUserData,
        getUserByEmail,
        getUserById,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
