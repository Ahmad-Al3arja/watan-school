import React from "react";

import OralQuiz from "@/components/ui/quizPage/OralQuiz";
import quizData from "@/pages/data.json";
import { loadQuizBookmarks } from "@/components/util/quizStorage";

const PrivateOralSavedPage = ({ qType, type, quizNumber, quiz }) => {
  return (
      <OralQuiz qType={qType} type={type} quizNumber={quizNumber} quiz={quiz} />
  );
};

export default PrivateOralSavedPage;

export async function getStaticProps() {
  // Get all bookmarked questions from private cTeoria
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

  return {
    props: {
      qType: "cTeoria",
      type: "private",
      quizNumber: "saved",
      quiz: allQuestions, // Will be filtered on client side
    },
  };
}
