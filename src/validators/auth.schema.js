import Joi from "joi";

export const forgotSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetSchema = Joi.object({
  token: Joi.string().min(10).required(),
  password: Joi.string().min(8).required(),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().min(10).required(),
});
