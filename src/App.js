import { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import AuthPage from "./pages/AuthPage";
import AdminAuthPage from "./pages/AdminAuthPage";
import RecruiterAuthPage from "./pages/RecruiterAuthPage";
import MentorDashboard from "./pages/MentorDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import { sanitizeProfilePhoto } from "./utils/images";
import { safeGetItem } from "./utils/storage";
import { getCurrentUser, logoutUser } from "./services/authService";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then((backendUser) => {
      if (backendUser) {
        setCurrentUser(backendUser);
      }
    });

    const savedUserData = safeGetItem("placer_current_user", null);
    const savedUsers = safeGetItem("placer_users", []);

    const defaultStudent = {
      id: "student-123",
      name: "Rahul Kumar",
      email: "student@placer.ai",
      password: "password123",
      phone: "9876543210",
      role: "student",
      status: "Approved",
      college: "D.Y. Patil Institute",
      university: "Savitribai Phule Pune University",
      rollNumber: "PRN-987654",
      branch: "Computer Engineering",
      year: "Final Year",
      passingYear: "2026",
      cgpa: "9.5",
      backlogs: "0",
      skills: ["React", "JavaScript", "SQL", "DSA"],
      careerInterests: "Frontend Development, UI/UX",
      preferredRole: "Frontend Developer",
      preferredLocation: "Pune",
      linkedin: "https://linkedin.com/in/rahulkumar",
      github: "https://github.com/rahulkumar",
      portfolio: "https://rahulkumar.me",
      resume: null,
      termsAccepted: true,
      createdAt: new Date().toLocaleString()
    };

    if (!savedUsers.some(u => u.email.toLowerCase() === "student@placer.ai")) {
      savedUsers.push(defaultStudent);
      try {
        localStorage.setItem("placer_users", JSON.stringify(savedUsers));
      } catch (e) {}
    }

    let restoredUsers = [];
    let hasRunRejectedRestore = false;
    try {
      hasRunRejectedRestore = localStorage.getItem("placer_one_time_rejected_restore") === "done";
      restoredUsers = hasRunRejectedRestore
        ? savedUsers
        : savedUsers.map((item) =>
            item.role !== "admin" && item.status === "Rejected"
              ? {
                  ...item,
                  status: "Approved",
                  decidedAt: new Date().toLocaleString(),
                  decidedBy: "Admin"
                }
              : item
          );
    } catch (e) {
      restoredUsers = savedUsers;
    }

    const sanitizedUsers = restoredUsers.map((item) => ({ ...item, photo: sanitizeProfilePhoto(item.photo) }));

    try {
      if (!hasRunRejectedRestore) {
        localStorage.setItem("placer_users", JSON.stringify(sanitizedUsers));
        localStorage.setItem("placer_one_time_rejected_restore", "done");
      } else if (JSON.stringify(sanitizedUsers) !== JSON.stringify(savedUsers)) {
        localStorage.setItem("placer_users", JSON.stringify(sanitizedUsers));
      }
    } catch (e) {}

    if (savedUserData && typeof savedUserData === "object") {
      const parsedUser = { ...savedUserData, photo: sanitizeProfilePhoto(savedUserData.photo) };
      const syncedUser =
        sanitizedUsers.find((item) => item.email === parsedUser.email && item.role === parsedUser.role) || parsedUser;

      try {
        localStorage.setItem("placer_current_user", JSON.stringify(syncedUser));
      } catch (e) {}
      setCurrentUser(syncedUser);
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const dashboardForRole = () => {
    if (!currentUser) {
      return <AuthPage onAuth={setCurrentUser} />;
    }

    if (currentUser.role === "admin") {
      return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
    }

    if (currentUser.role === "mentor") {
      return <MentorDashboard user={currentUser} onLogout={handleLogout} />;
    }

    if (currentUser.role === "recruiter") {
      return <RecruiterDashboard user={currentUser} onLogout={handleLogout} />;
    }

    return <StudentDashboard user={currentUser} onUserChange={setCurrentUser} onLogout={handleLogout} />;
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={dashboardForRole()} />
        <Route
          path="/admin"
          element={currentUser?.role === "admin" ? <AdminDashboard user={currentUser} onLogout={handleLogout} /> : <AdminAuthPage onAuth={setCurrentUser} />}
        />
        <Route
          path="/recruiter"
          element={currentUser?.role === "recruiter" ? <RecruiterDashboard user={currentUser} onLogout={handleLogout} /> : <RecruiterAuthPage onAuth={setCurrentUser} />}
        />
        <Route
          path="/mentor"
          element={currentUser?.role === "mentor" ? <MentorDashboard user={currentUser} onLogout={handleLogout} /> : <AuthPage initialRole="mentor" onAuth={setCurrentUser} />}
        />
        <Route
          path="/student/ai-recommendations"
          element={currentUser?.role === "student" ? <StudentDashboard user={currentUser} initialTab="AI Recommendations" onUserChange={setCurrentUser} onLogout={handleLogout} /> : <AuthPage onAuth={setCurrentUser} />}
        />
        <Route
          path="/student/ai-assistant"
          element={currentUser?.role === "student" ? <StudentDashboard user={currentUser} initialTab="AI Assistant" onUserChange={setCurrentUser} onLogout={handleLogout} /> : <AuthPage onAuth={setCurrentUser} />}
        />
        <Route
          path="/student/skill-gap"
          element={currentUser?.role === "student" ? <StudentDashboard user={currentUser} initialTab="Skill Gap Analysis" onUserChange={setCurrentUser} onLogout={handleLogout} /> : <AuthPage onAuth={setCurrentUser} />}
        />
        <Route
          path="/student/ats-analyzer"
          element={currentUser?.role === "student" ? <StudentDashboard user={currentUser} initialTab="Resume & ATS" onUserChange={setCurrentUser} onLogout={handleLogout} /> : <AuthPage onAuth={setCurrentUser} />}
        />
        <Route
          path="/student/ai-search"
          element={currentUser?.role === "student" ? <StudentDashboard user={currentUser} initialTab="AI Job Search" onUserChange={setCurrentUser} onLogout={handleLogout} /> : <AuthPage onAuth={setCurrentUser} />}
        />
        <Route
          path="/student/interviews"
          element={currentUser?.role === "student" ? <StudentDashboard user={currentUser} initialTab="Interviews" onUserChange={setCurrentUser} onLogout={handleLogout} /> : <AuthPage onAuth={setCurrentUser} />}
        />
        <Route
          path="/student/assessments"
          element={currentUser?.role === "student" ? <StudentDashboard user={currentUser} initialTab="Assessments" onUserChange={setCurrentUser} onLogout={handleLogout} /> : <AuthPage onAuth={setCurrentUser} />}
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
