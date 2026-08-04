import type { Pastoral } from './pastorais/default-pastorais.data';

declare global {
  namespace Express {
    interface Request {
      pastoralId?: string;
      pastoral?: Pastoral;
    }
  }
}

export {};
