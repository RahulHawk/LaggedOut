const Joi = require("joi");

// User registration validation
const registerValidation = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().min(2).max(50).required(),
        lastName: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string()
            .when("authProvider", {
                is: "local",
                then: Joi.string()
                    .pattern(new RegExp(
                        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\\d!@#$%^&*(),.?":{}|<>]{8,}$'
                    ))
                    .required()
                    .messages({
                        'string.pattern.base': 'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.'
                    }),
                otherwise: Joi.optional().allow(null, "")
            }),
        authProvider: Joi.string().valid("local", "google").default("local"),
        role: Joi.string().hex().length(24)
    });

    return schema.validate(data);
};

// User login validation
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    return schema.validate(data);
};

// Profile update validation
const profileValidation = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().min(2).max(50),
        lastName: Joi.string().min(3).max(50),
        userName: Joi.string().alphanum().min(3).max(20),
        avatarUrl: Joi.string().uri(),
        bio: Joi.string().max(500),
        theme: Joi.string().valid("light", "dark").default("light"),
        showcaseGames: Joi.alternatives().try(
            Joi.array().items(Joi.string().hex().length(24)),
            Joi.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    if (Array.isArray(parsed)) return parsed;
                } catch { }
                return helpers.error('any.invalid');
            }, 'JSON string to array parser')
        ),
        selectedAvatar: Joi.string().hex().length(24),
        privacy: Joi.string().valid("public", "friends", "private").default("public")
    });
    return schema.validate(data);
};

module.exports = { registerValidation, loginValidation, profileValidation };
