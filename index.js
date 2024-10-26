import express from 'express';
import cors from 'cors';
import chatRoute from './routes/chat.route.js'; 

const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const corsOptions = {
    origin: '*',
    credentials: true,
};

app.use(cors(corsOptions));

app.use("/api/v1", chatRoute);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
