require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

app.get('/', (req, res) => res.send('Gara backend running'));

app.listen(port, () => console.log(`Server running on port ${port}`));
