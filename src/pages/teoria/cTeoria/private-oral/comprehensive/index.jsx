import React from "react";

import OralQuiz from "@/components/ui/quizPage/OralQuiz";
import quizData from "@/pages/data.json";

const PrivateOralComprehensivePage = ({ qType, type, quizNumber, quiz }) => {
  return (
      <OralQuiz qType={qType} type={type} quizNumber={quizNumber} quiz={quiz} />
  );
};

export default PrivateOralComprehensivePage;

export async function getStaticProps() {
  // Get ALL questions from ALL private cTeoria exams
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

  // Return ALL questions in order (no shuffling)
  return {
    props: {
      qType: "cTeoria",
      type: "private",
      quizNumber: "comprehensive",
      quiz: allQuestions,
    },
  };
}
