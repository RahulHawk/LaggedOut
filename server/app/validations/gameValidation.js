const Joi = require("joi");

const objectId = () => Joi.string().hex().length(24);

const createGameValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(100).required(),
        description: Joi.string().max(2000).allow("", null),

        basePrice: Joi.number().min(0).default(0).required(),
        salePrice: Joi.number().min(0).allow(null),
        onSale: Joi.boolean().default(false),

        screenshots: Joi.array().items(Joi.string().uri()).optional(),
        trailer: Joi.string().uri().allow("", null),
        websiteUrl: Joi.string().uri().allow("", null),
        releaseDate: Joi.date().iso().allow(null),

        bonusContent: Joi.object({
            avatars: Joi.array().items(objectId()).optional()
        }).optional(),

        genre: Joi.array().items(objectId()).min(1).required(),
        tags: Joi.array().items(objectId()).optional(),

        systemRequirements: Joi.object({
            minimum: Joi.string().max(1500).allow("", null),
            recommended: Joi.string().max(1500).allow("", null)
        }).optional(),

        averageRating: Joi.number().min(0).max(5).default(0),
        totalReviews: Joi.number().min(0).default(0),
        starBreakdown: Joi.object({
            5: Joi.number().min(0).default(0),
            4: Joi.number().min(0).default(0),
            3: Joi.number().min(0).default(0),
            2: Joi.number().min(0).default(0),
            1: Joi.number().min(0).default(0)
        }).optional(),

        approved: Joi.boolean().default(false),

        dlcs: Joi.array().items(Joi.object({
            title: Joi.string().min(3).max(100).required(),
            description: Joi.string().max(2000).allow("", null),
            price: Joi.number().min(0).default(0),
            coverImage: Joi.string().uri().allow("", null),
            screenshots: Joi.array().items(Joi.string().uri()).optional(),
            trailer: Joi.string().uri().allow("", null),
            releaseDate: Joi.date().iso().allow(null),
            systemRequirements: Joi.object({
                minimum: Joi.string().max(500).allow("", null),
                recommended: Joi.string().max(500).allow("", null)
            }).optional(),
            bonusContent: Joi.object({
                avatars: Joi.array().items(objectId()).optional()
            }).optional(),
            developer: objectId().required(),
            approved: Joi.boolean().default(false)
        })).optional(),

        editions: Joi.array().items(Joi.object({
            name: Joi.string().min(1).max(100).required(),
            description: Joi.string().max(2000).allow("", null),
            price: Joi.number().min(0).required(),
            coverImage: Joi.string().uri().allow("", null),
            bonusContent: Joi.object({
                avatars: Joi.array().items(objectId()).optional()
            }).optional(),
            includesDLCs: Joi.array().items(objectId()).optional()
        })).optional()
    });

    return schema.validate(data);
};

module.exports = { createGameValidation};
