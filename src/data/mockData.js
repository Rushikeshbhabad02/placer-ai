// Centralized mock data architecture for PLACER-AI

export const mockJobs = [
  {
    id: "job-101",
    company: "Tata Consultancy Services",
    companyShort: "TCS",
    logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80",
    role: "Python Developer",
    package: "₹4.5–7.0 LPA",
    location: "Pune, India",
    type: "Full Time",
    experience: "0-2 Years",
    postedDate: "2 days ago",
    match: 92,
    status: "Open",
    skills: ["Python", "Django", "SQL", "REST API"],
    missingSkills: ["Docker"],
    whyRecommended: "Your Python, Django and SQL skills closely match the requirements of this position.",
    description: "Looking for a proactive Python developer to build scalable REST services and database workflows.",
    matchedSkillsCount: 4,
    missingSkillsCount: 1
  },
  {
    id: "job-102",
    company: "ABC Technologies",
    companyShort: "ABC Tech",
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80",
    role: "Full Stack Engineer",
    package: "₹6.0–9.0 LPA",
    location: "Bengaluru, India",
    type: "Full Time",
    experience: "0-1 Year",
    postedDate: "1 day ago",
    match: 88,
    status: "Open",
    skills: ["React", "Node.js", "JavaScript", "SQL"],
    missingSkills: ["AWS", "Docker"],
    whyRecommended: "Strong match with your React and SQL coursework and frontend development project experience.",
    description: "Build robust full-stack web applications with modern React frontends and Node.js microservices.",
    matchedSkillsCount: 3,
    missingSkillsCount: 2
  },
  {
    id: "job-103",
    company: "Infosys Limited",
    companyShort: "Infosys",
    logo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80",
    role: "Software Engineer Trainee",
    package: "₹3.8–5.2 LPA",
    location: "Pune, India",
    type: "Full Time",
    experience: "Fresher",
    postedDate: "3 days ago",
    match: 85,
    status: "Open",
    skills: ["Java", "SQL", "DSA", "Problem Solving"],
    missingSkills: ["Spring Boot"],
    whyRecommended: "Your Computer Engineering background and high CGPA align perfectly with fresher intake criteria.",
    description: "Join our flagship engineering batch and undergo intensive hands-on enterprise software training.",
    matchedSkillsCount: 3,
    missingSkillsCount: 1
  },
  {
    id: "job-104",
    company: "Capgemini",
    companyShort: "Capgemini",
    logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
    role: "Data Analyst Intern",
    package: "₹4.0–6.0 LPA",
    location: "Mumbai, India",
    type: "Internship",
    experience: "Fresher",
    postedDate: "5 days ago",
    match: 79,
    status: "Open",
    skills: ["Python", "SQL", "Excel", "Power BI"],
    missingSkills: ["Tableau"],
    whyRecommended: "Good analytical foundation with Python and SQL data querying skills.",
    description: "Analyze enterprise data models, create visual dashboards and deliver business intelligence insights.",
    matchedSkillsCount: 3,
    missingSkillsCount: 1
  },
  {
    id: "job-105",
    company: "Amazon India",
    companyShort: "Amazon",
    logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&auto=format&fit=crop&q=80",
    role: "SDE Intern",
    package: "₹7.5–12.0 LPA",
    location: "Bengaluru, India",
    type: "Internship",
    experience: "Fresher",
    postedDate: "1 week ago",
    match: 81,
    status: "Open",
    skills: ["DSA", "C++", "Java", "System Design"],
    missingSkills: ["Kubernetes", "AWS"],
    whyRecommended: "Solid DSA foundation and academic problem-solving scores match tier-1 requirements.",
    description: "Work with world-class engineering teams building high-throughput cloud infrastructure.",
    matchedSkillsCount: 2,
    missingSkillsCount: 2
  }
];

export const mockSkillGaps = {
  currentSkills: ["React", "JavaScript", "SQL", "DSA", "Python", "HTML", "CSS"],
  targetJobSkills: ["Python", "Django", "SQL", "REST API", "Docker", "AWS", "Kubernetes", "TypeScript"],
  matchedSkills: ["Python", "SQL", "React", "JavaScript"],
  missingSkills: ["Docker", "AWS", "Kubernetes", "TypeScript", "Django"],
  recommendedSkills: [
    {
      skill: "Docker",
      priority: "High",
      reason: "Required by 75% of your recommended backend and DevOps roles.",
      progress: 35
    },
    {
      skill: "AWS Fundamentals",
      priority: "High",
      reason: "Frequently paired with cloud deployment requirements.",
      progress: 20
    },
    {
      skill: "TypeScript",
      priority: "Medium",
      reason: "Enhances your frontend React skill profile for top tech openings.",
      progress: 50
    },
    {
      skill: "REST API Design",
      priority: "Medium",
      reason: "Essential standard for full-stack integration tasks.",
      progress: 65
    }
  ]
};

export const mockInterviews = [
  {
    id: "int-1",
    company: "Infosys Limited",
    companyLogo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80",
    role: "Software Engineer Trainee",
    date: "2026-10-05",
    time: "10:30 AM",
    type: "Technical Interview",
    status: "Scheduled",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    notes: "Focus on Data Structures, SQL queries and final year project explanation."
  },
  {
    id: "int-2",
    company: "Tata Consultancy Services",
    companyLogo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80",
    role: "Frontend Developer",
    date: "2026-10-08",
    time: "02:00 PM",
    type: "HR & Managerial Round",
    status: "Scheduled",
    meetingLink: "https://teams.microsoft.com/l/meetup-join/12345",
    notes: "Be prepared with behavioral questions and internship project details."
  },
  {
    id: "int-3",
    company: "Accenture",
    companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
    role: "Associate Engineer",
    date: "2026-09-20",
    time: "11:00 AM",
    type: "Online Coding Round",
    status: "Completed",
    meetingLink: "https://meet.google.com/xyz-uvwx-rst",
    notes: "Cleared test with 95% score."
  }
];

export const mockAssessments = [
  {
    id: "ass-1",
    title: "Python & SQL Technical Assessment",
    role: "Python Developer",
    durationMinutes: 20,
    totalQuestions: 5,
    passScore: 70,
    status: "Available",
    questions: [
      {
        id: "q1",
        question: "Which of the following is a mutable data structure in Python?",
        options: ["Tuple", "List", "String", "Int"],
        correctIndex: 1
      },
      {
        id: "q2",
        question: "What does the SQL command 'GROUP BY' do?",
        options: [
          "Sorts the result set",
          "Groups rows that have the same values into summary rows",
          "Filters individual rows",
          "Joins two tables together"
        ],
        correctIndex: 1
      },
      {
        id: "q3",
        question: "What is the complexity of searching an element in a balanced Binary Search Tree?",
        options: ["O(n)", "O(1)", "O(log n)", "O(n^2)"],
        correctIndex: 2
      },
      {
        id: "q4",
        question: "Which HTTP status code signifies successful resource creation?",
        options: ["200 OK", "201 Created", "404 Not Found", "500 Internal Error"],
        correctIndex: 1
      },
      {
        id: "q5",
        question: "In Python, which keyword is used to handle exceptions?",
        options: ["catch", "except", "try-catch", "error"],
        correctIndex: 1
      }
    ]
  },
  {
    id: "ass-2",
    title: "React & Frontend Core Skills Evaluation",
    role: "Frontend Developer",
    durationMinutes: 15,
    totalQuestions: 4,
    passScore: 75,
    status: "Completed",
    questions: [
      {
        id: "rq1",
        question: "What hook is used for side-effects in React functional components?",
        options: ["useState", "useContext", "useEffect", "useReducer"],
        correctIndex: 2
      },
      {
        id: "rq2",
        question: "Which property in CSS Flexbox controls alignment along the cross-axis?",
        options: ["justify-content", "align-items", "flex-direction", "grid-gap"],
        correctIndex: 1
      }
    ]
  }
];
