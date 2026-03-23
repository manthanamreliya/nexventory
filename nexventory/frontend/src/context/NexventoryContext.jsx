import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockProducts, mockOrders, initialStats } from '../data/mockData';

const NexventoryContext = createContext();

export const useNexventory = () => useContext(NexventoryContext);

export const NexventoryProvider = ({ children }) => {
    // Theme State
    const [darkMode, setDarkMode] = useState(() => {
        try {
            return localStorage.getItem('theme') === 'dark';
        } catch (e) {
            return false;
        }
    });

    // Data State
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(initialStats);
    const [currency, setCurrency] = useState('INR');
    const [loading, setLoading] = useState(true);

    const getHeaders = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return {
            'Content-Type': 'application/json',
            ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {})
        };
    };

    // Fetch data from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, ordersRes] = await Promise.all([
                    fetch('http://localhost:5000/api/products', { headers: getHeaders() }),
                    fetch('http://localhost:5000/api/orders', { headers: getHeaders() })
                ]);

                if (!productsRes.ok || !ordersRes.ok) {
                    throw new Error('Authorized backend fetch failed');
                }

                const productsData = await productsRes.json();
                const ordersData = await ordersRes.json();

                setProducts(Array.isArray(productsData) ? productsData : []);
                setOrders(Array.isArray(ordersData) ? ordersData : []);
            } catch (error) {
                console.error("Failed to fetch data from backend, defaulting to empty arrays", error);
                setProducts([]);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Theme Effect
    useEffect(() => {
        if (darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const refreshProducts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/products', { headers: getHeaders() });
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Failed to refresh products", error);
        }
    };

    useEffect(() => {
        localStorage.setItem('products', JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem('orders', JSON.stringify(orders));
    }, [orders]);

    // Update Stats Effect
    useEffect(() => {
        updateStats();
    }, [products, orders]);

    // Actions
    const toggleDarkMode = () => setDarkMode(prev => !prev);

    const addProduct = async (product) => {
        try {
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(product)
            });
            const data = await response.json();
            setProducts(prev => [data, ...prev]);
        } catch (error) {
            console.error("Failed to add product to backend", error);
            // Fallback for offline usage
            const newProduct = { ...product, id: `PROD-${Date.now().toString().slice(-4)}` };
            setProducts(prev => [newProduct, ...prev]);
        }
    };

    const updateProduct = async (id, updates) => {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(updates)
            });
            const data = await response.json();
            setProducts(prev => prev.map(p => p.id === id ? data : p));
        } catch (error) {
            console.error("Failed to update product in backend", error);
            setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        }
    };

    const deleteProduct = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Failed to delete product from backend", error);
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    const addOrder = async (order) => {
        try {
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(order)
            });
            const data = await response.json();
            
            if (response.ok) {
                setOrders(prev => [data, ...prev]);
                // Refresh products to show updated stock
                await refreshProducts();
            } else {
                alert(data.message || "Failed to place order");
            }
        } catch (error) {
            console.error("Failed to add order to backend", error);
            // Fallback
            setOrders(prev => [order, ...prev]);
        }
    };

    const updateStats = () => {
        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);
        
        const getLocalYYYYMMDD = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const todayStr = getLocalYYYYMMDD(new Date());

        const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

        let todayRevenue = 0;
        const todayCustomers = new Set();

        const weekLabels = [];
        const weekData = [];
        const monthLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const monthData = [0, 0, 0, 0];
        const monthOrdersData = [0, 0, 0, 0];

        const tempDate = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(tempDate);
            d.setDate(tempDate.getDate() - i);
            weekLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            weekData.push(0);
        }

        orders.forEach(order => {
            const orderTotal = order.totalAmount || order.total || 0;
            const orderDateStr = getLocalYYYYMMDD(new Date(order.date));

            if (orderDateStr === todayStr) {
                todayRevenue += orderTotal;
                const customerIdentifier = order.customer?.name || order.customer;
                if (customerIdentifier) todayCustomers.add(customerIdentifier);
            }

            const oDate = new Date(order.date);
            oDate.setHours(0, 0, 0, 0);
            const diffTime = todayMidnight - oDate;
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 6 && diffDays >= 0) {
                const index = 6 - diffDays;
                if (index >= 0 && index < 7) {
                    weekData[index] += orderTotal;
                }
            }

            if (diffDays <= 27 && diffDays >= 0) {
                const weekIndex = 3 - Math.floor(diffDays / 7);
                if (weekIndex >= 0 && weekIndex < 4) {
                    monthData[weekIndex] += orderTotal;
                    monthOrdersData[weekIndex] += 1;
                }
            }
        });

        setStats({
            totalStock,
            todayRevenue,
            todayCustomers: todayCustomers.size,
            totalOrders: orders.length,
            monthOrdersData,
            salesData: {
                weekly: {
                    labels: weekLabels,
                    datasets: [{
                        label: 'Sales (₹)',
                        data: weekData,
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                        tension: 0.4,
                    }]
                },
                monthly: {
                    labels: monthLabels,
                    datasets: [{
                        label: 'Sales (₹)',
                        data: monthData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                    }]
                }
            }
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <NexventoryContext.Provider value={{
            darkMode,
            toggleDarkMode,
            products,
            addProduct,
            updateProduct,
            deleteProduct,
            orders,
            addOrder,
            stats,
            currency,
            formatCurrency
        }}>
            {children}
        </NexventoryContext.Provider>
    );
};
