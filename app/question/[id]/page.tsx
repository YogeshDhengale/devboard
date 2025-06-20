import { getAnswersByQuestionId, getQuestionById } from "@/actions/quetions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import VoteButtons from "@/components/vote-buttons";
import { formatDistance } from "date-fns";
import { Clock, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import React from "react";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function page({ params }: PageProps) {
  const { id } = await params;
  if (!id) notFound();
  const [question, answers] = await Promise.all([
    await getQuestionById(id),
    await getAnswersByQuestionId(id),
  ]);

  if (!question) notFound();

  return (
    <div className="space-y-10">
      <Card>
        <CardHeader className="pl-16 gap-2 relative">
          <div className="absolute top-0 left-0 px-2 w-17 flex flex-col items-center">
            <VoteButtons votes={question.likes + question.dislikes} questionId={id} />
          </div>
          <CardTitle className="text-2xl font-bold">{question.title}</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2 text-sm text-gray-600  mb-3">
              <div className="flex items-center gap-1">
                <UserRound className="w-4 h-4" />
                <span className="font-medium">{question.author.fullName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 ml-2" />
                <span>{formatDistance(question.createdAt, new Date())}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="whitespace-pre-line text-gray-700">
              {question.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {answers.length} Answer{answers.length !== 1 ? "s" : ""}
        </h2>

        <div className="space-y-6">
          {answers?.map((answer) => (
            <Card
              key={answer._id}
              // className={
              //   answer.isAccepted ? "border-green-200 bg-green-50" : ""
              // }
            >
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <VoteButtons votes={answer.upvotes + answer.downvotes} />
                    {/* {answer.isAccepted && (
                      <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-full">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )} */}
                  </div>
                  <div className="flex-1">
                    <div className="prose max-w-none mb-4">
                      <p className="whitespace-pre-line text-gray-700">
                        {answer.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserRound className="w-4 h-4" />
                      <span className="font-medium">
                        {answer.author.fullName}
                      </span>
                      <Clock className="w-4 h-4 ml-2" />
                      <span>{formatDistance(answer.createdAt, new Date())}</span>
                      {/* {answer.isAccepted && (
                        <Badge variant="default" className="bg-green-600 ml-2">
                          Accepted Answer
                        </Badge>
                      )} */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Answer Form */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Your Answer</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Write your answer here... You can use markdown formatting."
              className="min-h-[200px]"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Please be sure to answer the question. Provide details and share
                your research!
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Post Your Answer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default page;
