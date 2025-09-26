import React from "react";

import OralQuiz from "@/components/ui/quizPage/OralQuiz";
import quizData from "@/pages/data.json";

const LightOralComprehensivePage = ({ qType, type, quizNumber, quiz }) => {
  return (
      <OralQuiz qType={qType} type={type} quizNumber={quizNumber} quiz={quiz} />
  );
};

export default LightOralComprehensivePage;

export async function getStaticProps() {
  // Get ALL questions from ALL light cTeoria exams
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

  // Return ALL questions in order (no shuffling)
  return {
    props: {
      qType: "cTeoria",
      type: "light",
      quizNumber: "comprehensive",
      quiz: allQuestions,
    },
  };
}
