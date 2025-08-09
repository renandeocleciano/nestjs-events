import { randomUUID } from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';

type NodeRequest = IncomingMessage & { headers: Record<string, string | string[] | undefined> };

export function correlationIdMiddleware(req: NodeRequest, res: ServerResponse, next: () => void): void {
  const headerName = 'x-correlation-id';
  const existingHeader = req.headers[headerName];
  const existing: string | undefined = Array.isArray(existingHeader)
    ? (existingHeader[0] as string | undefined)
    : (existingHeader as string | undefined);
  const correlationId: string = existing ?? randomUUID();
  req.headers[headerName] = correlationId;
  res.setHeader(headerName, correlationId);
  next();
}

