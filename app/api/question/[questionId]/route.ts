import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/lib/config/db";
import mongoose from "mongoose";
import QuestionModel from "@/lib/models/QuestionModel";

const LoadDB = async () => {
  await ConnectDB();
};

LoadDB();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await context.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return NextResponse.json(
        { message: "Invalid question ID" },
        { status: 400 }
      );
    }

    // Increment view count
    await QuestionModel.updateOne({ _id: questionId }, { $inc: { views: 1 } });

    const result = await QuestionModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(questionId),
        },
      },
      // Join with User collection to get author info
      {
        $lookup: {
          from: "users", // ⚠️ make sure your collection name is 'users' (lowercase plural)
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author", // Since it's a one-to-one
      },
      // Join with answers collection to get answer count
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
          answers: 0, // Remove answer documents
          "author.password": 0, // Never expose sensitive data
          "author.__v": 0,
        },
      },
    ]);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching question by ID:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await context.params;
    const { action } = await req.json();
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return NextResponse.json(
        { message: "Invalid question ID" },
        { status: 400 }
      );
    }

    if (action !== "like" && action !== "dislike") {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    // Perform the update
    const update =
      action === "like" ? { $inc: { likes: 1 } } : { $inc: { dislikes: 1 } };

    const updatedQuestion = await QuestionModel.findByIdAndUpdate(
      questionId,
      update,
      { new: true }
    );

    if (!updatedQuestion) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Question ${action}d successfully`,
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { message: "Failed to update question" },
      { status: 500 }
    );
  }
}