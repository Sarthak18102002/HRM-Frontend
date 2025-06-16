import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isAllowed, setIsAllowed] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [concepts, setConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [datasetUrl, setDatasetUrl] = useState('');

  useEffect(() => {
    const roles = getUserRoles();
    setIsAllowed(roles.includes('ADMIN') || roles.includes('INTERVIEWER'));
  }, []);

  useEffect(() => {
    setLanguages([
      'Python',
      'Java',
      'Cpp',
      'JavaScript',
      'Flutter',
      'ReactJs',
      'AngularJs'
    ]);
  }, []);

  useEffect(() => {
    if (selectedLanguage === 'Python') setConcepts(['Loops', 'Functions', 'OOP']);
    else if (selectedLanguage === 'Java') setConcepts(['Inheritance', 'Interfaces', 'Exceptions']);
    else if (selectedLanguage === 'Cpp') setConcepts(['Pointers', 'Templates', 'STL']);
    else if (selectedLanguage === 'JavaScript') setConcepts(['Promises', 'Async/Await', 'DOM']);
    else if (selectedLanguage === 'Flutter') setConcepts(['Widgets', 'State Management', 'Navigation']);
    else if (selectedLanguage === 'ReactJs') setConcepts(['Hooks', 'Components', 'State', 'Props']);
    else if (selectedLanguage === 'AngularJs') setConcepts(['Directives', 'Services', 'Modules']);
    else setConcepts([]);
    setSelectedConcept('');
  }, [selectedLanguage]);

  const startInterview = async () => {
    setError('');
    if (!csvFile && !datasetUrl) {
      setError('Please upload a CSV file or enter a dataset URL.');
      return;
    }
    try {
      const formData = new FormData();
      if (csvFile) formData.append('file', csvFile);
      else formData.append('file', new Blob([])); // send empty file if not provided

      formData.append('datasetUrl', datasetUrl || '');

      const response = await axios.post('/questions/start-interview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // If your backend uses ApiResponse<QuestionDTO>
      setCurrentQuestion(response.data.data || response.data);
      setInterviewStarted(true);
    } catch (error) {
      setError("Failed to start interview. Please check your input.");
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

  const handleSkip = async () => {
    try {
      const response = await axios.post('/questions/next-question', {
        previousQuestion: currentQuestion.question,
        answer: null,
        skip: true
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
            {/* Language Dropdown */}
            <label className="w-full text-left font-semibold text-indigo-700 mb-1">Language</label>
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              className="border-2 border-indigo-200 rounded-lg px-4 py-3 mb-4 w-full"
            >
              <option value="">Select Language</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            {/* Concept Dropdown */}
            {selectedLanguage && (
              <>
                <label className="w-full text-left font-semibold text-indigo-700 mb-1">Concept</label>
                <select
                  value={selectedConcept}
                  onChange={e => setSelectedConcept(e.target.value)}
                  className="border-2 border-indigo-200 rounded-lg px-4 py-3 mb-4 w-full"
                >
                  <option value="">Select Concept</option>
                  {concepts.map(concept => (
                    <option key={concept} value={concept}>{concept}</option>
                  ))}
                </select>
              </>
            )}
            {/* File Upload */}
            {/* File Upload */}
            <label className="w-full text-left font-semibold text-indigo-700 mb-1">Upload CSV File</label>
            <input
              type="file" 
              accept=".csv"
              className="border-2 border-indigo-200 rounded-lg px-4 py-3 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              onChange={e => setCsvFile(e.target.files[0])}
            />
            <span className="text-xs text-indigo-700 mb-1 block">Please choose only <b>.csv</b> file.</span>
            <div className="text-gray-500 mb-2">or</div>
            {/* Dataset URL */}
            <input
              type="text"
              value={datasetUrl}
              onChange={e => setDatasetUrl(e.target.value)}
              placeholder="Enter dataset URL (CSV)"
              className="border-2 border-indigo-200 rounded-lg px-4 py-3 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
            {error && (
              <div className="text-red-600 font-semibold mb-2">{error}</div>
            )}
            <button
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-8 rounded-xl shadow hover:from-indigo-600 hover:to-blue-600 transition"
              onClick={startInterview}
              // Don't disable the button, so error can show
              disabled={!selectedLanguage || !selectedConcept}
            >
              Start Interview
            </button>
            <button
              className="mt-4 bg-gray-300 text-gray-800 font-bold py-2 px-8 rounded-xl shadow hover:bg-gray-400 transition"
              onClick={() => navigate('/dashboard')}
            >
              Back
            </button>
          </div>
        ) : currentQuestion ? (
          <div className="mt-6">
            <div className="bg-indigo-50 rounded-xl p-6 shadow mb-4">
              {/* ID */}
              <div className="mb-2">
                <span className="text-indigo-700 font-bold text-base">
                  ID :  {currentQuestion.questionId}
                </span>
              </div>
              {/* Question */}
              <div className="mb-4">
                <span className="text-indigo-700 font-bold text-base">Question:  {currentQuestion.question}</span>
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
              {/* Options and Buttons */}
              <div className="flex flex-wrap gap-3 mt-4">
                {currentQuestion.options.map((opt, index) => (
                  <button
                    key={index}
                    className={`
                      px-5 py-2 rounded-lg font-semibold shadow transition
                      ${selectedAnswer === opt
                        ? opt === 'No'
                          ? 'bg-red-600 text-white'
                          : 'bg-blue-600 text-white'
                        : opt === 'Yes'
                          ? 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700'
                          : opt === 'No'
                            ? 'bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700'
                            : 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700'
                      }
                    `}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!selectedAnswer}
                  >
                    {opt}
                  </button>
                ))}
                {currentQuestion.options.length === 2 &&
                  currentQuestion.options.includes('Yes') &&
                  currentQuestion.options.includes('No') && (
                    <>
                      <div className="w-full flex gap-3 mt-4">
                        <button
                          className="bg-yellow-400 text-white font-bold py-2 px-6 rounded-xl shadow hover:bg-yellow-500 transition"
                          onClick={handleSkip}
                          disabled={!!selectedAnswer}
                        >
                          Skip
                        </button>
                        <button
                          className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-xl shadow hover:bg-gray-400 transition"
                          onClick={() => {
                            setInterviewStarted(false);
                            setCurrentQuestion(null);
                            setSelectedAnswer(null);
                          }}
                        >
                          Back
                        </button>
                      </div>
                    </>
                  )
                }
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
  