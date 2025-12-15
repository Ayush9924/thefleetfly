const Joi = require('joi');

/**
 * Validation schema for creating regular maintenance
 */
const createMaintenanceSchema = Joi.object({
  vehicle: Joi.string().required().messages({
    'string.empty': 'Vehicle ID is required',
    'any.required': 'Vehicle ID is required'
  }),
  description: Joi.string().required().min(3).max(500).messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 3 characters',
    'string.max': 'Description must not exceed 500 characters'
  }),
  cost: Joi.number().required().min(0).messages({
    'number.base': 'Cost must be a number',
    'number.min': 'Cost cannot be negative',
    'any.required': 'Cost is required'
  }),
  date: Joi.date().optional(),
  dueDate: Joi.date().optional(),
  status: Joi.string().optional().valid('pending', 'completed').messages({
    'any.only': 'Status must be either pending or completed'
  })
});

/**
 * Validation schema for creating scheduled maintenance
 */
const createScheduledMaintenanceSchema = Joi.object({
  vehicle: Joi.string().required().messages({
    'string.empty': 'Vehicle ID is required',
    'any.required': 'Vehicle ID is required'
  }),
  description: Joi.string().required().min(3).max(500).messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 3 characters',
    'string.max': 'Description must not exceed 500 characters'
  }),
  cost: Joi.number().required().min(0).messages({
    'number.base': 'Cost must be a number',
    'number.min': 'Cost cannot be negative',
    'any.required': 'Cost is required'
  }),
  scheduleType: Joi.string().required().valid('one-time', 'recurring').messages({
    'any.only': 'Schedule type must be either one-time or recurring',
    'any.required': 'Schedule type is required'
  }),
  frequency: Joi.string()
    .optional()
    .when('scheduleType', {
      is: 'recurring',
      then: Joi.required().valid('daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'semi-annual', 'annual'),
      otherwise: Joi.forbidden()
    })
    .messages({
      'any.only': 'Frequency must be one of: daily, weekly, bi-weekly, monthly, quarterly, semi-annual, annual',
      'any.required': 'Frequency is required for recurring maintenance'
    }),
  scheduledDate: Joi.date().required().messages({
    'date.base': 'Scheduled date must be a valid date',
    'any.required': 'Scheduled date is required'
  }),
  recurrenceEndDate: Joi.date()
    .optional()
    .when('scheduleType', {
      is: 'recurring',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    })
    .messages({
      'any.required': 'Recurrence end date is required for recurring maintenance'
    }),
  maintenanceType: Joi.string()
    .optional()
    .valid('routine', 'preventive', 'corrective', 'predictive')
    .messages({
      'any.only': 'Maintenance type must be one of: routine, preventive, corrective, predictive'
    }),
  estimatedDuration: Joi.number().optional().min(0).messages({
    'number.min': 'Estimated duration cannot be negative'
  }),
  priority: Joi.string()
    .optional()
    .valid('low', 'medium', 'high', 'critical')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high, critical'
    }),
  notes: Joi.string().optional().max(1000).messages({
    'string.max': 'Notes must not exceed 1000 characters'
  }),
  estimatedMileage: Joi.number().optional().min(0)
});

/**
 * Validation schema for updating scheduled maintenance
 */
const updateScheduledMaintenanceSchema = Joi.object({
  description: Joi.string().optional().min(3).max(500),
  cost: Joi.number().optional().min(0),
  scheduledDate: Joi.date().optional(),
  nextScheduledDate: Joi.date().optional(),
  estimatedDuration: Joi.number().optional().min(0),
  priority: Joi.string().optional().valid('low', 'medium', 'high', 'critical'),
  notes: Joi.string().optional().max(1000),
  frequency: Joi.string().optional().valid('daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'semi-annual', 'annual'),
  recurrenceEndDate: Joi.date().optional(),
  maintenanceType: Joi.string().optional().valid('routine', 'preventive', 'corrective', 'predictive'),
  estimatedMileage: Joi.number().optional().min(0)
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

/**
 * Validation schema for completing scheduled maintenance
 */
const completeScheduledMaintenanceSchema = Joi.object({
  actualCost: Joi.number().optional().min(0).messages({
    'number.min': 'Actual cost cannot be negative'
  }),
  currentMileage: Joi.number().optional().min(0).messages({
    'number.min': 'Current mileage cannot be negative'
  })
});

/**
 * Validation schema for cancelling scheduled maintenance
 */
const cancelScheduledMaintenanceSchema = Joi.object({
  reason: Joi.string().optional().max(500).messages({
    'string.max': 'Reason must not exceed 500 characters'
  })
});

/**
 * Validation middleware factory
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors: messages
      });
    }

    req.validatedBody = value;
    next();
  };
};

module.exports = {
  createMaintenanceSchema,
  createScheduledMaintenanceSchema,
  updateScheduledMaintenanceSchema,
  completeScheduledMaintenanceSchema,
  cancelScheduledMaintenanceSchema,
  validateRequest
};
