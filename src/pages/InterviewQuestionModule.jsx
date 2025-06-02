import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { jwtDecode } from 'jwt-decode';

const getUserRoles = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return [];
  try {
    const decoded = jwtDecode(token);
    return decoded.roles || [];
  } catch (error) {
    console.error("Failed to decode token:", error);
    return [];
  }
};

const InterviewQuestionModule = () => {
  const [datasetUrl, setDatasetUrl] = useState('');
  const [isAllowed, setIsAllowed] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    const roles = getUserRoles();
    setIsAllowed(roles.includes('ADMIN') || roles.includes('INTERVIEWER'));
  }, []);

  const startInterview = async () => {
    try {
      const response = await axios.post('/questions/start-interview', { datasetUrl });
      setCurrentQuestion(response.data);
      setInterviewStarted(true);
    } catch (error) {
      console.error("Failed to start interview:", error);
      alert("Failed to start interview. Please check the dataset URL.");
    }
  };

  const handleAnswer = async (answer) => {
    setSelectedAnswer(answer);
    try {
      const response = await axios.post('/questions/next-question', {
        previousQuestion: currentQuestion.question,
        answer: answer
      });

      if (response.data) {
        setCurrentQuestion(response.data);
        setSelectedAnswer(null);
      } else {
        alert("Interview completed!");
        setCurrentQuestion(null);
        setInterviewStarted(false);
        setSelectedAnswer(null);
      }
    } catch (error) {
      console.error("Error while sending answer:", error);
      alert("Something went wrong during interview flow.");
    }
  };

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-xl shadow text-lg font-semibold">
          🚫 You are not authorized to access this section.
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-800 tracking-wide drop-shadow-lg">
          Interview Questions
        </h2>

        {!interviewStarted ? (
          <div className="flex flex-col items-center">
            <input
              value={datasetUrl}
              onChange={e => setDatasetUrl(e.target.value)}
              placeholder="Enter public dataset URL (CSV)"
              className="border-2 border-indigo-200 rounded-lg px-4 py-3 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
            <button
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-8 rounded-xl shadow hover:from-indigo-600 hover:to-blue-600 transition"
              onClick={startInterview}
            >
              Start Interview
            </button>
          </div>
        ) : currentQuestion ? (
          <div className="mt-6">
            <div className="bg-indigo-50 rounded-xl p-6 shadow mb-4">
              {/* ID */}
              <div className="mb-2">
                <span className="text-indigo-700 font-semibold text-base">
                  ID :  {currentQuestion.questionId}
                </span>
              </div>
         
              {/* Question */}
              <div className="mb-4">
                <span className="text-indigo-700 font-semibold text-base">Question:  {currentQuestion.question}</span>
              
              </div>
              {/* Answer */}
              {currentQuestion.answer && (
                <div className="mb-4">
                  <span className="text-green-700 font-medium bg-green-50 rounded px-3 py-2 inline-block">
                    ✅ Answer: {currentQuestion.answer}
                  </span>
                </div>
              )}
              {/* Selected Answer */}
              {selectedAnswer && (
                <div className="mb-4">
                  <span className="text-blue-700 font-medium bg-blue-50 rounded px-3 py-2 inline-block">
                    You selected: {selectedAnswer}
                  </span>
                </div>
              )}
              {/* Options */}
              <div className="flex flex-wrap gap-3 mt-4">
                {currentQuestion.options.map((opt, index) => (
                  <button
                    key={index}
                    className={`px-5 py-2 rounded-lg font-semibold shadow transition
                      ${selectedAnswer === opt
                        ? 'bg-blue-600 text-white'
                        : 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700'}
                    `}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!selectedAnswer}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-indigo-700 text-lg font-semibold">Loading next question...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewQuestionModule;
