import { useRef, useState, useEffect } from "react";
import { safeGetItem } from "../utils/storage";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBuilding,
  FaCamera,
  FaChartLine,
  FaCheckCircle,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGlobe,
  FaKey,
  FaLock,
  FaPhoneAlt,
  FaShieldAlt,
  FaTimes,
  FaTrash,
  FaUser,
  FaUserTie,
  FaUsers,
  FaBriefcase,
  FaLinkedin,
  FaGoogle,
  FaCheckDouble
} from "react-icons/fa";
import "./recruiter_auth.css";

const industryTypes = [
  "Information Technology",
  "Finance & Banking",
  "Healthcare",
  "Manufacturing",
  "E-commerce",
  "Education",
  "Consulting",
  "Other"
];

const companySizes = [
  "1-50 Employees",
  "51-200 Employees",
  "201-500 Employees",
  "501-1000 Employees",
  "1000+ Employees"
];

const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const ACCEPTED_LOGO_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const initialForm = {
  loginEmail: "",
  loginPassword: "",
  companyName: "",
  companyLogo: "",
  companyWebsite: "",
  industry: industryTypes[0],
  companySize: companySizes[0],
  companyDescription: "",
  fullName: "",
  designation: "",
  email: "",
  phone: "",
  linkedin: "",
  password: "",
  confirmPassword: "",
  registrationId: "",
  termsAccepted: false
};

const isOfficialEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isPhone = (value) => /^[0-9+\-\s()]{8,18}$/.test(value.trim());
const registerSteps = ["Company", "Contact", "Verification", "Security"];

function Field({
  id,
  label,
  icon,
  error,
  children
}) {
  return (
    <div className="form-group">
      {label && <label htmlFor={id}>{label}</label>}
      <div className={icon ? "input-with-icon" : "form-group-input-wrap"}>
        {icon}
        {children}
      </div>
      {error && (
        <p className="validation-error-text" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function TextField({
  id,
  label,
  icon,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  required = true
}) {
  return (
    <Field id={id} label={label} icon={icon} error={error}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </Field>
  );
}

function SelectField({ id, label, icon, value, onChange, options, error }) {
  return (
    <Field id={id} label={label} icon={icon} error={error}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </Field>
  );
}

function TextAreaField({ id, label, value, onChange, placeholder, error }) {
  return (
    <div className="form-group">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="form-group-input-wrap">
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <p className="validation-error-text" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  visible,
  onToggle
}) {
  return (
    <Field id={id} label={label} icon={<FaLock />} error={error}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <button
        type="button"
        className="pass-toggle"
        onClick={onToggle}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <FaEyeSlash /> : <FaEye />}
      </button>
    </Field>
  );
}

function CompanyLogoUpload({ value, error, onChange, onError }) {
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      onError("Upload a JPG, JPEG, or PNG company logo.");
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      onError("Company logo must be 2 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onError("");
      onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-photo-uploader">
      <div className="photo-preview-box" onClick={() => inputRef.current?.click()}>
        {value ? (
          <img src={value} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <FaBuilding />
        )}
      </div>
      <input
        ref={inputRef}
        id="company-logo-file"
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        hidden
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <div className="photo-uploader-actions">
        <button type="button" className="photo-action-btn" onClick={() => inputRef.current?.click()}>
          <FaCamera /> {value ? "Change Logo" : "Upload Logo"}
        </button>
        {value && (
          <button type="button" className="photo-action-btn danger" onClick={() => onChange("")}>
            <FaTrash /> Remove
          </button>
        )}
      </div>
      {error && <p className="validation-error-text center">{error}</p>}
    </div>
  );
}

function RecruiterAuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [showLinkedinChooser, setShowLinkedinChooser] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowGoogleChooser(false);
        setShowLinkedinChooser(false);
      }
    };
    if (showGoogleChooser || showLinkedinChooser) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showGoogleChooser, showLinkedinChooser]);

  const handleGoogleLoginSelect = (email, name, company, role = "recruiter") => {
    setIsLoading(true);
    setShowGoogleChooser(false);
    setFeedback(null);
    window.setTimeout(() => {
      setIsLoading(false);
      setFeedback({ type: "success", message: `Access verified. Opening ${role} portal...` });

      const nextUser = {
        id: `google-${role}-${Date.now()}`,
        role: role,
        name: name,
        email: email,
        company: role === "recruiter" ? company : undefined,
        photo: ""
      };

      localStorage.setItem("placer_current_user", JSON.stringify(nextUser));

      const users = safeGetItem("placer_users", []);
      if (!users.some(u => u.email?.toLowerCase() === email.toLowerCase() && u.role === role)) {
        users.push({
          ...nextUser,
          fullName: name,
          companyName: role === "recruiter" ? company : undefined,
          status: "Approved",
          createdAt: new Date().toLocaleString()
        });
        try {
          localStorage.setItem("placer_users", JSON.stringify(users));
        } catch (e) {}
      }

      window.setTimeout(() => {
        onAuth(nextUser);
      }, 500);
    }, 1000);
  };

  const handleLinkedinLoginSelect = (email, name, company, role = "recruiter") => {
    setIsLoading(true);
    setShowLinkedinChooser(false);
    setFeedback(null);
    window.setTimeout(() => {
      setIsLoading(false);
      setFeedback({ type: "success", message: `Access verified. Opening ${role} portal...` });

      const nextUser = {
        id: `linkedin-${role}-${Date.now()}`,
        role: role,
        name: name,
        email: email,
        company: role === "recruiter" ? company : undefined,
        photo: ""
      };

      localStorage.setItem("placer_current_user", JSON.stringify(nextUser));

      const users = safeGetItem("placer_users", []);
      if (!users.some(u => u.email?.toLowerCase() === email.toLowerCase() && u.role === role)) {
        users.push({
          ...nextUser,
          fullName: name,
          companyName: role === "recruiter" ? company : undefined,
          status: "Approved",
          createdAt: new Date().toLocaleString()
        });
        try {
          localStorage.setItem("placer_users", JSON.stringify(users));
        } catch (e) {}
      }

      window.setTimeout(() => {
        onAuth(nextUser);
      }, 500);
    }, 1000);
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setFeedback(null);
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setStep(1);
    setErrors({});
    setFeedback(null);
    setIsLoading(false);
  };

  const validateLogin = () => {
    const nextErrors = {};
    if (!form.loginEmail.trim()) nextErrors.loginEmail = "Official company email is required.";
    else if (!isOfficialEmail(form.loginEmail)) nextErrors.loginEmail = "Enter a valid official email address.";

    if (!form.loginPassword) nextErrors.loginPassword = "Password is required.";
    else if (form.loginPassword.length < 6) nextErrors.loginPassword = "Password must be at least 6 characters.";

    return nextErrors;
  };

  const validateRegister = () => {
    const nextErrors = {};
    // Step 1: Company
    if (!form.companyName.trim()) nextErrors.companyName = "Company name is required.";
    
    // Step 2: Contact
    if (!form.fullName.trim()) nextErrors.fullName = "HR contact name is required.";
    if (!form.phone.trim()) nextErrors.phone = "Mobile number is required.";
    else if (!isPhone(form.phone)) nextErrors.phone = "Enter a valid mobile number.";
    if (!form.email.trim()) nextErrors.email = "Official email is required.";
    else if (!isOfficialEmail(form.email)) nextErrors.email = "Enter a valid official email address.";

    // Step 4: Security
    if (!form.password) nextErrors.password = "Password is required.";
    else if (form.password.length < 8) nextErrors.password = "Use at least 8 characters.";

    if (!form.confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = "Passwords do not match.";

    if (!form.termsAccepted) nextErrors.termsAccepted = "You must accept the terms & conditions.";

    return nextErrors;
  };

  const validateRegisterStep = (targetStep = step) => {
    const allErrors = validateRegister();
    const fieldsByStep = {
      1: ["companyName"],
      2: ["fullName", "phone", "email"],
      3: [],
      4: ["password", "confirmPassword", "termsAccepted"]
    };
    const allowedFields = fieldsByStep[targetStep] || [];
    return Object.fromEntries(Object.entries(allErrors).filter(([field]) => allowedFields.includes(field)));
  };

  const handleNextStep = () => {
    const stepErrors = validateRegisterStep(step);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      setFeedback({ type: "error", message: "Please correct the highlighted fields." });
      return;
    }
    setFeedback(null);
    setStep((current) => Math.min(current + 1, registerSteps.length));
  };

  const handlePrevStep = () => {
    setFeedback(null);
    setErrors({});
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = mode === "login" ? validateLogin() : validateRegister();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setFeedback({ type: "error", message: "Please correct the highlighted fields." });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    window.setTimeout(() => {
      setIsLoading(false);

      if (mode === "login") {
        setFeedback({ type: "success", message: "Access verified. Opening recruiter portal..." });
        window.setTimeout(() => {
          const users = safeGetItem("placer_users", []);
          const found = users.find(
            (user) => user.email?.toLowerCase() === form.loginEmail.toLowerCase() && user.role === "recruiter"
          );

          const authenticatedUser = found ? {
            id: found.id,
            role: "recruiter",
            name: found.fullName || "HR Partner",
            email: found.email,
            company: found.companyName || "Google India",
            photo: found.companyLogo || ""
          } : {
            id: `recruiter-${Date.now()}`,
            role: "recruiter",
            name: form.fullName || "HR Partner",
            email: form.loginEmail,
            company: form.companyName || "Google India",
            photo: form.companyLogo || ""
          };

          localStorage.setItem("placer_current_user", JSON.stringify(authenticatedUser));
          onAuth(authenticatedUser);
        }, 500);
        return;
      }

      const users = safeGetItem("placer_users", []);
      const newRecruiter = {
        ...form,
        id: `recruiter-${Date.now()}`,
        role: "recruiter",
        status: "Approved",
        createdAt: new Date().toLocaleString()
      };
      users.push(newRecruiter);
      try {
        localStorage.setItem("placer_users", JSON.stringify(users));
      } catch (e) {}

      setFeedback({
        type: "success",
        message: "Registration submitted for institutional approval."
      });
      window.setTimeout(() => {
        switchMode("login");
      }, 1500);
    }, 700);
  };

  return (
    <main className="onboarding-split-container recruiter-theme">
      <section className="onboarding-left">
        <div className="branding-visual-elements">
          <div className="glow-blob blob-purple"></div>
          <div className="glow-blob blob-blue"></div>
          <div className="grid-texture"></div>
          <div className="abstract-dashboard-element">
             <div className="graph-line"></div>
             <div className="graph-bars">
                <div className="bar" style={{height: '35%'}}></div>
                <div className="bar" style={{height: '80%'}}></div>
                <div className="bar" style={{height: '60%'}}></div>
                <div className="bar" style={{height: '75%'}}></div>
             </div>
          </div>
        </div>

        <div className="auth-left-content">
          <div className="branding-header-group">
            <div className="auth-left-logo" onClick={() => window.location.hash = "/"} style={{ cursor: 'pointer' }}>
              <FaBriefcase className="logo-glow-icon" />
              <span>PLACER-AI</span>
            </div>
            <div className="hero-mini-badge">Recruiter Portal</div>
          </div>

          <div className="branding-main-content">
            <h3 className="admin-left-title">Find Top Talent Faster</h3>
            <h1 className="admin-left-subtitle">RECRUITER PORTAL</h1>
            <p className="branding-subtext">
              Manage hiring, internships, campus recruitment and candidate screening from one intelligent platform.
            </p>
            
            <div className="branding-features-list">
              <div className="feature-row">
                <div className="feature-icon-wrap"><FaUserTie /></div>
                <span>Candidate Management</span>
              </div>
              <div className="feature-row">
                <div className="feature-icon-wrap"><FaShieldAlt /></div>
                <span>Smart Resume Screening</span>
              </div>
              <div className="feature-row">
                <div className="feature-icon-wrap"><FaBriefcase /></div>
                <span>Campus Hiring</span>
              </div>
              <div className="feature-row">
                <div className="feature-icon-wrap"><FaChartLine /></div>
                <span>Application Tracking</span>
              </div>
            </div>
          </div>

          <div className="branding-stats-container">
            <div className="stats-glass-card">
              <strong>5000+</strong>
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
              <span>Success</span>
              <div className="card-glow"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="onboarding-right">
        <div className="onboarding-form-wrap">
          <div className="onboarding-card glass-card">
            <button
              type="button"
              className="back-to-portal-btn"
              onClick={() => { window.location.hash = "/"; }}
            >
              <FaArrowLeft /> Back to Selection
            </button>

            <div className="auth-brand-logo-container">
              <div className="auth-brand-logo-icon">
                <FaBriefcase />
              </div>
              <h1 className="auth-brand-name">PLACER-AI</h1>
              <p className="auth-brand-subtitle">RECRUITER PORTAL</p>
            </div>

            <div className="onboarding-header">
               <div className="role-portal-badge-premium">Recruiter Access</div>
               <h2>Recruiter Access</h2>
               <p>Access your hiring dashboard</p>
            </div>

            <div className="auth-mode-tabs">
               <button
                 type="button"
                 className={mode === 'login' ? 'active' : ''}
                 onClick={() => switchMode('login')}
               >
                 Login
               </button>
               <button
                 type="button"
                 className={mode === 'register' ? 'active' : ''}
                 onClick={() => switchMode('register')}
               >
                 Register
               </button>
            </div>

            {feedback && (
              <div className={`auth-error-msg ${feedback.type === 'success' ? 'success' : 'error'}`}>
                <span>{feedback.message}</span>
              </div>
            )}

            <form className="auth-modern-form" onSubmit={handleSubmit} noValidate>
              {mode === "login" ? (
                <div className="step-fade-in">
                  <TextField
                    id="rec-login-email"
                    label="Official Company Email"
                    icon={<FaEnvelope />}
                    type="email"
                    value={form.loginEmail}
                    onChange={(value) => updateField("loginEmail", value)}
                    placeholder="hr@company.com"
                    autoComplete="username"
                    error={errors.loginEmail}
                  />
                  <PasswordField
                    id="rec-login-password"
                    label="Password"
                    value={form.loginPassword}
                    onChange={(value) => updateField("loginPassword", value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    visible={showLoginPassword}
                    onToggle={() => setShowLoginPassword((value) => !value)}
                    error={errors.loginPassword}
                  />

                  <div className="auth-options-row">
                    <label className="remember-me" htmlFor="rec-remember">
                      <input
                        id="rec-remember"
                        type="checkbox"
                        style={{ marginRight: '8px' }}
                      />
                      Remember Me
                    </label>
                    <button type="button" className="text-link">Forgot Password?</button>
                  </div>

                  <button type="submit" className="auth-primary-btn" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Login to Platform"}
                  </button>

                  <div className="auth-divider"><span>OR</span></div>

                  <div className="rec-social-login">
                    <button
                      type="button"
                      className="social-btn google-btn"
                      onClick={() => setShowGoogleChooser(true)}
                    >
                      <svg className="google-icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '18px', height: '18px', marginRight: '4px' }}>
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </button>
                    <button
                      type="button"
                      className="social-btn linkedin-btn"
                      onClick={() => setShowLinkedinChooser(true)}
                    >
                      <FaLinkedin /> Continue with LinkedIn
                    </button>
                  </div>
                </div>
              ) : (
                <div className="step-content">
                  <div className="stepper-container">
                    <div className="stepper-bar">
                      <div
                        className="stepper-fill"
                        style={{ width: `${((step - 1) / (registerSteps.length - 1)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="steps-row">
                      {registerSteps.map((label, index) => {
                        const number = index + 1;
                        return (
                          <div
                            key={label}
                            className={`step-node ${step === number ? 'active' : step > number ? 'completed' : ''}`}
                          >
                            <div className="node-icon">
                              {step > number ? <FaCheckCircle /> : number}
                            </div>
                            <span className="step-label-text">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {step === 1 && (
                    <div className="step-fade-in">
                      <CompanyLogoUpload
                        value={form.companyLogo}
                        onChange={(value) => updateField("companyLogo", value)}
                        error={errors.companyLogo}
                        onError={(message) => setErrors((current) => ({ ...current, companyLogo: message }))}
                      />
                      <TextField
                        id="rec-register-company"
                        label="Company Name"
                        icon={<FaBuilding />}
                        value={form.companyName}
                        onChange={(value) => updateField("companyName", value)}
                        placeholder="Google India"
                        autoComplete="organization"
                        error={errors.companyName}
                      />
                      <div className="form-grid">
                        <SelectField
                          id="rec-register-industry"
                          label="Industry Type"
                          icon={<FaBriefcase />}
                          value={form.industry}
                          onChange={(value) => updateField("industry", value)}
                          options={industryTypes}
                          error={errors.industry}
                        />
                        <TextField
                          id="rec-register-website"
                          label="Company Website"
                          icon={<FaGlobe />}
                          value={form.companyWebsite}
                          onChange={(value) => updateField("companyWebsite", value)}
                          placeholder="https://google.com"
                          error={errors.companyWebsite}
                        />
                      </div>
                      <SelectField
                        id="rec-register-size"
                        label="Company Size"
                        icon={<FaUsers />}
                        value={form.companySize}
                        onChange={(value) => updateField("companySize", value)}
                        options={companySizes}
                        error={errors.companySize}
                      />
                      <TextAreaField
                        id="rec-register-desc"
                        label="Company Description"
                        value={form.companyDescription}
                        onChange={(value) => updateField("companyDescription", value)}
                        placeholder="Brief overview of company operations..."
                        error={errors.companyDescription}
                      />
                      <button type="button" className="auth-primary-btn" onClick={handleNextStep}>
                        Next: Contact Details <FaArrowRight />
                      </button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="step-fade-in">
                      <TextField
                        id="rec-register-name"
                        label="HR Contact Name"
                        icon={<FaUser />}
                        value={form.fullName}
                        onChange={(value) => updateField("fullName", value)}
                        placeholder="John Doe"
                        autoComplete="name"
                        error={errors.fullName}
                      />
                      <TextField
                        id="rec-register-designation"
                        label="Designation"
                        icon={<FaBriefcase />}
                        value={form.designation}
                        onChange={(value) => updateField("designation", value)}
                        placeholder="Lead Recruiter"
                        error={errors.designation}
                      />
                      <div className="form-grid">
                        <TextField
                          id="rec-register-phone"
                          label="Mobile Number"
                          icon={<FaPhoneAlt />}
                          value={form.phone}
                          onChange={(value) => updateField("phone", value)}
                          placeholder="+91 98765 43210"
                          autoComplete="tel"
                          inputMode="tel"
                          error={errors.phone}
                        />
                        <TextField
                          id="rec-register-email"
                          label="Official Email"
                          icon={<FaEnvelope />}
                          type="email"
                          value={form.email}
                          onChange={(value) => updateField("email", value)}
                          placeholder="john@google.com"
                          autoComplete="email"
                          error={errors.email}
                        />
                      </div>
                      <TextField
                        id="rec-register-linkedin"
                        label="LinkedIn Profile URL (Optional)"
                        icon={<FaLinkedin />}
                        value={form.linkedin}
                        onChange={(value) => updateField("linkedin", value)}
                        placeholder="https://linkedin.com/in/username"
                        error={errors.linkedin}
                      />
                      <div className="step-actions">
                        <button type="button" className="auth-secondary-btn" onClick={handlePrevStep}>
                          Previous
                        </button>
                        <button type="button" className="auth-primary-btn" onClick={handleNextStep}>
                          Next: Verification <FaArrowRight />
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="step-fade-in">
                      <div className="admin-verification-card">
                        <FaShieldAlt />
                        <div>
                          <strong>Verification Audit In Progress</strong>
                          <p>Entered details will be matched for enterprise security validation.</p>
                        </div>
                      </div>
                      <div className="admin-review-grid">
                        <span>Company</span><strong>{form.companyName || "Not provided"}</strong>
                        <span>Website</span><strong>{form.companyWebsite || "Not provided"}</strong>
                        <span>HR Name</span><strong>{form.fullName || "Not provided"}</strong>
                        <span>Official Email</span><strong>{form.email || "Not provided"}</strong>
                      </div>
                      <TextField
                        id="rec-register-regid"
                        label="Company Registration ID / GST Number (Optional)"
                        icon={<FaKey />}
                        value={form.registrationId}
                        onChange={(value) => updateField("registrationId", value)}
                        placeholder="GSTIN1234567890"
                        error={errors.registrationId}
                      />
                      <div className="step-actions">
                        <button type="button" className="auth-secondary-btn" onClick={handlePrevStep}>
                          Previous
                        </button>
                        <button type="button" className="auth-primary-btn" onClick={handleNextStep}>
                          Next: Security Setup <FaArrowRight />
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="step-fade-in">
                      <div className="form-grid">
                        <PasswordField
                          id="rec-register-password"
                          label="Password"
                          value={form.password}
                          onChange={(value) => updateField("password", value)}
                          placeholder="Create password"
                          autoComplete="new-password"
                          visible={showRegisterPassword}
                          onToggle={() => setShowRegisterPassword((value) => !value)}
                          error={errors.password}
                        />
                        <PasswordField
                          id="rec-register-confirm-password"
                          label="Confirm Password"
                          value={form.confirmPassword}
                          onChange={(value) => updateField("confirmPassword", value)}
                          placeholder="Confirm password"
                          autoComplete="new-password"
                          visible={showConfirmPassword}
                          onToggle={() => setShowConfirmPassword((value) => !value)}
                          error={errors.confirmPassword}
                        />
                      </div>

                      <div className="terms-row">
                        <input
                          type="checkbox"
                          id="rec-terms"
                          checked={form.termsAccepted}
                          onChange={(e) => updateField("termsAccepted", e.target.checked)}
                          style={{ marginTop: '4px' }}
                        />
                        <label htmlFor="rec-terms" style={{ fontSize: '13px', color: '#64748b' }}>
                          I agree to the <a href="#" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Recruitment Terms & Conditions</a> and data policy.
                        </label>
                      </div>
                      {errors.termsAccepted && (
                        <p className="validation-error-text">{errors.termsAccepted}</p>
                      )}

                      <div className="step-actions">
                        <button type="button" className="auth-secondary-btn" onClick={handlePrevStep}>
                          Previous
                        </button>
                        <button type="submit" className="auth-primary-btn" disabled={isLoading}>
                          {isLoading ? "Submitting Application..." : "Complete Registration"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {showGoogleChooser && (
        <div 
          className="google-chooser-overlay" 
          onClick={() => setShowGoogleChooser(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-chooser-title"
        >
          <div className="google-chooser-card recruiter-theme-modal" onClick={e => e.stopPropagation()}>
            <div className="google-chooser-header">
              <div className="google-chooser-brand-badge">
                <FaBriefcase style={{ marginRight: '4px' }} /> PLACER-AI Recruiter Portal
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
                onClick={() => handleGoogleLoginSelect("recruiter@google.com", "Google India Recruiter", "Google India", "recruiter")}
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
                className="google-account-row highlighted" 
                onClick={() => handleGoogleLoginSelect("hr-microsoft@microsoft.com", "Microsoft HR Partner", "Microsoft India", "recruiter")}
                aria-label="Sign in as Microsoft HR Partner, Recruiter"
              >
                <div className="google-avatar-mock google-rec">MS</div>
                <div className="google-account-info">
                  <strong>Microsoft HR Partner</strong>
                  <span>hr-microsoft@microsoft.com</span>
                </div>
                <div className="google-role-badge badge-recruiter">Recruiter</div>
              </button>
              <button 
                type="button" 
                className="google-account-row" 
                onClick={() => handleGoogleLoginSelect("student@placer.ai", "Rahul Kumar", "", "student")}
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
                onClick={() => handleGoogleLoginSelect("admin@placer.ai", "System Admin", "", "admin")}
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

      {showLinkedinChooser && (
        <div 
          className="google-chooser-overlay" 
          onClick={() => setShowLinkedinChooser(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="linkedin-chooser-title"
        >
          <div className="google-chooser-card recruiter-theme-modal" onClick={e => e.stopPropagation()}>
            <div className="google-chooser-header">
              <div className="google-chooser-brand-badge" style={{ background: 'rgba(0, 119, 181, 0.08)', color: '#0077b5', borderColor: 'rgba(0, 119, 181, 0.15)' }}>
                <FaLinkedin style={{ marginRight: '4px' }} /> PLACER-AI Recruiter Portal
              </div>
              <FaLinkedin style={{ fontSize: '36px', color: '#0077b5', marginBottom: '12px' }} />
              <h3 id="linkedin-chooser-title">Sign in with LinkedIn</h3>
              <p>Choose a profile to continue to <strong>Placer-AI</strong></p>
            </div>
            <div className="google-chooser-accounts">
              <button 
                type="button" 
                className="google-account-row highlighted" 
                onClick={() => handleLinkedinLoginSelect("recruiter@linkedin.com", "LinkedIn Talent Partner", "LinkedIn Corporation", "recruiter")}
                aria-label="Sign in as LinkedIn Talent Partner"
              >
                <div className="google-avatar-mock google-rec" style={{ background: '#e6f4ff', color: '#0077b5' }}>LI</div>
                <div className="google-account-info">
                  <strong>LinkedIn Talent Partner</strong>
                  <span>recruiter@linkedin.com</span>
                </div>
                <div className="google-role-badge badge-recruiter">Recruiter</div>
              </button>
              <button 
                type="button" 
                className="google-account-row highlighted" 
                onClick={() => handleLinkedinLoginSelect("hr-amazon@amazon.com", "Amazon Recruiting Specialist", "Amazon India", "recruiter")}
                aria-label="Sign in as Amazon Recruiting Specialist"
              >
                <div className="google-avatar-mock google-adm" style={{ background: '#fff7ed', color: '#ea580c' }}>AM</div>
                <div className="google-account-info">
                  <strong>Amazon Recruiting Specialist</strong>
                  <span>hr-amazon@amazon.com</span>
                </div>
                <div className="google-role-badge badge-recruiter">Recruiter</div>
              </button>
            </div>
            <div className="google-chooser-footer">
              <button 
                type="button" 
                className="google-cancel-btn" 
                onClick={() => setShowLinkedinChooser(false)}
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

export default RecruiterAuthPage;
