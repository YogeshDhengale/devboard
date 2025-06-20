"use server"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export interface QuestionWithAuthorAndAnswerCount {
  _id: string
  title: string
  description: string
  author: {
    _id: string
    fullName: string
    email: string
    phoneNumber: string
    createdAt: string
    updatedAt: string
  }
  tags: string[]
  views: number
  likes: number
  dislikes: number
  createdAt: string
  updatedAt: string
  __v?: number
  answerCount: number
}

export interface AnswerWithAuthor {
  _id: string;
  content: string;
  author: {
    _id: string;
    fullName: string;
    email: string;
  };
  question: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface QuestionSummary {
  _id: string;
  title: string;
  description: string;
  author: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
    updatedAt: string;
  };
  tags: string[];
  views: number;
  likes: number;
  dislikes: number;
  createdAt: string;
  updatedAt: string;
  answerCount: number;
}



export const getQuestionById = async (questionId: string): Promise<QuestionWithAuthorAndAnswerCount | null> => {
  console.log(questionId, "questionId in getQuestionById")

  try {
    const url = `${baseUrl}/api/question/${questionId}`

    console.log("Fetching from URL:", url) // Debug log

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    })

    if (!res.ok) {
      console.error(`Failed to fetch question: ${res.status} ${res.statusText}`)
      return null
    }

    const data = await res.json()
    console.log("Successfully fetched question:", data._id) // Debug log
    return data
  } catch (error) {
    console.error("Error fetching question:", error)
    return null
  }
}


export const getAnswersByQuestionId = async (questionId: string): Promise<AnswerWithAuthor[] | []> => {
    const url = `${baseUrl}/api/question/answers/${questionId}`
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch answers");
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching answers:", error);
    return [];
  }
};

export const getAllQuestions = async (): Promise<QuestionSummary[]> => {
  try {
    const res = await fetch(`${baseUrl}/api/question`, {
      method: "GET",
      cache: "no-store", // always fresh
    });

    if (!res.ok) {
      throw new Error("Failed to fetch questions");
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};

// actions/questions.ts

export const updateQuestionVote = async (
  questionId: string,
  action: "like" | "dislike"
) => {
  try {
    // Validate inputs
    if (!questionId) {
      throw new Error("Question ID is required");
    }

    if (action !== "like" && action !== "dislike") {
      throw new Error("Invalid action. Must be 'like' or 'dislike'");
    }

    const url = `${baseUrl}/api/question/${questionId}`

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to ${action} question`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error ${action}ing question:`, error);
    throw error;
  }
};

// Convenience functions for specific actions
export const likeQuestion = async (questionId: string) => {
  return updateQuestionVote(questionId, "like");
};

export const dislikeQuestion = async (questionId: string) => {
  return updateQuestionVote(questionId, "dislike");
};