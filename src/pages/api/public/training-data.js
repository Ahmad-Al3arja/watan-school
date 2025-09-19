import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Read the real training questions from data.json
    const dataPath = path.join(process.cwd(), 'src', 'pages', 'data.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Extract training questions
    const trainingData = jsonData.training?.quizes || {};
    let allTrainingQuestions = [];

    // Convert your data format to our expected format
    Object.keys(trainingData).forEach((quizId) => {
      const quizQuestions = trainingData[quizId];
      quizQuestions.forEach((q) => {
        // Convert to our format
        const options = [];
        if (q.a) options.push(q.a);
        if (q.b) options.push(q.b);
        if (q.c) options.push(q.c);
        if (q.d) options.push(q.d);

        const correctAnswerIndex = parseInt(q.answer) - 1; // Convert 1-based to 0-based

        allTrainingQuestions.push({
          id: q.id,
          text: q.question,
          options: options,
          correctAnswer: correctAnswerIndex,
          explanation: `الإجابة الصحيحة هي: ${options[correctAnswerIndex]}`,
          category: `امتحان تدريب ${quizId}`,
          quizId: quizId
        });
      });
    });

    // Handle query parameters
    const { category, limit, random, quizId } = req.query;
    let filteredQuestions = allTrainingQuestions;

    // Filter by quiz ID if requested
    if (quizId) {
      filteredQuestions = allTrainingQuestions.filter(q => q.quizId === quizId);
    }

    // Filter by category if requested
    if (category) {
      filteredQuestions = filteredQuestions.filter(q => q.category === category);
    }

    // Randomize if requested
    if (random === 'true') {
      filteredQuestions = [...filteredQuestions].sort(() => 0.5 - Math.random());
    }

    // Limit results if requested
    if (limit) {
      const limitNum = parseInt(limit);
      filteredQuestions = filteredQuestions.slice(0, limitNum);
    }

    // Get available quiz IDs and categories
    const availableQuizzes = Object.keys(trainingData);
    const categories = [...new Set(allTrainingQuestions.map(q => q.category))];

    res.status(200).json({
      questions: filteredQuestions,
      total: filteredQuestions.length,
      totalQuestions: allTrainingQuestions.length,
      availableQuizzes: availableQuizzes,
      categories: categories
    });

  } catch (error) {
    console.error('Error reading training data:', error);
    res.status(500).json({ error: 'Failed to load training questions' });
  }
}