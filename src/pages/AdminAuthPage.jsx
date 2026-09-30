import { useRef, useState } from "react";
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
  FaKey,
  FaLock,
  FaPhoneAlt,
  FaShieldAlt,
  FaTimes,
  FaTrash,
  FaUser,
  FaUserCheck,
  FaUserShield,
  FaUsers
} from "react-icons/fa";
import "./admin_auth.css";

const departments = [
  "Training & Placement",
  "Computer Engineering",
  "Information Technology",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Administration"
];

const designations = [
  "Placement Officer",
  "Training Coordinator",
  "Department Admin",
  "HOD",
  "Verification Manager",
  "Super Admin"
];

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const initialForm = {
  loginEmail: "",
  loginPassword: "",
  loginAccessKey: "",
  photo: "",
  fullName: "",
  officialEmail: "",
  contactNumber: "",
  institutionName: "",
  department: departments[0],
  designation: designations[0],
  password: "",
  confirmPassword: "",
  adminAccessKey: ""
};

const isOfficialEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isPhone = (value) => /^[0-9+\-\s()]{8,18}$/.test(value.trim());
const registerSteps = ["Personal", "Institution", "Security", "Verification"];

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

function ProfilePhotoUpload({ value, error, onChange, onError }) {
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      onError("Upload a JPG, JPEG, or PNG profile photo.");
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      onError("Profile photo must be 2 MB or smaller.");
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
          <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <FaUserShield />
        )}
      </div>
      <input
        ref={inputRef}
        id="admin-profile-photo"
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        hidden
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <div className="photo-uploader-actions">
        <button type="button" className="photo-action-btn" onClick={() => inputRef.current?.click()}>
          <FaCamera /> {value ? "Change Image" : "Upload Image"}
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

function AdminAuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    if (!form.loginEmail.trim()) nextErrors.loginEmail = "Official admin email is required.";
    else if (!isOfficialEmail(form.loginEmail)) nextErrors.loginEmail = "Enter a valid official email address.";

    if (!form.loginPassword) nextErrors.loginPassword = "Password is required.";
    else if (form.loginPassword.length < 6) nextErrors.loginPassword = "Password must be at least 6 characters.";

    if (!form.loginAccessKey.trim()) nextErrors.loginAccessKey = "Admin access key or secret code is required.";
    else if (form.loginAccessKey.trim().length < 4) nextErrors.loginAccessKey = "Access key must be at least 4 characters.";

    return nextErrors;
  };

  const validateRegister = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!form.officialEmail.trim()) nextErrors.officialEmail = "Official email is required.";
    else if (!isOfficialEmail(form.officialEmail)) nextErrors.officialEmail = "Enter a valid official email address.";

    if (!form.contactNumber.trim()) nextErrors.contactNumber = "Contact number is required.";
    else if (!isPhone(form.contactNumber)) nextErrors.contactNumber = "Enter a valid contact number.";

    if (!form.department) nextErrors.department = "Department is required.";
    if (!form.designation) nextErrors.designation = "Designation is required.";

    if (!form.password) nextErrors.password = "Password is required.";
    else if (form.password.length < 8) nextErrors.password = "Use at least 8 characters.";

    if (!form.confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = "Passwords do not match.";

    if (!form.adminAccessKey.trim()) nextErrors.adminAccessKey = "Admin access key is required.";
    else if (form.adminAccessKey.trim().length < 4) nextErrors.adminAccessKey = "Access key must be at least 4 characters.";

    return nextErrors;
  };

  const validateRegisterStep = (targetStep = step) => {
    const allErrors = validateRegister();
    const fieldsByStep = {
      1: ["fullName", "officialEmail", "contactNumber"],
      2: ["institutionName", "department", "designation"],
      3: ["password", "confirmPassword", "adminAccessKey"],
      4: []
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
        setFeedback({ type: "success", message: "Access verified. Opening admin portal..." });
        window.setTimeout(() => {
          onAuth({
            id: "admin-123",
            role: "admin",
            name: "Admin User",
            email: form.loginEmail,
            photo: ""
          });
        }, 500);
        return;
      }

      setFeedback({
        type: "success",
        message: "Registration submitted for institutional verification."
      });
    }, 700);
  };

  return (
    <main className="onboarding-split-container admin-theme">
      <section className="onboarding-left">
        <div className="branding-visual-elements">
          <div className="glow-blob blob-purple"></div>
          <div className="glow-blob blob-blue"></div>
          <div className="grid-texture"></div>
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
            <div className="auth-left-logo" onClick={() => window.location.hash = "/"} style={{ cursor: 'pointer' }}>
              <FaUserShield className="logo-glow-icon" />
              <span>PLACER-AI</span>
            </div>
            <div className="hero-mini-badge">Admin Portal</div>
          </div>

          <div className="branding-main-content">
            <h3 className="admin-left-title">PLACER-AI</h3>
            <h1 className="admin-left-subtitle">ADMIN PORTAL</h1>
            <p className="branding-subtext">
              Manage placements, recruiters, applications and institutional analytics from a centralized dashboard.
            </p>
            
            <div className="branding-features-list">
              <div className="feature-row">
                <div className="feature-icon-wrap"><FaUsers /></div>
                <span>Student Management</span>
              </div>
              <div className="feature-row">
                <div className="feature-icon-wrap"><FaBuilding /></div>
                <span>Recruiter Management</span>
              </div>
              <div className="feature-row">
                <div className="feature-icon-wrap"><FaChartLine /></div>
                <span>Placement Analytics</span>
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
            <button
              type="button"
              className="back-to-portal-btn"
              onClick={() => { window.location.hash = "/"; }}
            >
              <FaArrowLeft /> Back to Selection
            </button>

            <div className="auth-brand-logo-container">
              <div className="auth-brand-logo-icon">
                <FaUserShield />
              </div>
              <h1 className="auth-brand-name">PLACER-AI</h1>
              <p className="auth-brand-subtitle">ADMIN PORTAL</p>
            </div>

            <div className="onboarding-header">
               <div className="role-portal-badge-premium">Admin Portal</div>
               <h2>Administrator Access</h2>
               <p>Secure institutional access only</p>
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

            <form className="auth-modern-form" onSubmit={handleSubmit} noValidate>
              {mode === "login" ? (
                <div className="step-fade-in">
                  <TextField
                    id="admin-login-email"
                    label="Official Admin Email"
                    icon={<FaEnvelope />}
                    type="email"
                    value={form.loginEmail}
                    onChange={(value) => updateField("loginEmail", value)}
                    placeholder="admin@institution.edu"
                    autoComplete="username"
                    error={errors.loginEmail}
                  />
                  <PasswordField
                    id="admin-login-password"
                    label="Password"
                    value={form.loginPassword}
                    onChange={(value) => updateField("loginPassword", value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    visible={showLoginPassword}
                    onToggle={() => setShowLoginPassword((value) => !value)}
                    error={errors.loginPassword}
                  />
                  <TextField
                    id="admin-login-access-key"
                    label="Admin Access Key"
                    icon={<FaKey />}
                    type="password"
                    value={form.loginAccessKey}
                    onChange={(value) => updateField("loginAccessKey", value)}
                    placeholder="Enter secure access key"
                    autoComplete="one-time-code"
                    error={errors.loginAccessKey}
                  />

                  <div className="auth-options-row">
                    <label className="remember-me" htmlFor="admin-remember">
                      <input
                        id="admin-remember"
                        type="checkbox"
                        style={{ marginRight: '8px' }}
                      />
                      Remember Me
                    </label>
                    <button type="button" className="text-link">Forgot Password?</button>
                  </div>

                  <button type="submit" className="auth-primary-btn" disabled={isLoading}>
                    {isLoading ? "Verifying Access..." : "Access Admin Portal"}
                  </button>

                  <div className="auth-security-group">
                    <div className="security-item">
                      <FaShieldAlt className="sec-icon" />
                      <span>Secure & Encrypted Admin Login</span>
                    </div>
                    <div className="security-item">
                      <FaLock className="sec-icon" />
                      <span>Protected by institutional security protocols</span>
                    </div>
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
                      <ProfilePhotoUpload
                        value={form.photo}
                        onChange={(value) => updateField("photo", value)}
                        error={errors.photo}
                        onError={(message) => setErrors((current) => ({ ...current, photo: message }))}
                      />
                      <TextField
                        id="admin-register-name"
                        label="Full Name"
                        icon={<FaUser />}
                        value={form.fullName}
                        onChange={(value) => updateField("fullName", value)}
                        placeholder="Dr. Sarah Johnson"
                        autoComplete="name"
                        error={errors.fullName}
                      />
                      <div className="form-grid">
                        <TextField
                          id="admin-register-email"
                          label="Official Email"
                          icon={<FaEnvelope />}
                          type="email"
                          value={form.officialEmail}
                          onChange={(value) => updateField("officialEmail", value)}
                          placeholder="sarah.j@institution.edu"
                          autoComplete="email"
                          error={errors.officialEmail}
                        />
                        <TextField
                          id="admin-register-phone"
                          label="Mobile Number"
                          icon={<FaPhoneAlt />}
                          value={form.contactNumber}
                          onChange={(value) => updateField("contactNumber", value)}
                          placeholder="+91 98765 43210"
                          autoComplete="tel"
                          inputMode="tel"
                          error={errors.contactNumber}
                        />
                      </div>
                      <button type="button" className="auth-primary-btn" onClick={handleNextStep}>
                        Next: Institution Details <FaArrowRight />
                      </button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="step-fade-in">
                      <TextField
                        id="admin-register-institution"
                        label="Institution Name"
                        icon={<FaBuilding />}
                        value={form.institutionName}
                        onChange={(value) => updateField("institutionName", value)}
                        placeholder="D.Y. Patil Institute"
                        autoComplete="organization"
                        error={errors.institutionName}
                      />
                      <div className="form-grid">
                        <SelectField
                          id="admin-register-department"
                          label="Department"
                          icon={<FaBuilding />}
                          value={form.department}
                          onChange={(value) => updateField("department", value)}
                          options={departments}
                          error={errors.department}
                        />
                        <SelectField
                          id="admin-register-designation"
                          label="Designation"
                          icon={<FaUserShield />}
                          value={form.designation}
                          onChange={(value) => updateField("designation", value)}
                          options={designations}
                          error={errors.designation}
                        />
                      </div>
                      <div className="step-actions">
                        <button type="button" className="auth-secondary-btn" onClick={handlePrevStep}>
                          Previous
                        </button>
                        <button type="button" className="auth-primary-btn" onClick={handleNextStep}>
                          Next: Security Details <FaArrowRight />
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="step-fade-in">
                      <div className="form-grid">
                        <PasswordField
                          id="admin-register-password"
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
                          id="admin-register-confirm-password"
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
                      <TextField
                        id="admin-register-key"
                        label="Admin Access Key"
                        icon={<FaKey />}
                        type="password"
                        value={form.adminAccessKey}
                        onChange={(value) => updateField("adminAccessKey", value)}
                        placeholder="Enter issued access key"
                        autoComplete="one-time-code"
                        error={errors.adminAccessKey}
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

                  {step === 4 && (
                    <div className="step-fade-in">
                      <div className="admin-verification-card">
                        <FaShieldAlt />
                        <div>
                          <strong>Ready for Institutional Verification</strong>
                          <p>Your admin account request will be reviewed before dashboard access is enabled.</p>
                        </div>
                      </div>
                      <div className="admin-review-grid">
                        <span>Name</span><strong>{form.fullName || "Not provided"}</strong>
                        <span>Email</span><strong>{form.officialEmail || "Not provided"}</strong>
                        <span>Department</span><strong>{form.department}</strong>
                        <span>Designation</span><strong>{form.designation}</strong>
                      </div>
                      <div className="step-actions">
                        <button type="button" className="auth-secondary-btn" onClick={handlePrevStep}>
                          Previous
                        </button>
                        <button type="submit" className="auth-primary-btn" disabled={isLoading}>
                          {isLoading ? "Submitting Registration..." : "Complete Registration"}
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
    </main>
  );
}

export default AdminAuthPage;
