export const navigationData = [
  {
    title: "الرئيسية",
    path: "/",
    icon: "HomeIcon",
    subMenu: [],
  },
  {
    title: "أسئلة التؤوريا",
    path: "/teoria",
    icon: "QuizIcon",
    subMenu: [
      { title: "أسئلة تؤوريا", path: "/teoria/nTeoria" },
      { title: "أسئلة تؤوريا استكمالي", path: "/teoria/cTeoria" },
      { title: "English Theory Questions", path: "/teoria/english_teoria" },
      { title: "أسئلة التؤوريا الشفوية", path: "/teoria/oral" },
      {
        title: "أسئلة تدريب سياقة وإدارة مهنية",
        path: "/teoria/training/quizes/",
      },
    ],
  },
  {
    title: "دراسة التؤوريا",
    path: "/st",
    icon: "BookIcon",
    subMenu: [
      { title: "اشارات المرور", path: "/st/signals" },
      { title: "كتاب التؤوريا", path: "/st/book" },
      { title: "الإشارات على الشارع", path: "/st/street-signs" },
    ],
  },
  {
    title: " نتائج الامتحانات ",
    path: "/exam",
    icon: "RuleIcon",
    subMenu: [
      { title: "(التؤوريا) نتيجة الامتحان النظري ", path: "/exam/theoretical" },
      { title: "(التست) نتيجة الامتحان العملي ", path: "/exam/practical" },
    ],
  },
  {
    title: "دليل الرخصة",
    path: "/info",
    icon: "DriveEtaIcon",
    subMenu: [
      { title: "إجراءات رخصة السياقة", path: "/info/steps" },
      { title: "مواعيد خدمات الدوائر", path: "/info/times" },
      { title: "أسعار الدروس والتستات", path: "/info/prices" },
    ],
  },
  {
    title: "عن الموقع ",
    path: "/contact",
    icon: "PhoneIcon",
    subMenu: [],
  },
];
