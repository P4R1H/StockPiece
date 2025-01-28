import express from 'express'
import { 
  addAdmin,
  adminLogin
} from '../controllers/admin.controllers.js';
import { verifyAdminJWT } from '../middlewares/auth.middlewares.js';

const adminRouter = express.Router();

adminRouter
  .route('/login')
  .post(adminLogin)

//protected routes
adminRouter.use(verifyAdminJWT)

adminRouter
  .route('/add-admin')
  .post(addAdmin)

export default adminRouter;