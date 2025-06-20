"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function AskQuestionPage() {
  const { user, isAuthenticated } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const router = useRouter();

  const addTag = () => {
    if (
      currentTag.trim() &&
      !tags.includes(currentTag.trim()) &&
      tags.length < 5
    ) {
      setTags([...tags, currentTag.trim().toLowerCase()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated && !user) {
      toast.error("You must be logged in to ask a question.");
      router.push("/sign-in");
    }

    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: content,
          author: user?.id,
          tags,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Failed to post question:", error.message);
        return;
      }

      const data = await res.json();
      toast.success("Question posted successfully!" + data);

      // Redirect to question page or homepage
      router.push(`/question/${data._id}`);
    } catch (err) {
      console.error("Error posting question:", err);
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ask a Question
        </h1>
        <p className="text-gray-600">
          Get help from the developer community. Be specific and provide context
          for better answers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Title</CardTitle>
            <p className="text-sm text-gray-600">
              Be specific and imagine you&apos;re asking a question to another
              person
            </p>
          </CardHeader>
          <CardContent>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to implement authentication in Next.js 14?"
              className="text-lg"
              required
            />
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              What are the details of your problem?
            </CardTitle>
            <p className="text-sm text-gray-600">
              Introduce the problem and expand on what you put in the title.
              Minimum 20 characters.
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your problem in detail. Include what you've tried, what you expected to happen, and what actually happened. Code examples are helpful!"
              className="min-h-[200px]"
              required
            />
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tags</CardTitle>
            <p className="text-sm text-gray-600">
              Add up to 5 tags to describe what your question is about
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleTagKeyPress}
                  placeholder="e.g. javascript, react, nextjs"
                  disabled={tags.length >= 5}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  disabled={!currentTag.trim() || tags.length >= 5}
                >
                  Add Tag
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Press Enter or comma to add a tag. Maximum 5 tags.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">
              Writing a good question
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700">
            <ul className="space-y-1 list-disc list-inside">
              <li>Make your title specific and descriptive</li>
              <li>Explain what you&apos;ve already tried</li>
              <li>Include relevant code, error messages, or screenshots</li>
              <li>Use proper formatting and grammar</li>
              <li>Add relevant tags to help others find your question</li>
            </ul>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!title.trim() || !content.trim() || content.length < 20}
          >
            Post Your Question
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
