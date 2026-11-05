import { join } from 'node:path';
import express, { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { DAO } from './DAO.ts';
import { ClientService, NotFoundError, RentalService, StationService } from './services.ts';

const stations = new StationService();
const clients = new ClientService();
const rentals = new RentalService();

function route(handler: (req: Request, res: Response) => Promise<void>): RequestHandler {
    return (req, res) => DAO.run(() => handler(req, res));
}

export const app = express();
app.use(express.json());
app.use(express.static(join(import.meta.dirname, '..', 'public')));

app.get('/api/stations', route(async (req, res) => {
    res.json(await stations.list());
}));

app.get('/api/stations/:id', route(async (req, res) => {
    res.json(await stations.get(Number(req.params['id'])));
}));

app.post('/api/stations', route(async (req, res) => {
    res.json(await stations.create(req.body));
}));

app.delete('/api/stations/:id', route(async (req, res) => {
    await stations.delete(Number(req.params['id']));
    res.status(204).end();
}));

app.get('/api/rentals', route(async (req, res) => {
    res.json(await rentals.list(Number(req.query['limit'] ?? 10)));
}));

app.get('/api/clients/:id', route(async (req, res) => {
    res.json(await clients.get(Number(req.params['id'])));
}));

app.post('/api/clients', route(async (req, res) => {
    const { favoriteStationIds = [], ...data } = req.body;
    res.json(await clients.register(data, favoriteStationIds, req.query['fail'] === 'true'));
}));

app.delete('/api/clients/:id', route(async (req, res) => {
    await clients.delete(Number(req.params['id']));
    res.status(204).end();
}));

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
    }
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
});
