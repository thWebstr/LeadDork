import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import Joi from 'joi';

const router = express.Router();

const authSchemas = {
  register: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

router.post('/register', validateRequest(authSchemas.register), register);
router.post('/login', validateRequest(authSchemas.login), login);

export default router;
