import { ConnectDB } from "@/lib/config/db";
import AnswerModel from "@/lib/models/AnswerModel";
import { NextResponse } from "next/server";


const LoadDB = async () => {
    await ConnectDB();
}

LoadDB();

export async function GET() {
  try {
    const answers = await AnswerModel.find();
    console.log("Fetched answers:", answers);
    return NextResponse.json(answers);
  } catch (error) {
    console.error("Get all answers error:", error);
    return NextResponse.json({ message: "Failed to fetch answers" }, { status: 500 });
  }
}