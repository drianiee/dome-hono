import express from 'express';
import dotenv from 'dotenv';
import cors from './middleware/cors';
import authRoutes from './src/routes/authRoutes';  
import dashboardRoutes from './src/routes/dashboardRoutes';  
import employeeRoutes from './src/routes/employeeRoutes'; 
import mutationRoutes from './src/routes/mutationRoutes'; 
import ratingRoutes from './src/routes/ratingRoutes'; 
import userRoutes from './src/routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const data = require('./src/utils/units.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: '*',
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
};

app.use(cors(corsOptions));

app.use(authRoutes);
app.use(dashboardRoutes);
app.use(employeeRoutes);
app.use(mutationRoutes);
app.use(ratingRoutes);
app.use(userRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Yeay! Server is successfully running on port: ${port}`);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get('/unit-dropdown', (req, res) => {
    res.json(data);
});