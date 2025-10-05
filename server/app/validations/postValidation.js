const Joi = require("joi");
const Filter = require("bad-words");
const filter = new Filter();

// Community Post Validation
const createPostValidation = (data) => {
  const schema = Joi.object({
    content: Joi.string().min(5).max(1000).required(),
  });

  const result = schema.validate(data);
  if (result.error) return result;

  if (filter.isProfane(result.value.content)) {
    return { error: { details: [{ message: "Post contains abusive or sexual words" }] } };
  }

  return result;
};

const commentValidation = (data) => {
  const schema = Joi.object({
    text: Joi.string().min(2).max(500).required()
  });

  const result = schema.validate(data);
  if (result.error) return result;

  if (filter.isProfane(result.value.text)) {
    return { error: { details: [{ message: "Comment contains abusive or sexual words" }] } };
  }

  return result;
};

module.exports = { createPostValidation, commentValidation };
