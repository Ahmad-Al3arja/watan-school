import React from "react";

import OralQuiz from "@/components/ui/quizPage/OralQuiz";
import quizData from "@/pages/data.json";

const PrivateOralRandomPage = ({ qType, type, quizNumber, quiz }) => {
  return (
      <OralQuiz qType={qType} type={type} quizNumber={quizNumber} quiz={quiz} />
  );
};

export default PrivateOralRandomPage;

export async function getStaticProps() {
  // Get all questions from private cTeoria and shuffle them
  const privateData = quizData.cTeoria?.private;
  if (!privateData) {
    return { notFound: true };
  }

  const allQuestions = [];
  Object.keys(privateData).forEach((quizNumber) => {
    const quizQuestions = privateData[quizNumber];
    if (Array.isArray(quizQuestions)) {
      quizQuestions.forEach((question, questionIndex) => {
        allQuestions.push({
          ...question,
          _originalQuizNumber: quizNumber,
          _originalQuestionIndex: questionIndex,
        });
      });
    }
  });

  // Shuffle the questions
  const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

  return {
    props: {
      qType: "cTeoria",
      type: "private",
      quizNumber: "random",
      quiz: shuffledQuestions,
    },
  };
}
