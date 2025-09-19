import React from "react";

import OralQuiz from "@/components/ui/quizPage/OralQuiz";
import quizData from "@/pages/data.json";

const LightOralRandomPage = ({ qType, type, quizNumber, quiz }) => {
  return (
      <OralQuiz qType={qType} type={type} quizNumber={quizNumber} quiz={quiz} />
  );
};

export default LightOralRandomPage;

export async function getStaticProps() {
  // Get all questions from light cTeoria and shuffle them
  const lightData = quizData.cTeoria?.light;
  if (!lightData) {
    return { notFound: true };
  }

  const allQuestions = [];
  Object.keys(lightData).forEach((quizNumber) => {
    const quizQuestions = lightData[quizNumber];
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
      type: "light",
      quizNumber: "random",
      quiz: shuffledQuestions,
    },
  };
}
