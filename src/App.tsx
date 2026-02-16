import { useState } from 'react';
import { User } from './types';
import { LoginPage } from './components/LoginPage';
import { Layout, Page } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DeliveriesPage } from './components/DeliveriesPage';
import { DriversPage } from './components/DriversPage';
import { ClientsPage } from './components/ClientsPage';
import { FinancialPage } from './components/FinancialPage';
import { SettingsPage } from './components/SettingsPage';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'deliveries':
        return <DeliveriesPage />;
      case 'drivers':
        return <DriversPage />;
      case 'clients':
        return <ClientsPage />;
      case 'financial':
        return <FinancialPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <Layout
      user={user}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}
