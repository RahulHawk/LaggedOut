const Joi = require("joi");
const Filter = require("bad-words");
const filter = new Filter();

// Forum thread validation
const createForumValidation = (data) => {
  const schema = Joi.object({
    gameId: Joi.string().hex().length(24).required(), 
    type: Joi.string().valid("discussion", "announcement").default("discussion"),
    title: Joi.string().min(5).max(200).required(),
    content: Joi.string().min(10).max(3000).required()
  });

  const result = schema.validate(data);
  if (result.error) return result;

  if (filter.isProfane(result.value.title) || filter.isProfane(result.value.content)) {
    return { error: { details: [{ message: "Forum post contains abusive or sexual words" }] } };
  }

  return result;
};

// Forum comment validation
const forumCommentValidation = (data) => {
  const schema = Joi.object({
    text: Joi.string().min(2).max(1000).required()
  });

  const result = schema.validate(data);
  if (result.error) return result;

  if (filter.isProfane(result.value.text)) {
    return { error: { details: [{ message: "Forum comment contains abusive or sexual words" }] } };
  }

  return result;
};

module.exports = { createForumValidation, forumCommentValidation };
