import { useEffect, useMemo, useState } from 'react';

const BACKEND_URL = 'http://localhost:4000/api';

type UserInfo = {
  id: number;
  email: string;
  name: string;
  balance: number;
};

type AuthForm = {
  name: string;
  email: string;
  password: string;
};

type PaymentInfo = {
  amount: number;
  provider: 'PayPal' | 'MobileMoney';
  phoneNumber: string;
  network: 'MTN' | 'AT' | 'Telecel';
};

type Transaction = {
  id: number;
  type: 'deposit' | 'withdraw';
  provider: string;
  amount: number;
  status: string;
  createdAt: string;
  reference?: string;
};

type Page = 'login' | 'register' | 'dashboard';
type DashboardTab = 'deposit' | 'withdraw' | 'profile';

function App() {
  const [page, setPage] = useState<Page>(localStorage.getItem('futurefunds_token') ? 'dashboard' : 'login');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('deposit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('futurefunds_token'));
  const [user, setUser] = useState<UserInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState<AuthForm>({ name: '', email: '', password: '' });
  const [payment, setPayment] = useState<PaymentInfo>({ amount: 0, provider: 'PayPal', phoneNumber: '', network: 'MTN' });

  const authHeaders = useMemo(() => ({ Authorization: token ? `Bearer ${token}` : '' }), [token]);

  const fetchUser = async () => {
    if (!token) return;
    const response = await fetch(`${BACKEND_URL}/transactions/balance`, { headers: { ...authHeaders } });
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
      setPage('dashboard');
    } else {
      setToken(null);
      localStorage.removeItem('futurefunds_token');
      setPage('login');
    }
  };

  const fetchTransactions = async () => {
    if (!token) return;
    const response = await fetch(`${BACKEND_URL}/transactions`, { headers: { ...authHeaders } });
    if (response.ok) {
      const data = await response.json();
      setTransactions(data.transactions ?? []);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUser();
    fetchTransactions();
  }, [token, authHeaders]);

  const handleChange = (field: keyof AuthForm, value: string) => {
    setForm((prev: AuthForm) => ({ ...prev, [field]: value }));
  };

  const submitAuth = async (mode: 'login' | 'register') => {
    setError('');
    setStatusMessage('');
    setLoading(true);

    const payload = mode === 'register'
      ? { name: form.name, email: form.email, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const response = await fetch(`${BACKEND_URL}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Unable to authenticate');
      } else {
        setToken(data.token);
        localStorage.setItem('futurefunds_token', data.token);
        setUser(data.user);
        setPage('dashboard');
        setDashboardTab('deposit');
        setStatusMessage('Welcome to Future Funds. Your account is ready.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setTransactions([]);
    localStorage.removeItem('futurefunds_token');
    setPage('login');
    setDashboardTab('deposit');
    setStatusMessage('');
    setError('');
  };

  const updateBalance = async () => {
    if (!token) return;
    const response = await fetch(`${BACKEND_URL}/transactions/balance`, { headers: { ...authHeaders } });
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
    }
  };

  const submitTransaction = async (type: 'deposit' | 'withdraw') => {
    setError('');
    setStatusMessage('');

    if (!payment.amount || payment.amount <= 0) {
      setError('Enter a valid amount.');
      return;
    }

    const payload: any = {
      amount: payment.amount,
      provider: payment.provider,
    };

    if (payment.provider === 'MobileMoney') {
      payload.network = payment.network;
      payload.phoneNumber = payment.phoneNumber;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/transactions/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Could not complete transaction');
      } else {
        await updateBalance();
        await fetchTransactions();
        setStatusMessage(`Your ${type} request has been processed.`);
        setPayment((prev: PaymentInfo) => ({ ...prev, amount: 0 }));
      }
    } catch (err) {
      setError('Unable to process transaction.');
    } finally {
      setLoading(false);
    }
  };

  const hasToken = Boolean(token);

  return (
    <div className="app-shell">
      <div className="background-layer" />
      <div className="content-shell">
        <header className="topbar">
          <div>
            <span className="brand">Future Funds</span>
            <p className="brand-tag">Investment platform for modern deposits and withdrawals.</p>
          </div>
          <nav>
            <a className="ghost-button" href="/landing/index.html">Landing</a>
            {hasToken && <button className="ghost-button" onClick={handleLogout}>Logout</button>}
          </nav>
        </header>

        {hasToken && user ? (
          <section className="panel dashboard-panel">
            <div className="dashboard-grid">
              <div className="hero-card">
                <div className="hero-meta">
                  <span className="eyebrow">Investment platform</span>
                  <h1>Future Funds dashboard</h1>
                  <p>Track your balance, requests, and payment providers in one secure interface.</p>
                </div>
                <div className="summary-grid">
                  <div className="summary-card">
                    <span>Available balance</span>
                    <strong>${user.balance.toFixed(2)}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Transactions</span>
                    <strong>{transactions.length}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Recent activity</span>
                    <strong>{transactions[0] ? `${transactions[0].type} ${transactions[0].amount.toFixed(2)}` : 'None yet'}</strong>
                  </div>
                </div>
              </div>

              <div className="transaction-card">
                <div className="tab-row">
                  <button className={`tab-button ${dashboardTab === 'deposit' ? 'active' : ''}`} onClick={() => setDashboardTab('deposit')}>
                    Deposit
                  </button>
                  <button className={`tab-button ${dashboardTab === 'withdraw' ? 'active' : ''}`} onClick={() => setDashboardTab('withdraw')}>
                    Withdraw
                  </button>
                  <button className={`tab-button ${dashboardTab === 'profile' ? 'active' : ''}`} onClick={() => setDashboardTab('profile')}>
                    Account
                  </button>
                </div>

                {statusMessage && <div className="status-box">{statusMessage}</div>}
                {error && <div className="error-box">{error}</div>}

                {dashboardTab === 'deposit' && (
                  <>
                    <h2>Deposit funds</h2>
                    <div className="field-group">
                      <label>Amount</label>
                      <input
                        type="number"
                        min="1"
                        value={payment.amount}
                        onChange={(e) => setPayment((prev: PaymentInfo) => ({ ...prev, amount: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="field-group">
                      <label>Provider</label>
                      <select value={payment.provider} onChange={(e) => setPayment((prev: PaymentInfo) => ({ ...prev, provider: e.target.value as PaymentInfo['provider'] }))}>
                        <option value="PayPal">PayPal</option>
                        <option value="MobileMoney">Mobile Money</option>
                      </select>
                    </div>
                    {payment.provider === 'MobileMoney' && (
                      <>
                        <div className="field-group">
                          <label>Network</label>
                          <select value={payment.network} onChange={(e) => setPayment((prev: PaymentInfo) => ({ ...prev, network: e.target.value as PaymentInfo['network'] }))}>
                            <option value="MTN">MTN</option>
                            <option value="AT">AT</option>
                            <option value="Telecel">Telecel</option>
                          </select>
                        </div>
                        <div className="field-group">
                          <label>Phone number</label>
                          <input
                            type="tel"
                            value={payment.phoneNumber}
                            onChange={(e) => setPayment((prev: PaymentInfo) => ({ ...prev, phoneNumber: e.target.value }))}
                            placeholder="e.g. +263771000000"
                          />
                        </div>
                      </>
                    )}
                    {error && <div className="error-box">{error}</div>}
                    <div className="actions-row">
                      <button className="primary-button" onClick={() => submitTransaction('deposit')}>Start deposit</button>
                    </div>
                  </>
                )}

                {dashboardTab === 'withdraw' && (
                  <>
                    <h2>Withdraw funds</h2>
                    <div className="field-group">
                      <label>Amount</label>
                      <input
                        type="number"
                        min="1"
                        value={payment.amount}
                        onChange={(e) => setPayment((prev: PaymentInfo) => ({ ...prev, amount: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="field-group">
                      <label>Provider</label>
                      <select value={payment.provider} onChange={(e) => setPayment((prev: PaymentInfo) => ({ ...prev, provider: e.target.value as PaymentInfo['provider'] }))}>
                        <option value="PayPal">PayPal</option>
                        <option value="MobileMoney">Mobile Money</option>
                      </select>
                    </div>
                    {payment.provider === 'MobileMoney' && (
                      <>
                        <div className="field-group">
                          <label>Network</label>
                          <select value={payment.network} onChange={(e) => setPayment((prev: PaymentInfo) => ({ ...prev, network: e.target.value as PaymentInfo['network'] }))}>
                            <option value="MTN">MTN</option>
                            <option value="AT">AT</option>
                            <option value="Telecel">Telecel</option>
                          </select>
                        </div>
                        <div className="field-group">
                          <label>Phone number</label>
                          <input
                            type="tel"
                            value={payment.phoneNumber}
                            onChange={(e) => setPayment((prev: PaymentInfo) => ({ ...prev, phoneNumber: e.target.value }))}
                            placeholder="e.g. +263771000000"
                          />
                        </div>
                      </>
                    )}
                    {error && <div className="error-box">{error}</div>}
                    <div className="actions-row">
                      <button className="secondary-button" onClick={() => submitTransaction('withdraw')}>Request withdrawal</button>
                    </div>
                  </>
                )}

                {dashboardTab === 'profile' && (
                  <div className="profile-card">
                    <h2>Account details</h2>
                    <div className="field-group">
                      <label>Name</label>
                      <div className="profile-value">{user.name}</div>
                    </div>
                    <div className="field-group">
                      <label>Email</label>
                      <div className="profile-value">{user.email}</div>
                    </div>
                    <div className="field-group">
                      <label>Balance</label>
                      <div className="profile-value">${user.balance.toFixed(2)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="recent-card">
              <div className="recent-header">
                <h3>Recent activity</h3>
                <span>{transactions.length} transactions</span>
              </div>
              {transactions.length ? (
                <div className="transaction-list">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="transaction-row">
                      <div>
                        <span className="transaction-type">{transaction.type}</span>
                        <div className="transaction-subtitle">{transaction.provider} • {new Date(transaction.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="transaction-meta">
                        <span className="transaction-amount">${transaction.amount.toFixed(2)}</span>
                        <span className={`transaction-status ${transaction.status}`}>{transaction.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No recent activity yet. Start by making your first deposit.</p>
              )}
            </div>
          </section>
        ) : (
          <section className="panel auth-panel">
            <div className="auth-form">
              <div className="auth-tabs">
                <button className={`tab-button ${page === 'login' ? 'active' : ''}`} onClick={() => setPage('login')}>
                  Sign in
                </button>
                <button className={`tab-button ${page === 'register' ? 'active' : ''}`} onClick={() => setPage('register')}>
                  Register
                </button>
              </div>
              <div className="form-header">
                <h1>{page === 'login' ? 'Sign in securely' : 'Create your account'}</h1>
                <p>{page === 'login' ? 'Access your Future Funds dashboard.' : 'Register to manage your investments.'}</p>
              </div>

              {page === 'register' && (
                <label>
                  Name
                  <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
                </label>
              )}

              <label>
                Email
                <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
              </label>
              <label>
                Password
                <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} />
              </label>

              {error && <div className="error-box">{error}</div>}
              <button className="primary-button" onClick={() => submitAuth(page)} disabled={loading}>
                {loading ? 'Processing…' : page === 'login' ? 'Sign in' : 'Register'}
              </button>

              <div className="form-switch">
                {page === 'login' ? (
                  <span>
                    New here? <button onClick={() => setPage('register')}>Create account</button>
                  </span>
                ) : (
                  <span>
                    Already a member? <button onClick={() => setPage('login')}>Sign in</button>
                  </span>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
