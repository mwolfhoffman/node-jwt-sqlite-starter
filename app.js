import express from 'express';
import bodyParser from 'body-parser';
import dao from './repositories/dao';
import { authenticated, authMiddleware, login } from './controllers/auth.controller';
import itemsController from './controllers/items.controller';

const port = 3000;
const app = express();

app.listen(port, () => console.log(`Authentication example app listening on port ${port}!`));

app.use(bodyParser.json());
app.use(authMiddleware);

//  Script to setup DB in memory:
dao.setupDbForDev();

//  Routes
app.post('/login', login);
app.get("/items", authenticated, itemsController.getAllItems);
app.get("/items/:id", authenticated, itemsController.getItemById)
