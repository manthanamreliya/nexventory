import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
    const location = useLocation();

    // Map paths to page titles
    const getPageTitle = (pathname) => {
        switch (pathname) {
            case '/': return 'Dashboard';
            case '/products': return 'Product Management';
            case '/orders': return 'Orders';
            case '/billing': return 'Billing & Invoicing';
            case '/reports': return 'Sales Reports';
            case '/settings': return 'Settings';
            default: return 'Nexventory';
        }
    };

    return (
        <div className="layout">
            <Sidebar />
            <div className="main-content">
                <Header title={getPageTitle(location.pathname)} />
                <main className="content-area">
                    <Outlet />
                </main>
            </div>

            <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }

        .main-content {
          margin-left: 260px;
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: var(--background);
        }

        .content-area {
          padding: 2rem;
          flex: 1;
          overflow-y: auto;
        }
      `}</style>
        </div>
    );
};

export default Layout;
