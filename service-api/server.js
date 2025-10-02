const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

require('dotenv').config();

const port = process.env.PORT || 5001;
const db = require('./src/models/index');
const api = require('./src/routes/index');
const { syncAll } = require('./src/services/meiliSync.service');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(morgan('dev'));
app.use('/api', api);

app.get('/', (req, res) => {
    res.send('Hello world');
});


async function startServer() {
    try {
        if (process.env.SYNC_MEILI === 'true') {
            await syncAll();
        }

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Lỗi khi khởi động server hoặc đồng bộ Meilisearch:', error);
    }
}

startServer();