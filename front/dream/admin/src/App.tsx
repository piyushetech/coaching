import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });

interface Location {
  address?: string;
  city?: string;
  state?: string;
  area?: string;
  zipCode?: string;
}

interface UserRef {
  email: string;
  createdAt?: string;
  isEmailVerified?: boolean;
}

interface NannyItem {
  _id: string;
  fullName: string;
  phone?: string;
  profilePicture?: string;
  aboutMe?: string;
  experienceYears?: number;
  location?: Location;
  pricingType?: string;
  hourlyRate?: number;
  dailyRate?: number;
  monthlySalary?: number;
  rating?: number;
  reviewCount?: number;
  adminApprovalStatus?: string;
  user?: UserRef;
}

interface ParentItem {
  _id: string;
  fullName: string;
  phone?: string;
  profilePicture?: string;
  budget?: number;
  location?: Location;
  user?: UserRef;
}

const formatLocation = (location?: Location) => {
  if (!location) return 'Not provided';
  return [location.address, location.area, location.city, location.state].filter(Boolean).join(', ') || 'Not provided';
};

const formatRate = (n: NannyItem) => {
  if (n.pricingType === 'daily') return `₹${(n.dailyRate || 0).toLocaleString()}/day`;
  if (n.pricingType === 'monthly') return `₹${(n.monthlySalary || 0).toLocaleString()}/mo`;
  return `₹${(n.hourlyRate || 0).toLocaleString()}/hr`;
};

const Avatar = ({ name, photo, size = 72 }: { name: string; photo?: string; size?: number }) => (
  photo ? (
    <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: 12, objectFit: 'cover' }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: 12, background: '#DBEAFE',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, color: '#2563EB',
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
);

const ProfileCard = ({
  name,
  photo,
  email,
  rows,
  actions,
  badge,
}: {
  name: string;
  photo?: string;
  email?: string;
  rows: { label: string; value: string }[];
  actions?: React.ReactNode;
  badge?: string;
}) => (
  <div style={{
    background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0',
  }}>
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <Avatar name={name} photo={photo} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, color: '#0F172A' }}>{name}</h3>
          {badge && (
            <span style={{ padding: '2px 10px', borderRadius: 999, background: '#FEF3C7', fontSize: 12, color: '#92400E' }}>
              {badge}
            </span>
          )}
        </div>
        {email && <p style={{ color: '#64748B', margin: '4px 0 12px', fontSize: 14 }}>{email}</p>}
        <div style={{ display: 'grid', gap: 6 }}>
          {rows.map((row) => (
            <div key={row.label} style={{ display: 'flex', gap: 8, fontSize: 14 }}>
              <span style={{ color: '#64748B', minWidth: 90, fontWeight: 600 }}>{row.label}:</span>
              <span style={{ color: '#334155', flex: 1 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
      {actions && <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{actions}</div>}
    </div>
  </div>
);

const StatCard = ({ title, value, color }: { title: string; value: number; color?: string }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flex: 1, minWidth: 180 }}>
    <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>{title}</p>
    <h2 style={{ color: color || '#2563EB', fontSize: 32, margin: '8px 0 0' }}>{value}</h2>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0, totalParents: 0, totalNannies: 0,
    pendingNannies: 0, totalHires: 0, monthlyHires: 0, pendingReports: 0,
  });
  const [pendingNannies, setPendingNannies] = useState<NannyItem[]>([]);
  const [allNannies, setAllNannies] = useState<NannyItem[]>([]);
  const [parents, setParents] = useState<ParentItem[]>([]);
  const [reports, setReports] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState('dashboard');

  const headers = { Authorization: `Bearer ${token}` };

  const login = async () => {
    setLoginError('');
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (data.data.user.role !== 'admin') {
        setLoginError('Admin access only.');
        return;
      }
      localStorage.setItem('adminToken', data.data.accessToken);
      setToken(data.data.accessToken);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      setLoginError(message);
    }
  };

  const loadData = async () => {
    const [statsRes, nanniesRes, allNanniesRes, parentsRes, reportsRes] = await Promise.all([
      api.get('/admin/dashboard', { headers }),
      api.get('/admin/nannies/pending', { headers }),
      api.get('/admin/nannies', { headers }),
      api.get('/admin/parents', { headers }),
      api.get('/admin/reports', { headers }),
    ]);
    setStats(statsRes.data.data);
    setPendingNannies(nanniesRes.data.data);
    setAllNannies(allNanniesRes.data.data);
    setParents(parentsRes.data.data);
    setReports(reportsRes.data.data);
  };

  useEffect(() => { if (token) loadData().catch(console.error); }, [token]);

  const approveNanny = async (id: string) => {
    await api.patch(`/admin/nannies/${id}/approve`, {}, { headers });
    loadData();
  };

  const rejectNanny = async (id: string) => {
    await api.patch(`/admin/nannies/${id}/reject`, {}, { headers });
    loadData();
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ background: '#fff', padding: 40, borderRadius: 16, width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <h1 style={{ color: '#2563EB', marginBottom: 8 }}>NannyConnect Admin</h1>
          <p style={{ color: '#64748B', marginBottom: 24 }}>Sign in to manage the platform</p>
          {loginError && (
            <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 14 }}>
              {loginError}
            </div>
          )}
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          <button onClick={login} style={btnStyle}>Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      <aside style={{ width: 240, background: '#2563EB', color: '#fff', padding: 24 }}>
        <h2 style={{ marginBottom: 32 }}>NannyConnect</h2>
        {['dashboard', 'nannies', 'parents', 'reports'].map((t) => (
          <div key={t} onClick={() => setTab(t)} style={{
            padding: '12px 16px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
            background: tab === t ? 'rgba(255,255,255,0.2)' : 'transparent',
            textTransform: 'capitalize',
          }}>{t}</div>
        ))}
        <button onClick={() => { localStorage.removeItem('adminToken'); setToken(''); }} style={{ ...btnStyle, marginTop: 32, background: 'rgba(255,255,255,0.2)' }}>Logout</button>
      </aside>

      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        {tab === 'dashboard' && (
          <>
            <h1 style={{ color: '#0F172A', marginBottom: 24 }}>Dashboard</h1>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
              <StatCard title="Total Users" value={stats.totalUsers} />
              <StatCard title="Parents" value={stats.totalParents} />
              <StatCard title="Nannies" value={stats.totalNannies} />
              <StatCard title="Pending Approvals" value={stats.pendingNannies} color="#F59E0B" />
              <StatCard title="Total Hires" value={stats.totalHires} color="#22C55E" />
              <StatCard title="Monthly Hires" value={stats.monthlyHires} color="#22C55E" />
              <StatCard title="Pending Reports" value={stats.pendingReports} color="#EF4444" />
            </div>

            <h2 style={{ color: '#0F172A', marginBottom: 16 }}>Featured Nannies</h2>
            {allNannies.slice(0, 6).map((n) => (
              <ProfileCard
                key={n._id}
                name={n.fullName}
                photo={n.profilePicture}
                email={n.user?.email}
                badge={n.adminApprovalStatus}
                rows={[
                  { label: 'Phone', value: n.phone || 'Not provided' },
                  { label: 'Address', value: formatLocation(n.location) },
                  { label: 'Experience', value: `${n.experienceYears || 0} years` },
                  { label: 'Rate', value: formatRate(n) },
                  { label: 'Rating', value: `${(n.rating || 0).toFixed(1)} (${n.reviewCount || 0} reviews)` },
                ]}
              />
            ))}
            {allNannies.length === 0 && <p style={{ color: '#64748B' }}>No nannies yet</p>}
          </>
        )}

        {tab === 'nannies' && (
          <>
            <h1 style={{ color: '#0F172A', marginBottom: 8 }}>Nanny Profiles</h1>
            <p style={{ color: '#64748B', marginBottom: 24 }}>{pendingNannies.length} pending approval</p>

            {pendingNannies.length > 0 && (
              <>
                <h2 style={{ color: '#0F172A', marginBottom: 16 }}>Pending Approval</h2>
                {pendingNannies.map((n) => (
                  <ProfileCard
                    key={n._id}
                    name={n.fullName}
                    photo={n.profilePicture}
                    email={n.user?.email}
                    badge="pending"
                    rows={[
                      { label: 'Phone', value: n.phone || 'Not provided' },
                      { label: 'Address', value: formatLocation(n.location) },
                      { label: 'Experience', value: `${n.experienceYears || 0} years` },
                      { label: 'About', value: n.aboutMe || 'Not provided' },
                      { label: 'Rate', value: formatRate(n) },
                    ]}
                    actions={
                      <>
                        <button onClick={() => approveNanny(n._id)} style={{ ...btnStyle, width: 'auto', background: '#22C55E', padding: '8px 16px' }}>Approve</button>
                        <button onClick={() => rejectNanny(n._id)} style={{ ...btnStyle, width: 'auto', background: '#EF4444', padding: '8px 16px' }}>Reject</button>
                      </>
                    }
                  />
                ))}
              </>
            )}

            <h2 style={{ color: '#0F172A', marginBottom: 16, marginTop: 24 }}>All Nannies</h2>
            {allNannies.map((n) => (
              <ProfileCard
                key={`all-${n._id}`}
                name={n.fullName}
                photo={n.profilePicture}
                email={n.user?.email}
                badge={n.adminApprovalStatus}
                rows={[
                  { label: 'Phone', value: n.phone || 'Not provided' },
                  { label: 'Address', value: formatLocation(n.location) },
                  { label: 'Experience', value: `${n.experienceYears || 0} years` },
                  { label: 'About', value: n.aboutMe || 'Not provided' },
                  { label: 'Rate', value: formatRate(n) },
                ]}
              />
            ))}
            {allNannies.length === 0 && <p style={{ color: '#64748B' }}>No nannies found</p>}
          </>
        )}

        {tab === 'parents' && (
          <>
            <h1 style={{ color: '#0F172A', marginBottom: 24 }}>Parent Profiles</h1>
            {parents.map((p) => (
              <ProfileCard
                key={p._id}
                name={p.fullName}
                photo={p.profilePicture}
                email={p.user?.email}
                rows={[
                  { label: 'Phone', value: p.phone || 'Not provided' },
                  { label: 'Address', value: formatLocation(p.location) },
                  { label: 'Budget', value: p.budget != null ? `₹${p.budget.toLocaleString()}/mo` : 'Not set' },
                  { label: 'Verified', value: p.user?.isEmailVerified ? 'Yes' : 'No' },
                ]}
              />
            ))}
            {parents.length === 0 && <p style={{ color: '#64748B' }}>No parents found</p>}
          </>
        )}

        {tab === 'reports' && (
          <>
            <h1 style={{ color: '#0F172A', marginBottom: 24 }}>User Reports</h1>
            {reports.map((r: { _id: string; reason: string; status: string; description?: string }) => (
              <div key={r._id} style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12 }}>
                <strong>{r.reason}</strong>
                <span style={{ marginLeft: 12, padding: '2px 8px', borderRadius: 4, background: '#FEF3C7', fontSize: 12 }}>{r.status}</span>
                {r.description && <p style={{ color: '#64748B', marginTop: 8 }}>{r.description}</p>}
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #E2E8F0',
  marginBottom: 12, fontSize: 14, boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  width: '100%', padding: '12px', borderRadius: 8, border: 'none',
  background: '#2563EB', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14,
};
