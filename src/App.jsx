import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Organiser Pages
import OrganiserDashboard from "./pages/organiser/OrganiserDashboard";
import CreateQuizPage from "./pages/organiser/CreateQuizPage";
import EditQuizPage from "./pages/organiser/EditQuizPage";
import EditQuestionPage from "./pages/organiser/EditQuestionPage";
import AddQuestionPage from "./pages/organiser/AddQuestionPage";
import QuestionPage from "./pages/organiser/QuestionPage";
import ViewResponsesPage from "./pages/organiser/ViewResponsePage";
import OrganiserLeaderboardPage from "./pages/organiser/OrganiserLeaderboardPage";

// Participant Pages
import ActiveQuizzesPage from "./pages/participant/ActiveQuizzesPage";
import GuidelinesPage from "./pages/participant/GuidelinesPage";
import QuizAttemptPage from "./pages/participant/QuizAttemptPage";
import SubmitConfirmationPage from "./pages/participant/SubmitConfirmationPage";
import ResultPage from "./pages/participant/ResultPage";
import LeaderboardPage from "./pages/participant/LeaderboardPage";
import AdminPage from "./pages/organiser/AdminPage";

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Organiser Routes */}
      <Route
        path="/organiser/dashboard"
        element={<PrivateRoute allowedRole="organiser"><OrganiserDashboard /></PrivateRoute>}
      />
      <Route
        path="/organiser/create-quiz"
        element={<PrivateRoute allowedRole="organiser"><CreateQuizPage /></PrivateRoute>}
      />
      <Route
        path="/organiser/edit-quiz/:quizId"
        element={<PrivateRoute allowedRole="organiser"><EditQuizPage /></PrivateRoute>}
      />
      <Route
        path="/organiser/add-question/:quizId"
        element={<PrivateRoute allowedRole="organiser"><AddQuestionPage /></PrivateRoute>}
      />
      <Route
        path="/organiser/questions/:quizId"
        element={<PrivateRoute allowedRole="organiser"><QuestionPage /></PrivateRoute>}
      />
      <Route
        path="/organiser/questions/:quizId/:questionId"
        element={<PrivateRoute allowedRole="organiser"><EditQuestionPage /></PrivateRoute>}
      />
      <Route
        path="organiser/quiz/:quizId/user/:userId/answers"
        element={<PrivateRoute allowedRole="organiser"><ViewResponsesPage /></PrivateRoute>}
      />
      <Route
        path="/organiser/leaderboard/:quizId"
        element={<PrivateRoute allowedRole="organiser"><OrganiserLeaderboardPage /></PrivateRoute>}
      />

      {/* admin routes */}
      <Route
        path="/admin"
        element={<PrivateRoute allowedRole="organiser"><AdminPage /></PrivateRoute>}
      />

      {/* Participant Routes */}
      <Route
        path="/participant/active-quizzes"
        element={<PrivateRoute allowedRole="user"><ActiveQuizzesPage /></PrivateRoute>}
      />
      <Route
        path="/participant/guidelines/:quizId"
        element={<PrivateRoute allowedRole="user"><GuidelinesPage /></PrivateRoute>}
      />
      <Route
        path="/participant/quiz-attempt/:quizId"
        element={<PrivateRoute allowedRole="user"><QuizAttemptPage /></PrivateRoute>}
      />
      <Route
        path="/participant/submit-confirmation/:quizId"
        element={<PrivateRoute allowedRole="user"><SubmitConfirmationPage /></PrivateRoute>}
      />
      <Route
        path="/participant/result/:quizId"
        element={<PrivateRoute allowedRole="user"><ResultPage /></PrivateRoute>}
      />
      <Route
        path="/participant/leaderboard/:quizId"
        element={<PrivateRoute allowedRole="user"><LeaderboardPage /></PrivateRoute>}
      />

      {/* Default route */}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
