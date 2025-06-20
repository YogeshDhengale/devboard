"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "./ui/button";
import { dislikeQuestion, likeQuestion } from "@/actions/quetions";

function VoteButtons({ votes, questionId }: { votes: number, questionId?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-full" onClick={() => {
        if(questionId) likeQuestion(questionId)
      }}>
        <ThumbsUp className="w-4 h-4" />
      </Button>
      <span className="font-medium text-lg">{votes}</span>
      <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-full" onClick={() => {
        if(questionId) dislikeQuestion(questionId);
      }}>
        <ThumbsDown className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default VoteButtons;