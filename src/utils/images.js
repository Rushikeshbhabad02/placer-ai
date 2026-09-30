const RANDOM_PROFILE_HOSTS = ["i.pravatar.cc", "pravatar.cc", "ui-avatars.com", "dicebear.com"];

const COMPANY_DOMAINS = {
  accenture: "accenture.com",
  amazon: "amazon.com",
  capgemini: "capgemini.com",
  google: "google.com",
  "google india": "google.com",
  infosis: "infosys.com",
  infosys: "infosys.com",
  "infosys limited": "infosys.com",
  "infosys ltd": "infosys.com",
  microsoft: "microsoft.com",
  "microsoft india": "microsoft.com",
  tata: "tcs.com",
  tcs: "tcs.com",
  "tata consultancy services": "tcs.com",
  "tech mahindra": "techmahindra.com",
  techm: "techmahindra.com",
  wipro: "wipro.com",
  "wipro technologies": "wipro.com"
};

const COMPANY_LOGOS = {
  accenture: "https://commons.wikimedia.org/wiki/Special:FilePath/Accenture.svg",
  amazon: "https://commons.wikimedia.org/wiki/Special:FilePath/Amazon_logo.svg",
  capgemini: "https://commons.wikimedia.org/wiki/Special:FilePath/Logo_Capgemini.png",
  google: "https://commons.wikimedia.org/wiki/Special:FilePath/Google_2015_logo.svg",
  "google india": "https://commons.wikimedia.org/wiki/Special:FilePath/Google_2015_logo.svg",
  infosis: "https://commons.wikimedia.org/wiki/Special:FilePath/Infosys_logo.svg",
  infosys: "https://commons.wikimedia.org/wiki/Special:FilePath/Infosys_logo.svg",
  "infosys limited": "https://commons.wikimedia.org/wiki/Special:FilePath/Infosys_logo.svg",
  "infosys ltd": "https://commons.wikimedia.org/wiki/Special:FilePath/Infosys_logo.svg",
  microsoft: "https://commons.wikimedia.org/wiki/Special:FilePath/Microsoft_logo.svg",
  "microsoft india": "https://commons.wikimedia.org/wiki/Special:FilePath/Microsoft_logo.svg",
  tata: "https://dist.neo4j.com/wp-content/uploads/20210830115959/TCS_Logo.png",
  tcs: "https://dist.neo4j.com/wp-content/uploads/20210830115959/TCS_Logo.png",
  "tata consultancy services": "https://dist.neo4j.com/wp-content/uploads/20210830115959/TCS_Logo.png",
  "tech mahindra": "https://commons.wikimedia.org/wiki/Special:FilePath/Tech_Mahindra_Logo.svg",
  techm: "https://commons.wikimedia.org/wiki/Special:FilePath/Tech_Mahindra_Logo.svg",
  wipro: "https://commons.wikimedia.org/wiki/Special:FilePath/Wipro_new_logo.svg",
  "wipro technologies": "https://commons.wikimedia.org/wiki/Special:FilePath/Wipro_new_logo.svg"
};

const cleanCompanyName = (company = "") =>
  String(company)
    .toLowerCase()
    .replace(/\b(private|pvt|limited|ltd|inc|llc|india|technologies|technology|solutions|services)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const sanitizeProfilePhoto = (photo) => {
  if (!photo) {
    return "";
  }

  const value = String(photo);
  if (value.startsWith("data:image/") || value.startsWith("blob:")) {
    return value;
  }

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    return RANDOM_PROFILE_HOSTS.some((randomHost) => host.includes(randomHost)) ? "" : value;
  } catch {
    return value;
  }
};

export const getCompanyDomain = (company = "") => {
  const exactName = String(company).toLowerCase().trim();
  const cleanedName = cleanCompanyName(company);

  if (COMPANY_DOMAINS[exactName]) {
    return COMPANY_DOMAINS[exactName];
  }

  if (COMPANY_DOMAINS[cleanedName]) {
    return COMPANY_DOMAINS[cleanedName];
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(String(company).trim())) {
    return String(company).trim().toLowerCase();
  }

  return "";
};

const extractDomain = (value = "") => {
  const rawValue = String(value).trim();
  if (!rawValue) {
    return "";
  }

  const withProtocol = /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;

  try {
    return new URL(withProtocol).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(rawValue) ? rawValue.toLowerCase() : "";
  }
};

export const getCompanyLogo = (company, logo, website) => {
  const exactName = String(company || "").toLowerCase().trim();
  const cleanedName = cleanCompanyName(company);

  if (COMPANY_LOGOS[exactName]) {
    return COMPANY_LOGOS[exactName];
  }

  if (COMPANY_LOGOS[cleanedName]) {
    return COMPANY_LOGOS[cleanedName];
  }

  const domain = extractDomain(website) || getCompanyDomain(company);

  if (domain) {
    return `https://logo.clearbit.com/${domain}`;
  }

  if (logo && !String(logo).includes("logo.clearbit.com")) {
    return logo;
  }

  return "";
};

export const normalizeJobImages = (job) => ({
  ...job,
  companyWebsite: job.companyWebsite || job.companyDomain || "",
  logo: getCompanyLogo(job.company, job.logo, job.companyWebsite || job.companyDomain),
  skills: Array.isArray(job.skills) ? job.skills : [],
  match: job.match || 0,
  companyShort: job.companyShort || job.company || ""
});
