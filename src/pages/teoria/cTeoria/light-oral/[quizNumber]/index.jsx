import React from "react";

import OralQuiz from "@/components/ui/quizPage/OralQuiz";
import quizData from "@/pages/data.json";

const LightOralQuizPage = ({ qType, type, quizNumber, quiz }) => {
  return (
      <OralQuiz qType={qType} type={type} quizNumber={quizNumber} quiz={quiz} />
  );
};

export default LightOralQuizPage;

export async function getStaticPaths() {
  const paths = [];

  // Get all quiz numbers for light cTeoria
  const lightData = quizData.cTeoria?.light;
  if (lightData) {
    const quizNumbers = Object.keys(lightData);
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
  const quiz = quizData.cTeoria?.light?.[quizNumber];
  
  if (!quiz || quiz.length === 0) {
    return { notFound: true };
  }

  return {
    props: {
      qType: "cTeoria",
      type: "light",
      quizNumber,
      quiz,
    },
  };
}
