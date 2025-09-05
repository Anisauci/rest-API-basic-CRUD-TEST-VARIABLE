const express = require('express');
const app = express();
const port = 3100;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Lagi belajar Node.js');
});

let movies = [
    { id: 1, tittle: 'Barbie', director: 'Hello World', year: 1980 },
    { id: 2, tittle: 'Avenger', director: 'Peter Jackson', year: 2010 },
    { id: 3, tittle: 'Frozen', director: 'Kristen Steward', year: 2004 },
];

let people = [
    { id: 1, name: 'Anisa Suci Rahmawati', birthyear: 2005 },
    { id: 2, name: 'Nobita', birthyear: 1999 },
    { id: 3, name: 'Sakura', birthyear: 2001 },
];

// === MOVIES ===
app.get('/movies', (req, res) => {
    res.json(movies);
});

app.get('/movies/:id', (req, res) => {
    const movie = movies.find(m => m.id === parseInt(req.params.id));
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).send('Movie not found');
    }
});

app.post('/movies', (req, res) => {
    const { tittle, director, year } = req.body || {};
    if (!tittle || !director || !year) {
        return res.status(400).json({ error: 'Tittle, director, and year wajib diisi' });
    }

    const newMovie = { id: movies.length + 1, tittle, director, year };
    movies.push(newMovie);
    res.status(201).json(newMovie);
});

app.put('/movies/:id', (req, res) => {
    const id = Number(req.params.id);
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex === -1) {
        return res.status(404).json({ error: 'Movie tidak ditemukan' });
    }
    const { tittle, director, year } = req.body || {};
    const updatedMovie = { id, tittle, director, year };
    movies[movieIndex] = updatedMovie;
    res.json(updatedMovie);
});

app.delete('/movies/:id', (req, res) => {
    const id = Number(req.params.id);
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex === -1) {
        return res.status(404).json({ error: 'Movie tidak ditemukan' });
    }
    movies.splice(movieIndex, 1);
    res.status(204).send();
});

// === PEOPLE ===
app.get('/people', (req, res) => {
    res.json(people);
});

app.get('/people/:id', (req, res) => {
    const id = Number(req.params.id);
    const person = people.find(p => p.id === parseInt(req.params.id));
    if (person) {
        res.json(person);
    } else {
        res.status(404).send('Person not found');
    }
});

app.post('/people', (req, res) => {
    const { name, birthyear } = req.body || {};
    if (!name || !birthyear) {
        return res.status(400).json({ error: 'Name dan birthyear wajib diisi' });
    }

    const newPerson = { id: people.length + 1, name, birthyear };
    people.push(newPerson);
    res.status(201).json(newPerson);
});

app.put('/people/:id', (req, res) => {
    const id = Number(req.params.id);
    const personIndex = people.findIndex(p => p.id === id);
    if (personIndex === -1) {
        return res.status(404).json({ error: 'Person tidak ditemukan' });
    }
    const { name, birthyear } = req.body || {};
    const updatedPerson = { id, name, birthyear };
    people[personIndex] = updatedPerson;
    res.json(updatedPerson);
});

app.delete('/people/:id', (req, res) => {
    const id = Number(req.params.id);
    const personIndex = people.findIndex(p => p.id === id);
    if (personIndex === -1) {
        return res.status(404).json({ error: 'Person tidak ditemukan' });
    }
    people.splice(personIndex, 1);
    res.status(204).send();
});

// === ERROR HANDLING ===
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

app.listen(port, () => {
    console.log(`Server berjalan pada localhost:${port}`);
});