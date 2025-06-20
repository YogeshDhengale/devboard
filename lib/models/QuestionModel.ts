import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestion extends Document {
  title: string;
  description: string;
  author: mongoose.Types.ObjectId;
  tags: string[];
  views: number;
  likes: number;
  dislikes: number;
  createdAt: Date;
  updatedAt: Date;
}


const QUESTION_SCHEMA = new Schema<IQuestion>(
  {
    title: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 100,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const QuestionModel =
  (mongoose.models.Question as Model<IQuestion>) ||
  mongoose.model<IQuestion>("Question", QUESTION_SCHEMA);

export default QuestionModel;
