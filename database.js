require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const DB_MOVIES = process.env.DB_MOVIES || "movies.db";
const DB_DIRECTORS = process.env.DB_DIRECTORS || "directors.db";

// Database connection for movies
const dbMovies = new sqlite3.Database(DB_MOVIES, (err) => {
  if (err) {
    console.error("error connect ke movies.db",err.message);
    throw err;
  } else {
    console.log('Connected to the movies.db');

    dbMovies.run(`CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT not null, 
            director TEXT not null, 
            year INTEGER not null
        )`, (err) => {
      if (!err) {
        console.log("Table 'movies' created.seeding initial data...");
        const insert = 'INSERT INTO movies (title, director, year) VALUES (?,?,?)';
        dbMovies.run(insert, ["Inception", "Christopher Nolan", 2010]);
        dbMovies.run(insert, ["The Dark Knight", "Christopher Nolan", 2008]);
        dbMovies.run(insert, ["Interstellar", "Christopher Nolan", 2014]);
      }
    });
  }
});

// Create users table // MODIFIKASI UNTUK AUTENTIKASI (ROLE)
dbMovies.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
    )`, (err) => {
  if (err) {
    console.error("Gagal membuat tabel users:", err.message);
  }
  else {
    console.log("Tabel user siap digunakan.");
  }
});

// Database connection for directors
const dbDirectors = new sqlite3.Database(DB_DIRECTORS, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log('Connected to the directors.db');

    dbDirectors.run(`CREATE TABLE IF NOT EXISTS directors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT not null, 
            birthyear TEXT not null
        )`, (err) => {
      if (!err) {
        console.log("Table 'directors' created.seeding initial data...");
        const insert = 'INSERT INTO directors (name, birthyear) VALUES (?,?)';
        dbDirectors.run(insert, ["Anisa Suci Rahmawati", 2005]);
        dbDirectors.run(insert, ["Tio Krisna Mukti", 2005]);
        dbDirectors.run(insert, ["Husnul Alisah",2005]);
      }
    });
  }
});

module.exports = { dbMovies, dbDirectors };