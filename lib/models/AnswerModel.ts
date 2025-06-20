import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnswer extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ANSWER_SCHEMA = new Schema<IAnswer>(
  {
    content: {
      type: String,
      required: true,
      minlength: 10,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ✅ Correct way to safely reuse the model if already defined
const AnswerModel =
  (mongoose.models.Answer as Model<IAnswer>) ||
  mongoose.model<IAnswer>("Answer", ANSWER_SCHEMA);

export default AnswerModel;
