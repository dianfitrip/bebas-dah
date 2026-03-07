import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './adminstyles/AdminDashboard.css'; 

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: 'Admin', role: 'Administrator' });

  // 1. Ambil Data User dari LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          name: parsedUser.name || parsedUser.username || 'Admin',
          role: parsedUser.role || 'Administrator'
        });
      } catch (e) {
        console.error("Gagal parsing data user", e);
      }
    }
  }, []);

  return (
    <header className="top-header" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(7, 30, 61, 0.08)' }}>
      {/* CSS KHUSUS UNTUK UBAH TEKS NAVBAR JADI TEMA BIRU & ORANYE */}
      <style>{`
        /* Judul Sapaan */
        .top-header .header-title h3 {
          color: #071E3D !important; /* Biru Tua */
          font-weight: 700;
          margin-bottom: 2px;
        }
        
        /* Subtitle / Teks kecil di bawah sapaan */
        .top-header .header-title .subtitle {
          color: #182D4A !important; /* Biru Navy untuk teks sekunder */
          font-weight: 500;
        }

        /* Lingkaran Avatar Inisial */
        .top-header .avatar {
          background-color: #CC6B27 !important; /* Oranye */
          color: #FAFAFA !important; /* Teks inisial putih bersih */
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(204, 107, 39, 0.3); /* Shadow oranye tipis */
        }
      `}</style>

      {/* BAGIAN KIRI: SAPAAN */}
      <div className="header-title">
        <h3>Selamat datang, {userData.name}!</h3>
        <p className="subtitle">Semoga harimu menyenangkan di sistem ini.</p>
      </div>
      
      {/* BAGIAN KANAN: PROFIL ONLY */}
      <div className="header-actions">
        
        {/* Area Profil (Klik langsung ke halaman profil) */}
        <div 
          className="user-profile clickable" 
          onClick={() => navigate('/admin/profil')}
          title="Ke Halaman Profil"
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '6px 12px',
            borderRadius: '8px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(204, 107, 39, 0.08)'} // Hover efek oranye transparan
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div className="text-right">
            <span className="name" style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#071E3D' }}>
              {userData.name}
            </span>
            <span className="role" style={{ fontSize: '12px', color: '#182D4A', fontWeight: '500' }}>
              {userData.role}
            </span>
          </div>
          
          <div className="avatar">
            {userData.name.charAt(0).toUpperCase()}
          </div>
        </div>

      </div>
    </header>
  );
};

export default AdminNavbar;