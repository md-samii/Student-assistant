import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodType } from 'zod';

export const validateBody = (schema: ZodType): RequestHandler => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            });
            return;
        }

        req.body = result.data;
        next();
    };
};