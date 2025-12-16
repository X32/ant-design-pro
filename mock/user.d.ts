import type { Request, Response } from 'express';
declare function getFakeCaptcha(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare const _default: {
    'GET /api/currentUser': (_req: Request, res: Response) => void;
    'GET /api/users': {
        key: string;
        name: string;
        age: number;
        address: string;
    }[];
    'POST /api/login/account': (req: Request, res: Response) => Promise<void>;
    'GET /api/login/account': (req: Request, res: Response) => Promise<void>;
    'POST /api/login/outLogin': (_req: Request, res: Response) => void;
    'POST /api/register': (_req: Request, res: Response) => void;
    'GET /api/500': (_req: Request, res: Response) => void;
    'GET /api/404': (_req: Request, res: Response) => void;
    'GET /api/403': (_req: Request, res: Response) => void;
    'GET /api/401': (_req: Request, res: Response) => void;
    'GET  /api/login/captcha': typeof getFakeCaptcha;
};
export default _default;
