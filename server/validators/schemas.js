import Joi from 'joi';

export const searchSchemas = {
  generate: Joi.object({
    query: Joi.string().min(3).max(500).required()
      .messages({
        'string.min': 'Search query must be at least 3 characters long',
        'any.required': 'Search query is required'
      })
  }),
  
  scrape: Joi.object({
    dork: Joi.string().required(),
    original_query: Joi.string().allow('', null),
    time_filter: Joi.string().valid('qdr:d', 'qdr:w', 'qdr:m', 'qdr:y', null).allow(null)
  })
};

export const leadSchemas = {
  create: Joi.object({
    name: Joi.string().required(),
    linkedin_url: Joi.string().uri().required(),
    title: Joi.string().allow('', null),
    company: Joi.string().allow('', null),
    location: Joi.string().allow('', null),
    notes: Joi.string().allow('', null),
    tags: Joi.array().items(Joi.string()).default([])
  })
};
