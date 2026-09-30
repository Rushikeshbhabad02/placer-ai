import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import AIRecommendationCard from "../../components/AIRecommendationCard";
import { semanticSearchJobs } from "../../services/semanticSearchService";
import { FaSearch, FaFilter, FaRobot, FaTimes } from "react-icons/fa";

const sampleQueries = [
  "Python backend developer experienced in REST APIs",
  "React developer with CSS and frontend design",
  "Full stack developer with database experience",
  "Entry level software engineer internship"
];

export default function AISearchPage({ onApplyJob, onSaveJob, appliedJobs = [], savedJobs = [] }) {
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (searchQuery = query) => {
    try {
      setLoading(true);
      setError(null);
      
      const qText = searchQuery.trim() || "Python Software Engineer Developer";
      const res = await semanticSearchJobs(qText, 15);
      
      const rawResults = res?.results || [];
      
      // Filter locally by user-selected dropdown filters if specified
      const filtered = rawResults.filter((j) => {
        const locMatch = locationFilter === "All" || (j.location || "").toLowerCase().includes(locationFilter.toLowerCase());
        const typeMatch = typeFilter === "All" || (j.employment_type || "").toLowerCase().includes(typeFilter.toLowerCase());
        return locMatch && typeMatch;
      });

      const mapped = filtered.map((r) => ({
        id: r.job_id,
        job_id: r.job_id,
        role: r.title,
        title: r.title,
        company: r.company,
        company_name: r.company,
        location: r.location || "Remote",
        type: r.employment_type || "Full Time",
        package: r.salary_range || "Competitive",
        match: Math.round(r.similarity_percentage || (r.semantic_score ? r.semantic_score * 100 : 85)),
        matchedSkills: r.skills_required ? r.skills_required.split(",").map((s) => s.trim()).filter(Boolean) : [],
        missingSkills: [],
        whyRecommended: `Semantic Similarity: ${r.similarity_percentage || Math.round(r.semantic_score * 100)}% match from ChromaDB vector index.`
      }));

      setResults(mapped);
    } catch (e) {
      setError("Semantic search is temporarily unavailable. Standard search remains active.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch("");
  }, [locationFilter, typeFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <FaRobot style={{ color: "var(--primary, #2563eb)" }} /> ChromaDB Semantic Job Search
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>
          Search jobs using natural language sentences powered by local 384-dimensional vector embeddings and ChromaDB.
        </p>
      </div>

      {/* Main Search Input & Sample Chips */}
      <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", width: "100%" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <FaSearch style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Find Python backend developer jobs with relational database experience"
              style={{
                width: "100%",
                padding: "14px 16px 14px 44px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                fontSize: "15px",
                outline: "none"
              }}
            />
          </div>
          <button className="primary-button" style={{ padding: "14px 24px", fontSize: "15px" }} onClick={() => handleSearch()}>
            Semantic Search
          </button>
        </div>

        {/* Quick Query Suggestions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Try natural queries:</span>
          {sampleQueries.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setQuery(sample);
                handleSearch(sample);
              }}
              style={{
                background: "#f1f5f9",
                color: "#334155",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "4px 12px",
                fontSize: "12px",
                cursor: "pointer",
                transition: "background 0.2s ease"
              }}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#fff", padding: "14px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", flexWrap: "wrap" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
          <FaFilter /> Filters:
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Location:</span>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}>
            <option value="All">All Locations</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Pune">Pune</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Job Type:</span>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}>
            <option value="All">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
      </div>

      {/* Results Container */}
      {loading ? (
        <LoadingSpinner message="Generating local 384D dense embeddings & querying ChromaDB index..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => handleSearch()} />
      ) : results.length === 0 ? (
        <EmptyState
          icon="search"
          title="No semantically similar jobs found."
          message="Try broadening your natural language terms or adjusting location filters."
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {results.map((job) => {
            const isApplied = appliedJobs.some((a) => a.company === job.company && a.role === job.role);
            const isSaved = savedJobs.some((s) => s.company === job.company && s.role === job.role);

            return (
              <AIRecommendationCard
                key={job.id || `${job.company}-${job.role}`}
                job={job}
                onApply={onApplyJob}
                onSave={onSaveJob}
                isApplied={isApplied}
                isSaved={isSaved}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
