import React from 'react';
import { Bell, User } from 'lucide-react';

const Header = ({ title }) => {
    return (
        <header className="header">
            <h1 className="page-title">{title}</h1>

            <div className="header-actions">
                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="badge">3</span>
                </button>
                <div className="user-profile">
                    <div className="avatar">
                        <User size={20} />
                    </div>
                    <span className="user-name">Admin User</span>
                </div>
            </div>

            <style>{`
        .header {
          height: 64px;
          background-color: var(--surface);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 5;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .icon-btn {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: background-color 0.2s;
        }

        .icon-btn:hover {
          background-color: var(--background);
          color: var(--text-main);
        }

        .badge {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background-color: var(--danger);
          border-radius: 50%;
          border: 1px solid var(--surface);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius);
          cursor: pointer;
        }

        .user-profile:hover {
          background-color: var(--background);
        }

        .avatar {
          width: 36px;
          height: 36px;
          background-color: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-name {
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--text-main);
        }
      `}</style>
        </header>
    );
};

export default Header;
