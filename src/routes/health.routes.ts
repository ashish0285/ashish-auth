import { Health } from '@auth/controllers/health';
import express, { Router } from 'express';

class HealthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/auth-health', Health.prototype.health);
    return this.router;
  }
}

export const healthRoutes: HealthRoutes = new HealthRoutes();
