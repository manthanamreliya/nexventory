import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Save, Calculator } from 'lucide-react';
import { useNexventory } from '../context/NexventoryContext';

const Billing = () => {
    const { products, addOrder, formatCurrency } = useNexventory();
    const [billId, setBillId] = useState('');
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
    const [items, setItems] = useState([
        { id: Date.now(), productId: '', price: 0, quantity: 1, total: 0 }
    ]);
    const [grandTotal, setGrandTotal] = useState(0);

    useEffect(() => {
        generateBillId();
    }, []);

    useEffect(() => {
        calculateGrandTotal();
    }, [items]);

    const generateBillId = () => {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        setBillId(`INV-${timestamp}-${random}`);
    };

    const calculateGrandTotal = () => {
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setGrandTotal(total);
    };

    const handleProductChange = (index, productId) => {
        const product = products.find(p => p.id === productId);
        const newItems = [...items];
        newItems[index].productId = productId;
        newItems[index].name = product ? product.name : '';
        newItems[index].price = product ? product.price : 0;
        newItems[index].total = newItems[index].quantity * (product ? product.price : 0);
        setItems(newItems);
    };

    const handleQuantityChange = (index, quantity) => {
        const newItems = [...items];
        newItems[index].quantity = parseInt(quantity) || 0;
        newItems[index].total = newItems[index].quantity * newItems[index].price;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { id: Date.now(), productId: '', price: 0, quantity: 1, total: 0 }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const handleSubmit = () => {
        if (!customer.name || items.some(i => !i.productId)) {
            alert('Please fill in customer name and select products');
            return;
        }

        const newOrder = {
            id: `ORD-${Date.now()}`,
            billId,
            customer,
            items: items.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.total
            })),
            totalAmount: grandTotal, // Store as number for stats
            date: new Date().toISOString(),
            status: 'Completed'
        };

        addOrder(newOrder);

        alert('Order created successfully and saved to history!');
        // Reset form
        setCustomer({ name: '', phone: '', email: '' });
        setItems([{ id: Date.now(), productId: '', price: 0, quantity: 1, total: 0 }]);
        generateBillId();
    };

    return (
        <div className="page-container">
            <div className="billing-header">
                <div>
                    <h2>New Invoice</h2>
                    <p className="text-muted">Create a new bill for customer</p>
                </div>
                <div className="bill-id-badge">
                    {billId}
                </div>
            </div>

            <div className="billing-grid">
                {/* Customer Details */}
                <div className="card customer-section">
                    <h3>Customer Details</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Customer Name</label>
                            <input
                                type="text"
                                placeholder="Enter name"
                                value={customer.name}
                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                placeholder="Enter phone"
                                value={customer.phone}
                                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email (Optional)</label>
                            <input
                                type="email"
                                placeholder="Enter email"
                                value={customer.email}
                                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Product Items */}
                <div className="card items-section">
                    <div className="items-header">
                        <h3>Order Items</h3>
                        <button className="btn btn-primary btn-sm" onClick={addItem}>
                            <Plus size={16} /> Add Item
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40%' }}>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>
                                            <select
                                                value={item.productId}
                                                onChange={(e) => handleProductChange(index, e.target.value)}
                                                className="product-select"
                                            >
                                                <option value="">Select Product</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} ({formatCurrency(p.price)})
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>{formatCurrency(item.price)}</td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                className="qty-input"
                                            />
                                        </td>
                                        <td className="font-bold">{formatCurrency(item.total)}</td>
                                        <td>
                                            <button
                                                className="icon-btn-danger"
                                                onClick={() => removeItem(index)}
                                                disabled={items.length === 1}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary & Actions */}
                <div className="card summary-section">
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>{formatCurrency(grandTotal)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Tax (10%)</span>
                        <span>{formatCurrency(grandTotal * 0.1)}</span>
                    </div>
                    <div className="summary-total">
                        <span>Grand Total</span>
                        <span>{formatCurrency(grandTotal * 1.1)}</span>
                    </div>

                    <div className="action-buttons-large">
                        <button className="btn btn-outline" onClick={() => window.print()}>
                            <Printer size={20} /> Print
                        </button>
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            <Save size={20} /> Generate Bill
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        .billing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .bill-id-badge {
          background-color: var(--surface);
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          font-family: monospace;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
          border: 1px solid var(--border);
        }

        .billing-grid {
          display: grid;
          gap: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .items-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .items-table td {
          vertical-align: middle;
        }

        .product-select {
          min-width: 200px;
        }

        .qty-input {
          width: 80px;
        }

        .icon-btn-danger {
          color: var(--danger);
          padding: 4px;
          border-radius: 4px;
        }

        .icon-btn-danger:hover {
          background-color: #fee2e2;
        }

        .icon-btn-danger:disabled {
          color: var(--text-muted);
          cursor: not-allowed;
          background: none;
        }

        .summary-section {
          background-color: var(--surface);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: flex-end;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          width: 300px;
          color: var(--text-muted);
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          width: 300px;
          padding-top: 1rem;
          border-top: 2px solid var(--border);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .action-buttons-large {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          width: 300px;
        }
        
        .action-buttons-large button {
          flex: 1;
        }
      `}</style>
        </div>
    );
};

export default Billing;
