import React from "react";

import OralQuiz from "@/components/ui/quizPage/OralQuiz";
import quizData from "@/pages/data.json";

const LightOralSavedPage = ({ qType, type, quizNumber, quiz }) => {
  return (
      <OralQuiz qType={qType} type={type} quizNumber={quizNumber} quiz={quiz} />
  );
};

export default LightOralSavedPage;

export async function getStaticProps() {
  // Get all questions from light cTeoria for saved questions
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

  return {
    props: {
      qType: "cTeoria",
      type: "light",
      quizNumber: "saved",
      quiz: allQuestions, // Will be filtered on client side
    },
  };
}
