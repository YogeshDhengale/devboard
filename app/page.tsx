import { getAllQuestions } from "@/actions/quetions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Eye, MessageSquare, ThumbsUp, UserRound } from "lucide-react";
import Link from "next/link";
import { formatDistance } from "date-fns";

export default async function Home() {
  const questions = await getAllQuestions();
  return (
    <div>
      {questions.map((question) => (
        <Card key={question._id} className="pl-14 gap-4 relative">
          <CardHeader>
            <CardTitle>
              <Link
                href={`/question/${question._id}`}
                className="hover:underline text-blue-700 hover:text-blue-800"
              >
                {question.title}
              </Link>
            </CardTitle>
            <CardDescription className="truncate">
              {question.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <UserRound className="w-4 h-4" />
                <span className="font-medium">{question.author.fullName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 ml-2" />
                <span>{formatDistance(question.createdAt, new Date())}</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 py-6 px-2 left-0 w-17">
            <div className="space-y-3">
              <div className="flex items-center gap-1 justify-center text-sm text-muted-foreground">
                <ThumbsUp className="size-4 ml-2" />
                <span>{question.likes}</span>
              </div>
              <div className="flex items-center gap-1 justify-center text-sm text-muted-foreground">
                <Eye className="size-4 ml-2" />
                <span>{question.views}</span>
              </div>
              <div className="flex items-center gap-1 justify-center text-sm text-muted-foreground">
                <MessageSquare className="size-4 ml-2" />
                <span>{question.answerCount}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
