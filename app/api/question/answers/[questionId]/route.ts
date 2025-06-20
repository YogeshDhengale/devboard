import { ConnectDB } from "@/lib/config/db";
import AnswerModel from "@/lib/models/AnswerModel";
import { NextRequest, NextResponse } from "next/server";
import "@/lib/models/UserModel";

const LoadDB = async () => {
  await ConnectDB();
};

LoadDB();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    console.log("Fetching answers for questionId:", questionId);
    const answers = await AnswerModel.find({ question: questionId })
      .populate("author", "fullName email")
      .sort({ createdAt: -1, upvotes: -1 });

    return NextResponse.json(answers);
  } catch (error) {
    console.error("Error fetching answers by questionId:", error);
    return NextResponse.json(
      { message: "Failed to fetch answers for this question" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;

    const body = await req.json();
    const { content, author } = body;
    const answer = await AnswerModel.create({
      content,
      author,
      question: questionId,
    });

    return NextResponse.json(answer);
  } catch (error) {
    console.error("Error fetching answers by questionId:", error);
    return NextResponse.json(
      { message: "Failed to fetch answers for this question" },
      { status: 500 }
    );
  }
}
