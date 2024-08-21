const express = require('express');
const NodeCache = require('node-cache');
const axios = require('axios');
const path = require('path');

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // TTL (Time To Live) de 5 minutos

const API_KEY = '1f37eaf564cc4c59abd182224242108'; // Substitua pela sua chave de API da WeatherAPI
const BASE_URL = "http://api.weatherapi.com/v1/current.json";

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index',{ weather: null, error: null });
});

app.get('/weather', async (req, res) => {
    const city = req.query.city;

    if (!city) {
        return res.render('index', { weather:null, error: "Please, insert a city name." });
    }

    const cachedData = cache.get(city);
    if (cachedData) {
        return res.render('index', { weather: cachedData , error: null});
    }

    try {
        const response = await axios.get(BASE_URL, {
            params: {
                key: API_KEY,
                q: city
            }
        });

        const data = {
            city: response.data.location.name,
            temperature: response.data.current.temp_c,
            description: response.data.current.condition.text
        };

        cache.set(city, data); // Armazenar no cache
        res.render('index', { weather: data , error: null});
    } catch (error) {
        res.render('index', { error: "It was not possible to retrieve the data from the API." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running in port  ${PORT}`);
});
