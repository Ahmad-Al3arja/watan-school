import React from "react";

import OralQuiz from "@/components/ui/quizPage/OralQuiz";
import quizData from "@/pages/data.json";

const PrivateOralQuizPage = ({ qType, type, quizNumber, quiz }) => {
  return (
      <OralQuiz qType={qType} type={type} quizNumber={quizNumber} quiz={quiz} />
  );
};

export default PrivateOralQuizPage;

export async function getStaticPaths() {
  const paths = [];

  // Get all quiz numbers for private cTeoria
  const privateData = quizData.cTeoria?.private;
  if (privateData) {
    const quizNumbers = Object.keys(privateData);
    quizNumbers.forEach((quizNumber) => {
      paths.push({
        params: { quizNumber },
      });
    });
  }

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { quizNumber } = params;
  const quiz = quizData.cTeoria?.private?.[quizNumber];
  
  if (!quiz || quiz.length === 0) {
    return { notFound: true };
  }

  return {
    props: {
      qType: "cTeoria",
      type: "private",
      quizNumber,
      quiz,
    },
  };
}
