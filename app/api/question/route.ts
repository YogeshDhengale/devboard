import { NextRequest, NextResponse } from "next/server";
import QuestionModel from "@/lib/models/QuestionModel";
import { ConnectDB } from "@/lib/config/db";

const LoadDB = async () => {
    await ConnectDB();
}

LoadDB();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, author, tags } = body;

    const question = await QuestionModel.create({ title, description, author, tags });
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Create question error:", error);
    return NextResponse.json({ message: "Failed to create question" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const questions = await QuestionModel.aggregate([
      // Lookup author details
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
      // Lookup answer count
      {
        $lookup: {
          from: "answers",
          localField: "_id",
          foreignField: "question",
          as: "answers",
        },
      },
      {
        $addFields: {
          answerCount: { $size: "$answers" },
        },
      },
      {
        $project: {
          "author.password": 0,
          "author.__v": 0,
          answers: 0, // Don't include answer documents, only count
          __v: 0,
        },
      },
      {
        $sort: { createdAt: -1 }, // Optional: sort newest first
      },
    ]);
    console.log("Fetched questions:", questions);
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Get all questions error:", error);
    return NextResponse.json({ message: "Failed to fetch questions" }, { status: 500 });
  }
}
