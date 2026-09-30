import { useState, useRef, useEffect } from "react";
import {
  FaBell,
  FaBriefcase,
  FaBuilding,
  FaEnvelope,
  FaGraduationCap,
  FaLock,
  FaPhoneAlt,
  FaRobot,
  FaSignInAlt,
  FaUserCheck,
  FaUserPlus,
  FaUsersCog,
  FaChartLine,
  FaRocket,
  FaLightbulb,
  FaCalendarAlt,
  FaCheckCircle,
  FaPlayCircle,
  FaArrowRight,
  FaArrowLeft,
  FaShieldAlt,
  FaUserShield,
  FaCheck,
  FaMagic,
  FaSitemap,
  FaChartBar,
  FaEye,
  FaEyeSlash,
  FaGithub,
  FaLinkedin,
  FaGlobe,
  FaCloudUploadAlt,
  FaCamera,
  FaTimes,
  FaUniversity,
  FaIdBadge,
  FaAward,
  FaMicrochip,
  FaLaptopCode,
  FaChartPie,
  FaMapMarkerAlt,
  FaPlus,
  FaExclamationTriangle,
  FaGoogle,
  FaStar,
  FaUser,
  FaKey,
  FaCheckDouble,
  FaFingerprint,
  FaServer,
  FaHistory,
  FaShieldVirus,
  FaNetworkWired,
  FaFileAlt,
  FaShieldAlt as FaSafe
} from "react-icons/fa";
import { sanitizeProfilePhoto } from "../utils/images";
import { safeGetItem } from "../utils/storage";
import BackendStatus from "../components/BackendStatus";
import { loginUser, registerUser } from "../services/authService";
import "./dashboard.css";

const roles = [
  { id: "student", label: "Student", icon: <FaGraduationCap />, text: "Profile, jobs, applications and AI guidance" },
  { id: "admin", label: "Admin", icon: <FaUsersCog />, text: "Approvals, analytics and placement control" },
  { id: "recruiter", label: "Recruiter", icon: <FaBuilding />, text: "Post jobs and shortlist candidates" }
];

const branches = [
  "Computer Engineering",
  "Information Technology",
  "Electronics and Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Data Science",
  "AI & Machine Learning"
];

const securityQuestions = [
  "What is your first school name?",
  "What is your favorite teacher's name?",
  "What is your birth city?",
  "What is your favorite subject?"
];

const preferredRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "AI Engineer",
  "Cloud Engineer",
  "UI/UX Designer"
];

const preferredLocations = [
  "Pune",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Remote"
];

const initialForm = {
  // Personal (Step 1)
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  photo: null,
  
  // Academic (Step 2)
  college: "D.Y. Patil Institute",
  university: "Savitribai Phule Pune University",
  rollNumber: "", // PRN
  department: "Engineering",
  branch: "Computer Engineering",
  year: "Third Year",
  passingYear: "2026",
  cgpa: "",
  backlogs: "0",
  
  // Skills & Career (Step 3)
  skills: [],
  careerInterests: "",
  preferredRole: "Frontend Developer",
  preferredLocation: "Pune",
  
  // Professional Links (Step 4)
  linkedin: "",
  github: "",
  portfolio: "",
  
  // Resume & Verify (Step 5)
  resume: null,
  securityQuestion: securityQuestions[0],
  securityAnswer: "",
  otp: "",
  termsAccepted: false,

  // Admin Specific Fields
  designation: "Placement Officer",
  institution: "D.Y. Patil Institute",
  employeeId: "",
  adminId: "",
  accessKey: "",
  accessLevel: "officer",
  permissions: ["Student Management", "Placement Analytics"]
};

const skillSuggestions = ["React", "JavaScript", "Python", "Node.js", "Java", "C++", "SQL", "Tailwind", "Figma", "AWS", "Machine Learning"];

function AuthPage({ onAuth, initialRole = "" }) {
  const [selectedRole, setSelectedRole] = useState(initialRole || "");
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowGoogleChooser(false);
      }
    };
    if (showGoogleChooser) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showGoogleChooser]);

  const handleGoogleLoginSelect = (email, name, role) => {
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      setShowGoogleChooser(false);

      const users = safeGetItem("placer_users", []);
      let found = users.find(
        (user) => user.email.toLowerCase() === email.toLowerCase() && user.role === role
      );

      if (!found) {
        found = {
          ...initialForm,
          id: `google-${Date.now()}`,
          name,
          email,
          role,
          status: "Approved",
          createdAt: new Date().toLocaleString()
        };
        users.push(found);
        try {
          localStorage.setItem("placer_users", JSON.stringify(users));
        } catch (e) {}
      }

      const nextUser = { ...found, photo: sanitizeProfilePhoto(found.photo) };
      localStorage.setItem("placer_current_user", JSON.stringify(nextUser));
      onAuth(nextUser);
    }, 1500);
  };

  const fileInputRef = useRef(null);

  const roleTitle = roles.find((role) => role.id === selectedRole)?.label || "User";

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleNext = () => {
    const maxStep = selectedRole === 'admin' ? 4 : 5;
    if (step < maxStep) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSkillAdd = (s) => {
    if (s && !form.skills.includes(s)) {
      updateField("skills", [...form.skills, s]);
    }
    setSkillInput("");
  };

  const removeSkill = (s) => {
    updateField("skills", form.skills.filter(sk => sk !== s));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (mode === "login") {
      try {
        const result = await loginUser({ email: form.email, password: form.password });
        if (result && result.user) {
          localStorage.setItem("placer_current_user", JSON.stringify(result.user));
          onAuth(result.user);
          return;
        }
      } catch (backendErr) {
        // Fallback to local storage if backend account missing or offline
        const users = safeGetItem("placer_users", []);
        const found = users.find(
          (user) => user.email.toLowerCase() === form.email.toLowerCase() && user.password === form.password && user.role === selectedRole
        );

        if (!found) {
          setError(backendErr.message || `${roleTitle} account not found. Please check your login details.`);
          return;
        }

        const nextUser = { ...found, photo: sanitizeProfilePhoto(found.photo) };
        localStorage.setItem("placer_current_user", JSON.stringify(nextUser));
        onAuth(nextUser);
        return;
      }
    }

    // Registration logic
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await registerUser({
        full_name: form.name || form.email.split("@")[0],
        email: form.email,
        password: form.password,
        role: selectedRole,
        phone: form.phone || ""
      });
      setMode("login");
      setStep(1);
      setError("Registration successful! Please login to continue.");
    } catch (backendErr) {
      // Local fallback for offline/academic dev mode
      const users = safeGetItem("placer_users", []);
      if (users.some(u => u.email.toLowerCase() === form.email.toLowerCase())) {
        setError("An account with this email already exists.");
        return;
      }

      const newUser = {
        ...form,
        id: Date.now(),
        role: selectedRole,
        status: selectedRole === "admin" ? "Approved" : "Pending",
        resume: form.resume ? { name: form.resume.name, size: form.resume.size, type: form.resume.type } : null,
        createdAt: new Date().toLocaleString()
      };

      localStorage.setItem("placer_users", JSON.stringify([...users, newUser]));
      if (newUser.role === "admin") {
        localStorage.setItem("placer_current_user", JSON.stringify(newUser));
        onAuth(newUser);
      } else {
        setMode("login");
        setStep(1);
        setError("Registration successful! Please login to continue.");
      }
    }
  };

  const getPassStrength = () => {
    if (!form.password) return 0;
    let s = 0;
    if (form.password.length > 6) s += 25;
    if (/[A-Z]/.test(form.password)) s += 25;
    if (/[0-9]/.test(form.password)) s += 25;
    if (/[^A-Za-z0-9]/.test(form.password)) s += 25;
    return s;
  };

  const handleRoleSelection = (roleId) => {
    if (roleId === 'admin') {
      window.location.hash = "/admin";
    } else if (roleId === 'recruiter') {
      window.location.hash = "/recruiter";
    } else {
      setSelectedRole(roleId);
      setStep(1);
    }
  };

  if (!selectedRole) {
    return (
      <main className="welcome-page">
        <div className="welcome-bg-glow">
          <div className="glow-blob blob-1"></div>
          <div className="glow-blob blob-2"></div>
          <div className="glow-blob blob-3"></div>
        </div>
        <nav className="welcome-nav">
          <div className="nav-logo"><FaGraduationCap /> <span>PLACER-AI</span></div>
          <BackendStatus />
        </nav>
        <section className="welcome-hero">
          <div className="hero-particle-glow"></div>
          <div className="hero-badge">✨ Next-Gen Placement Intelligence</div>
          <h1>AI Powered <span>Placement & Internship</span> Platform</h1>
          <p>Elevate your career with smart matching and recruiter insights.</p>
        </section>
        <div className="welcome-grid-container">
          <div className="role-grid">
            {roles.map(role => (
              <button className="role-card" key={role.id} onClick={() => handleRoleSelection(role.id)}>
                <div className="card-icon-wrap">{role.icon}</div>
                <div className="card-content"><strong>{role.label}</strong><p>{role.text}</p></div>
                <div className="card-footer-cta">Continue <FaArrowRight /></div>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`onboarding-split-container ${selectedRole === 'admin' ? 'admin-theme' : ''}`}>
      <section className="onboarding-left">
        <div className="branding-visual-elements">
          <div className="glow-blob blob-purple"></div>
          <div className="glow-blob blob-blue"></div>
          <div className="grid-texture"></div>
          <div className="floating-particles"></div>
          <div className="abstract-dashboard-element">
             <div className="graph-line"></div>
             <div className="graph-bars">
                <div className="bar" style={{height: '40%'}}></div>
                <div className="bar" style={{height: '70%'}}></div>
                <div className="bar" style={{height: '50%'}}></div>
                <div className="bar" style={{height: '90%'}}></div>
             </div>
          </div>
        </div>

        <div className="auth-left-content">
          <div className="branding-header-group">
            <div className="auth-left-logo" onClick={() => setSelectedRole("")} style={{ cursor: 'pointer' }}>
              <FaGraduationCap className="logo-glow-icon" />
              <span>PLACER-AI</span>
            </div>
            <div className="hero-mini-badge">AI Powered Placement Platform</div>
          </div>

          <div className="branding-main-content">
            <h1 className="branding-headline">Launch Your Career Journey with <span className="gradient-text-purple">AI</span></h1>
            <p className="branding-subtext">Smart internship matching, recruiter connections and placement workflows built for modern students.</p>
            
            <div className="branding-features-list">
              <div className="feature-row">
                <div className="feature-icon-wrap"><FaCheckCircle /></div>
                <span>AI Resume Matching</span>
              </div>
              <div className="feature-row">
                <div className="feature-icon-wrap"><FaChartLine /></div>
                <span>Smart Placement Tracking</span>
              </div>
              <div className="feature-row">
                <div className="feature-icon-wrap"><FaNetworkWired /></div>
                <span>Recruiter Network Access</span>
              </div>
            </div>
          </div>

          <div className="branding-stats-container">
            <div className="stats-glass-card">
              <strong>12K+</strong>
              <span>Students</span>
              <div className="card-glow"></div>
            </div>
            <div className="stats-glass-card">
              <strong>350+</strong>
              <span>Recruiters</span>
              <div className="card-glow"></div>
            </div>
            <div className="stats-glass-card">
              <strong>92%</strong>
              <span>Placement Rate</span>
              <div className="card-glow"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="onboarding-right">
        <div className="onboarding-form-wrap">
          <div className="onboarding-card glass-card">
            <button className="back-to-portal-btn" onClick={() => { setSelectedRole(""); setStep(1); }} title="Back to Role Selection">
              <FaArrowLeft /> Back to Selection
            </button>

            {/* Premium Logo Header Section */}
            <div className="auth-brand-logo-container">
              <div className="auth-brand-logo-icon">
                <FaGraduationCap />
              </div>
              <h1 className="auth-brand-name">PLACER-AI</h1>
              <p className="auth-brand-subtitle">AI Powered Placement Intelligence Platform</p>
            </div>

            <div className="onboarding-header">
               <div className="role-portal-badge-premium">{roleTitle} Portal</div>
               <h2>
                 {mode === "login" 
                   ? (selectedRole === 'admin' ? "Administrator Access" : `${roleTitle} Login`) 
                   : (selectedRole === 'admin' ? "Admin Registration" : `Student Registration`)}
               </h2>
               <p>{mode === "login" ? `Secure access to your ${selectedRole} profile` : `Complete the 5 steps to set up your placement profile`}</p>
            </div>

            <div className="auth-mode-tabs">
               <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setStep(1); }}>Login</button>
               <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setStep(1); }}>Register</button>
            </div>

            <form className="auth-modern-form" onSubmit={handleSubmit}>
              {mode === "login" ? (
                <div className="step-fade-in">
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-with-icon">
                      <FaEnvelope />
                      <input type="email" placeholder="email@placer.ai" value={form.email} onChange={e => updateField("email", e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <div className="input-with-icon">
                      <FaLock />
                      <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={e => updateField("password", e.target.value)} required style={{ paddingRight: "48px" }} />
                      <button type="button" className="pass-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div className="auth-options-row">
                    <label className="remember-me">
                      <input type="checkbox" /> Remember me
                    </label>
                    <button type="button" className="text-link">Forgot Password?</button>
                  </div>
                  <button type="submit" className="auth-primary-btn" disabled={googleLoading}>
                    Login to Account <FaSignInAlt />
                  </button>
                  <div className="auth-divider"><span>OR</span></div>
                  <button type="button" className="google-auth-btn" onClick={() => setShowGoogleChooser(true)} disabled={googleLoading}>
                    <svg className="google-icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                  
                  {/* Grouped Security Indicators */}
                  <div className="auth-security-group">
                    <div className="security-item">
                      <FaShieldAlt className="sec-icon" />
                      <span>Secure & Encrypted Student Login</span>
                    </div>
                    <div className="security-item">
                      <FaLock className="sec-icon" />
                      <span>Protected by AI-driven security monitoring</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="step-content">
                  <div className="stepper-container">
                    <div className="stepper-bar"><div className="stepper-fill" style={{ width: `${(step - 1) * 25}%` }}></div></div>
                    <div className="steps-row">
                      {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={`step-node ${step === s ? 'active' : step > s ? 'completed' : ''}`}>
                          <div className="node-icon">{step > s ? <FaCheck /> : s}</div>
                          <span className="step-label-text">
                            {s === 1 ? "Personal" : s === 2 ? "Academic" : s === 3 ? "Skills" : s === 4 ? "Links" : "Verify"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {step === 1 && (
                    <div className="step-fade-in">
                      <div className="photo-upload-container">
                        <div className="photo-preview-box" onClick={() => fileInputRef.current.click()}>
                          {form.photo ? <img src={form.photo} alt="Preview" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <FaCamera />}
                        </div>
                        <input type="file" ref={fileInputRef} hidden onChange={e => {
                          const file = e.target.files[0];
                          if(file) updateField("photo", URL.createObjectURL(file));
                        }} />
                        <p>Upload Profile Photo</p>
                      </div>
                      <div className="form-group"><label>Full Name</label><div className="input-with-icon"><FaUser /><input placeholder="John Doe" value={form.name} onChange={e => updateField("name", e.target.value)} required /></div></div>
                      <div className="form-grid">
                        <div className="form-group"><label>Email Address</label><div className="input-with-icon"><FaEnvelope /><input type="email" placeholder="john@example.com" value={form.email} onChange={e => updateField("email", e.target.value)} required /></div></div>
                        <div className="form-group"><label>Mobile Number</label><div className="input-with-icon"><FaPhoneAlt /><input placeholder="+91 0000000000" value={form.phone} onChange={e => updateField("phone", e.target.value)} required /></div></div>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Password</label>
                          <div className="input-with-icon">
                            <FaLock /><input type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={e => updateField("password", e.target.value)} required />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Confirm Password</label>
                          <div className="input-with-icon">
                            <FaLock /><input type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.confirmPassword} onChange={e => updateField("confirmPassword", e.target.value)} required />
                          </div>
                        </div>
                      </div>
                      <div className="password-strength">
                        <div className="strength-bar"><div className="fill" style={{ width: `${getPassStrength()}%`, background: getPassStrength() < 50 ? 'var(--red)' : getPassStrength() < 100 ? 'var(--amber)' : 'var(--green)' }}></div></div>
                        <p>Password Strength</p>
                      </div>
                      <button type="button" className="auth-primary-btn" onClick={handleNext}>Next: Academic Details <FaArrowRight /></button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="step-fade-in">
                      <div className="form-group"><label>College Name</label><div className="input-with-icon"><FaUniversity /><input value={form.college} onChange={e => updateField("college", e.target.value)} /></div></div>
                      <div className="form-grid">
                        <div className="form-group"><label>University Name</label><input value={form.university} onChange={e => updateField("university", e.target.value)} /></div>
                        <div className="form-group"><label>PRN / Roll Number</label><div className="input-with-icon"><FaIdBadge /><input placeholder="12345678" value={form.rollNumber} onChange={e => updateField("rollNumber", e.target.value)} /></div></div>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Branch</label>
                          <select value={form.branch} onChange={e => updateField("branch", e.target.value)}>
                            {branches.map(b => <option key={b}>{b}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Current Year</label>
                          <select value={form.year} onChange={e => updateField("year", e.target.value)}>
                            {["First Year", "Second Year", "Third Year", "Final Year"].map(y => <option key={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="form-grid">
                        <div className="form-group"><label>Passing Year</label><input type="number" placeholder="2026" value={form.passingYear} onChange={e => updateField("passingYear", e.target.value)} /></div>
                        <div className="form-group"><label>Current CGPA</label><input step="0.01" type="number" placeholder="9.5" value={form.cgpa} onChange={e => updateField("cgpa", e.target.value)} /></div>
                        <div className="form-group"><label>Active Backlogs</label><input type="number" value={form.backlogs} onChange={e => updateField("backlogs", e.target.value)} /></div>
                      </div>
                      <div className="step-actions">
                        <button type="button" className="auth-secondary-btn" onClick={handlePrev}>Previous</button>
                        <button type="button" className="auth-primary-btn" onClick={handleNext}>Next: Skills & Career <FaArrowRight /></button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="step-fade-in">
                      <div className="form-group">
                        <label>Skills (Press Enter to add)</label>
                        <div className="skills-tag-input">
                          {form.skills.map(s => <span key={s} className="skill-chip">{s} <FaTimes onClick={() => removeSkill(s)} /></span>)}
                          <input placeholder="Add Skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd(skillInput))} />
                        </div>
                        <div className="skill-suggestions">
                          {skillSuggestions.slice(0, 5).map(s => <button key={s} type="button" onClick={() => handleSkillAdd(s)}>+ {s}</button>)}
                        </div>
                      </div>
                      <div className="form-group"><label>Career Interests</label><textarea placeholder="Briefly describe your career goals..." value={form.careerInterests} onChange={e => updateField("careerInterests", e.target.value)} style={{width:'100%',padding:'12px',borderRadius:'12px',border:'1px solid var(--line)',background:'#f8fafc',minHeight:'80px'}}></textarea></div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Preferred Role</label>
                          <select value={form.preferredRole} onChange={e => updateField("preferredRole", e.target.value)}>
                            {preferredRoles.map(r => <option key={r}>{r}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Preferred Location</label>
                          <select value={form.preferredLocation} onChange={e => updateField("preferredLocation", e.target.value)}>
                            {preferredLocations.map(l => <option key={l}>{l}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="step-actions">
                        <button type="button" className="auth-secondary-btn" onClick={handlePrev}>Previous</button>
                        <button type="button" className="auth-primary-btn" onClick={handleNext}>Next: Professional Links <FaArrowRight /></button>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="step-fade-in">
                      <div className="form-group"><label>LinkedIn Profile URL</label><div className="input-with-icon"><FaLinkedin /><input placeholder="https://linkedin.com/in/username" value={form.linkedin} onChange={e => updateField("linkedin", e.target.value)} /></div></div>
                      <div className="form-group"><label>GitHub Profile URL</label><div className="input-with-icon"><FaGithub /><input placeholder="https://github.com/username" value={form.github} onChange={e => updateField("github", e.target.value)} /></div></div>
                      <div className="form-group"><label>Portfolio Website URL (Optional)</label><div className="input-with-icon"><FaGlobe /><input placeholder="https://portfolio.me" value={form.portfolio} onChange={e => updateField("portfolio", e.target.value)} /></div></div>
                      <div className="step-actions">
                        <button type="button" className="auth-secondary-btn" onClick={handlePrev}>Previous</button>
                        <button type="button" className="auth-primary-btn" onClick={handleNext}>Next: Resume & Verification <FaArrowRight /></button>
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="step-fade-in">
                      <div className="resume-drop-zone" onClick={() => fileInputRef.current.click()}>
                        <FaCloudUploadAlt />
                        <p>{form.resume ? form.resume.name : "Upload Resume (PDF/DOCX)"}</p>
                        <span>Max file size: 5MB</span>
                      </div>
                      <input type="file" ref={fileInputRef} hidden onChange={e => updateField("resume", e.target.files[0])} />
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Security Question</label>
                          <select value={form.securityQuestion} onChange={e => updateField("securityQuestion", e.target.value)}>
                            {securityQuestions.map(q => <option key={q}>{q}</option>)}
                          </select>
                        </div>
                        <div className="form-group"><label>Security Answer</label><input placeholder="Answer" value={form.securityAnswer} onChange={e => updateField("securityAnswer", e.target.value)} /></div>
                      </div>
                      <div className="terms-row">
                        <input type="checkbox" id="terms" checked={form.termsAccepted} onChange={e => updateField("termsAccepted", e.target.checked)} />
                        <label htmlFor="terms">I agree to the <a href="#">Terms & Conditions</a> and placement policy.</label>
                      </div>
                      <div className="step-actions">
                        <button type="button" className="auth-secondary-btn" onClick={handlePrev}>Previous</button>
                        <button type="submit" className="auth-primary-btn">Complete Registration <FaRocket /></button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && <div className="auth-error-msg">{error}</div>}
              
              {mode !== "login" && (
                <div className="auth-footer-links">
                  <div className="secure-access-indicator"><FaShieldAlt /> <span>Protected by AI-driven security monitoring</span></div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Google Chooser Popup Overlay */}
      {showGoogleChooser && (
        <div 
          className="google-chooser-overlay" 
          onClick={() => setShowGoogleChooser(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-chooser-title"
        >
          <div className="google-chooser-card student-theme-modal" onClick={e => e.stopPropagation()}>
            <div className="google-chooser-header">
              <div className="google-chooser-brand-badge">
                <FaGraduationCap style={{ marginRight: '4px' }} /> PLACER-AI Student Portal
              </div>
              <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '12px', display: 'inline-block' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <h3 id="google-chooser-title">Sign in with Google</h3>
              <p>Choose an account to continue to <strong>Placer-AI</strong></p>
            </div>
            <div className="google-chooser-accounts">
              <button 
                type="button" 
                className="google-account-row highlighted" 
                onClick={() => handleGoogleLoginSelect("student@placer.ai", "Rahul Kumar", "student")}
                aria-label="Sign in as Rahul Kumar, Student"
              >
                <div className="google-avatar-mock">RK</div>
                <div className="google-account-info">
                  <strong>Rahul Kumar</strong>
                  <span>student@placer.ai</span>
                </div>
                <div className="google-role-badge badge-student">Student</div>
              </button>
              <button 
                type="button" 
                className="google-account-row" 
                onClick={() => handleGoogleLoginSelect("recruiter@google.com", "Google Recruiter", "recruiter")}
                aria-label="Sign in as Google India Recruiter, Recruiter"
              >
                <div className="google-avatar-mock google-rec">GR</div>
                <div className="google-account-info">
                  <strong>Google India Recruiter</strong>
                  <span>recruiter@google.com</span>
                </div>
                <div className="google-role-badge badge-recruiter">Recruiter</div>
              </button>
              <button 
                type="button" 
                className="google-account-row" 
                onClick={() => handleGoogleLoginSelect("admin@placer.ai", "System Admin", "admin")}
                aria-label="Sign in as Super Admin, Admin"
              >
                <div className="google-avatar-mock google-adm">SA</div>
                <div className="google-account-info">
                  <strong>Super Admin</strong>
                  <span>admin@placer.ai</span>
                </div>
                <div className="google-role-badge badge-admin">Admin</div>
              </button>
            </div>
            <div className="google-chooser-footer">
              <button 
                type="button" 
                className="google-cancel-btn" 
                onClick={() => setShowGoogleChooser(false)}
                aria-label="Cancel sign in"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AuthPage;
