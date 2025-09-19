"use client";
import React, { useState, useEffect } from "react";

import { useRouter } from "next/router";
import { Container } from "@mui/material";
import SectionTitle from "@/components/ui/SectionTitle";
import Types from "@/components/layout/Types";
import EnglishTypes from "@/components/layout/EnglishTypes";
import OralSelection from "@/components/ui/OralSelection";
import TrainingSection from "@/components/layout/TrainingSection";

const TypesPage = ({ qType }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state until client-side hydration is complete
  if (!isClient || !router.isReady) {
    return (
      <Container className="section" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }} maxWidth="sm">
        <SectionTitle title="تحميل..." subTitle="" />
        <div>تحميل...</div>
      </Container>
    );
  }

  const titleObj = getTitle(qType);

  // Training section handles its own layout
  if (qType === "training") {
    return renderComponent(qType);
  }

  return (
      <Container className="section" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }} maxWidth="sm">
        <SectionTitle title={titleObj.title} subTitle={titleObj.description} />
        {renderComponent(qType)}
      </Container>
  );
};

const renderComponent = (qType) => {
  switch (qType) {
    case "nTeoria":
      return <Types />;
    case "cTeoria":
      return <Types isNormal={false} />;
    case "english_teoria":
      return <EnglishTypes />;
    case "oral":
      return <OralSelection />;
    case "training":
      return <TrainingSection />;
    default:
      return null;
  }
};

const getTitle = (qType) =>
  ({
    nTeoria: {
      title: "أسئلة التؤوريا",
      description:
        "هذه هي الأسئلة الأساسية للتؤوريا، تغطي جميع الجوانب النظرية المطلوبة للحصول على الرخصة في فلسطين.",
    },
    cTeoria: {
      title: "أسئلة التؤوريا الاستكمالية",
      description:
        "اختر نوع الرخصة لدراسة الأسئلة الاستكمالية الخاصة بها مع تركيز على امتحان النظري.",
    },
    english_teoria: {
      title: "English Theory Questions",
      description:
        "English theory questions covering all theoretical aspects required for driving license in Palestine, presented in English language.",
    },
    oral: {
      title: "أسئلة التؤوريا الشفوية",
      description:
        "الأسئلة الشفوية للتؤوريا تركز على التفاعل الفوري وفهم المفاهيم النظرية بشكل عملي.",
    },
    training: {
      title: "أسئلة تدريب سياقة وإدارة مهنية",
      description:
        "أسئلة تدريب سياقة وإدارة مهنية تغطي مهارات القيادة والإدارة في المواقف المهنية.",
    },
  }[qType] || { title: "", description: "" });

export async function getStaticPaths() {
  return {
    paths: [
      { params: { qType: "nTeoria" } },
      { params: { qType: "cTeoria" } },
      { params: { qType: "english_teoria" } },
      { params: { qType: "oral" } },
      { params: { qType: "training" } },
    ],
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      qType: params.qType,
    },
  };
}

export default TypesPage;
