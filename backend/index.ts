import next from 'next';
import express, {NextFunction} from 'express';
import log from "@backend/log";

const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
    const server = express();

    server.all('*', (req, res) => {
        return handle(req, res);
    });

    /*server.use(
        (
            err: { status: number; message: string; errors: string[] },
            _req: Request,
            res: Response,
            // We must provide a next function for the function signature here even though its not used
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _next: NextFunction
        ) => {
            // format error
            res.status(err.status || 500).json({
                message: err.message,
                errors: err.errors,
            });
        }
    );*/

    const port = Number(process.env.PORT) || 3232;
    const host = process.env.HOST;
    if (host) {
        server.listen(port, host, () => {
            log.info(`Server ready on ${host} port ${port}`, {
                label: 'Server',
            });
        });
    } else {
        server.listen(port, () => {
            log.info(`Server ready on port ${port}`, {
                label: 'Server',
            });
        });
    }
})
    .catch((err) => {
        log.error(err.stack);
        process.exit(1);
    });
