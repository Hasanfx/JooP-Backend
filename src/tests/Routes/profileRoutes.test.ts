import { Router } from 'express';
import { 
  getProfile,
  createProfile,
  updateProfile
} from '../../controllers/profileController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';
import { profileCreationSchema } from '../../validations/profileValidation';

jest.mock('../../controllers/profileController');
jest.mock('../../middleware/authMiddleware');
jest.mock('../../middleware/validationMiddleware');
jest.mock('../../validations/profileValidation');

describe('Profile Routes', () => {
  let router: Router;

  beforeEach(() => {
    router = Router();
    require('../../routes/profileRoute')(router);
  });

  it('should configure GET /profile route', () => {
    expect(router.get).toHaveBeenCalledWith(
      '/profile',
      authMiddleware,
      getProfile
    );
  });

  it('should configure POST /profile route', () => {
    expect(router.post).toHaveBeenCalledWith(
      '/profile',
      authMiddleware,
      validationMiddleware(profileCreationSchema),
      createProfile
    );
  });

  it('should configure PUT /profile route', () => {
    expect(router.put).toHaveBeenCalledWith(
      '/profile',
      authMiddleware,
      validationMiddleware(profileCreationSchema),
      updateProfile
    );
  });

  it('should attach authMiddleware to protected routes', () => {
    expect(authMiddleware).toHaveBeenCalled();
  });

  it('should attach validationMiddleware to routes requiring validation', () => {
    expect(validationMiddleware).toHaveBeenCalledWith(profileCreationSchema);
  });
});
