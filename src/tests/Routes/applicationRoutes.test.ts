import { Router } from 'express';
import applicationRoute from '../../routes/applicationRoute';
import { 
  applyForJob,
  updateApplicationStatus,
  getApplicationsForJob,
  getApplicationsForJobSeeker
} from '../../controllers/applicationController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';
import { applicationSchema } from '../../validations/applicationValidation';

jest.mock('../../controllers/applicationController');
jest.mock('../../middleware/authMiddleware', () => {
  return jest.fn((req, res, next) => next());
});
jest.mock('../../middleware/validationMiddleware');
jest.mock('../../validations/applicationValidation');

describe('Application Routes', () => {
  let router: Router;

  beforeEach(() => {
    router = Router();
    applicationRoute(router);
  });

  it('should configure POST /applications route', () => {
    expect(router.post).toHaveBeenCalledWith(
      '/applications',
      authMiddleware,
      validationMiddleware(applicationSchema),
      applyForJob
    );
  });

  it('should configure PUT /applications/:id/status route', () => {
    expect(router.put).toHaveBeenCalledWith(
      '/applications/:id/status',
      authMiddleware,
      updateApplicationStatus
    );
  });

  it('should configure GET /applications/job/:jobId route', () => {
    expect(router.get).toHaveBeenCalledWith(
      '/applications/job/:jobId',
      authMiddleware,
      getApplicationsForJob
    );
  });

  it('should configure GET /applications/job-seeker route', () => {
    expect(router.get).toHaveBeenCalledWith(
      '/applications/job-seeker',
      authMiddleware,
      getApplicationsForJobSeeker
    );
  });

  it('should attach authMiddleware to protected routes', () => {
    expect(authMiddleware).toHaveBeenCalled();
  });

  it('should attach validationMiddleware to routes requiring validation', () => {
    expect(validationMiddleware).toHaveBeenCalledWith(applicationSchema);
  });
});
