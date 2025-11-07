require('dotenv').config();
console.log("SERVER INI YANG SEDANG BERJALAN:", __filename);
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbMovies, dbDirectors } = require('./database.js');
const authenticateToken = require('./middleware/authMiddleware');
const app = express();
const port = process.env.PORT || 3100;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());


// Middleware untuk autentikasi token diimport dari ./middleware/authMiddleware.js

//dummy data (id,title,director,year)
// let movies = [
//     { id: 1, title: 'LOTR', director: 'Peter Jackson', year: 1999 },
//     { id: 2, title: 'avenger', director: 'Peter Jackson', year: 2010 },
//     { id: 3, title: 'spiderman-', director: 'Peter Jackson', year: 2004 },
// ];

// let director = [
//     { id: 1, name: 'Peter Jackson' },
//     { id: 2, name: 'Peter Jackson' },
//     { id: 3, name: 'Peter Jackson' },
// ];

// console.log(movies);



// app.get('/', (req, res) => {
//     res.send('Selamat Datang diserver Node.js Tahap awal, terimakasih');
// });


app.get('/status', (req, res) => {
        res.json({
            status: 'OK',
            message: 'Server is running',
            timestamp: new Date()
        });
    }
);

//get ID
app.get('/movies/:id', (req, res) => {
    const sql = "SELECT * FROM movies WHERE id = ? ";
    dbMovies.get(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ "error": err.message });
        if (!rows) return res.status(404).json({ "error": "Movie not found" });
        res.json(rows);
    });
});

//get all data
app.get('/movies', (req, res) => {
    const sql = "SELECT * FROM movies ORDER BY ID ASC";
    dbMovies.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        res.json(rows);
    });

});

//post data tambahkan authenticateToken
app.post('/movies', authenticateToken, (req, res) => {
    const { title, director, year } = req.body;

    // Validasi input
    if (!title || !director || !year) {
        return res.status(400).json({ error: "title, director, and year are required" });
    }

    const sql = `INSERT INTO movies (title, director, year) VALUES (?, ?, ?)`;
    const params = [title, director, year];

    dbMovies.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            id: this.lastID,
            title,
            director,
            year
        });
    });
});


//update data tambahkan authenticateToken
app.put('/movies/:id', authenticateToken, (req, res) => {
    const { title, director, year } = req.body;
    dbMovies.run(
        "UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?",
        [title, director, year, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ update: this.changes });
        }
    );
});

//delete data tambahkan authenticateToken
app.delete('/movies/:id', authenticateToken, (req, res) => {
    dbMovies.run("DELETE FROM movies WHERE id = ?",req.params.id,function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ delete: this.changes });
        }
    );
});

//get all data directors
app.get("/directors", (req, res) => {
    dbDirectors.all ("SELECT * FROM directors",[], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json(rows);
    });
});

//get ID directors
app.get('/directors/:id', (req, res) => {
    dbDirectors.get ("SELECT * FROM directors WHERE id = ? ",[req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ "error": err.message });
        if (!rows) return res.status(404).json({ "error": "Director not found" });
        res.json(rows);
    });
});

app.put('/directors/:id', (req, res) => {
    const { name,birthyear } = req.body;
    dbDirectors.run(
        "UPDATE directors SET name = ?, birthyear = ? WHERE id = ?",
        [name,birthyear,req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ update: this.changes });
        }
    );
});

app.post('/directors', (req, res) => {
    const { name,birthyear } = req.body;
dbDirectors.run(`INSERT INTO directors (name,birthyear) VALUES (?, ?)`,
        [name,birthyear],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, name,birthyear });
        }
    );
});

app.delete('/directors/:id', (req, res) => {
    dbDirectors.run("DELETE FROM directors WHERE id = ?",req.params.id,function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ delete: this.changes });
        }
    );
});
    


//===AUTH ROUTES===
app.post('/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || password.length < 6) {
        return res.status(400).json({ error: 'Username dan password (min 6 char) harus diisi' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Error hashing:", err);
            return res.status(500).json({ error: 'Gagal memproses pendaftaran' });
        }

        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
        const params = [username.toLowerCase(), hashedPassword];
        
        dbMovies.run(sql, params, function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Username sudah digunakan' });
                }
                return res.status(500).json({ error: 'Gagal mendaftarkan pengguna' });
            }
            res.status(201).json({ message: 'Pengguna berhasil didaftarkan', userId: this.lastID });
        });
    });
});

// Login route
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({error: 'Username dan password harus diisi'});
    }

    const sql = "SELECT * FROM users WHERE username = ?";
    dbMovies.get(sql, [username.toLowerCase()], (err, user) => {
        if (err || !user) {
            return res.status(401).json({error: 'Kredensial tidak valid'});
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({error: 'Kredensial tidak valid'});
            }

            const payload = {
                user: {id: user.id, username: user.username}};

            jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                if (err) {
                    console.error("Error signing token:", err);
                    return res.status(500).json({error: 'Gagal membuat token'});
                }
                res.json({message: 'Login berhasil', token: token});
            });
        });
    });
});


//handle 404
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

//information server listening
app.listen(port, () => {
    console.log(`Server Running on localhost:  ${port}`);
});
