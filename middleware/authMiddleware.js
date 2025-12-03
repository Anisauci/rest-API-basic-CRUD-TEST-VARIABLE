// const jwt = require('jsonwebtoken');
// const JWT_SECRET = process.env.JWT_SECRET;

// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (token == null) {
//         return res.status(401).json({ error: 'Akses ditolak, token tidak ditemukan'});
//     }

//     jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
//         if (err) {
//             console.error("JWT Verify Error:", err.message);
//             return res.status(403).json ({ error: 'Token tidak valid atau kadaluarsa'});
//         }
//         req.user = decodedPayload.user;
//         next(); 
//     });
// };

// module.exports = authenticateToken;


// MODIFIKASI UNTUK AUTORISASI BERBASIS PERAN (RBAC)
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-sangat-rahasia';

// Middleware Autentikasi (yang sudah ada)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // PERBAIKAN: split(' ') bukan split('/)
    
    if (token == null) {
        return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
        if (err) {
            return res.status(403).json({ error: 'Token tidak valid' });
        }
        
        req.user = decodedPayload.user; // Sekarang req.user berisi {id, username, role}
        next();
    });
}

// Middleware Autorisasi (BARU)
function authorizeRole(role) {
    return (req, res, next) => {
        // Middleware ini harus dijalankan SETELAH authenticateToken
        if (!req.user) {
            return res.status(401).json({ error: 'Pengguna belum terautentikasi' });
        }
        
        if (req.user.role === role) {
            next(); // Peran cocok, lanjutkan
        } else {
            // Pengguna terautentikasi, tetapi tidak memiliki izin
            return res.status(403).json({ 
                error: 'Akses Dilarang: Peran tidak memadai',
                requiredRole: role,
                currentRole: req.user.role
            });
        }
    };
}

module.exports = {
    authenticateToken,
    authorizeRole
};