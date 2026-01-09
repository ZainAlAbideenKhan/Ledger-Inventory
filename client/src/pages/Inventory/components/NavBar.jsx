import './NavBar.css';

export default function NavBar({ ledgerName, activeTab, onTabChange }) {
  return (
    <nav className="inventory-navbar">
      <div className="nav-left">
        <span className="nav-logo">Ledger Inventory</span>
        <span className="nav-ledger-name">{ledgerName}</span>
      </div>

      <div className="nav-center">
        <button
          className={activeTab === 'store' ? 'active' : ''}
          onClick={() => onTabChange('store')}
        >
          Store
        </button>
        <button
          className={activeTab === 'consumed' ? 'active' : ''}
          onClick={() => onTabChange('consumed')}
        >
          Consumed
        </button>
      </div>

      <div className="nav-right">
        <button
          onClick={() => (window.location.href = '/dashboard')}
        >
          Dashboard
        </button>
      </div>
    </nav>
  );
}
