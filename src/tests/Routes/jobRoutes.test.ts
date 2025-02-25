import { Router } from 'express';
import { 
  createJob,
  getAllJobs,
  deleteJob,
  updateJob,
  getJobsByEmployer,
  getJobById
} from '../../controllers/jobController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';
import { jobSchema } from '../../validations/jobValidation';

jest.mock('../../controllers/jobController');
jest.mock('../../middleware/authMiddleware');
jest.mock('../../middleware/validationMiddleware');
jest.mock('../../validations/jobValidation');

describe('Job Routes', () => {
  let router: Router;

  beforeEach(() => {
    router = Router();
    require('../../routes/jobRoutes')(router);
  });

  it('should configure POST /jobs route', () => {
    expect(router.post).toHaveBeenCalledWith(
      '/jobs',
      authMiddleware,
      validationMiddleware(jobSchema),
      createJob
    );
  });

  it('should configure GET /jobs route', () => {
    expect(router.get).toHaveBeenCalledWith(
      '/jobs',
      getAllJobs
    );
  });

  it('should configure GET /jobs/:id route', () => {
    expect(router.get).toHaveBeenCalledWith(
      '/jobs/:id',
      getJobById
    );
  });

  it('should configure GET /jobs/employer route', () => {
    expect(router.get).toHaveBeenCalledWith(
      '/jobs/employer',
      authMiddleware,
      getJobsByEmployer
    );
  });

  it('should configure PUT /jobs/:id route', () => {
    expect(router.put).toHaveBeenCalledWith(
      '/jobs/:id',
      authMiddleware,
      validationMiddleware(jobSchema),
      updateJob
    );
  });

  it('should configure DELETE /jobs/:id route', () => {
    expect(router.delete).toHaveBeenCalledWith(
      '/jobs/:id',
      authMiddleware,
      deleteJob
    );
  });

  it('should attach authMiddleware to protected routes', () => {
    expect(authMiddleware).toHaveBeenCalled();
  });

  it('should attach validationMiddleware to routes requiring validation', () => {
    expect(validationMiddleware).toHaveBeenCalledWith(jobSchema);
  });
});
