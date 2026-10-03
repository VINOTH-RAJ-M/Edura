"use client";
import { useState } from "react";
import { COURSE_CURRICULA, CourseModule, ResourceContent, RESOURCE_CONTENTS } from "@/lib/course-data";

export function CourseDetailModal({
  course,
  progress = 0,
  attendance = 0,
  onClose,
  onOpenResource,
}: {
  course: any;
  progress?: number;
  attendance?: number;
  onClose: () => void;
  onOpenResource: (title: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"syllabus" | "overview">("syllabus");
  const curriculum = COURSE_CURRICULA[course.id] || COURSE_CURRICULA[1];

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-ink/10 space-y-5 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-ink/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-soft text-gold-dark text-xs font-bold mb-1 border border-gold/30">
              <span>🎓</span>
              <span>{course.duration_weeks || 8} Weeks Intensive</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-ink">{course.title}</h2>
            <p className="text-xs text-ink/60 mt-0.5">
              Lead Instructor: <b>{course.instructor}</b> • Schedule: <b>{course.schedule}</b>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-ink/5 hover:bg-ink/10 text-ink flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress bar banner */}
        <div className="bg-paper p-4 rounded-xl border border-ink/5 flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1 flex-1 min-w-[200px]">
            <div className="flex justify-between text-xs font-bold text-ink">
              <span>Your Course Completion</span>
              <span className="text-gold-dark">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-ink/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-ink/70 font-semibold px-3 py-1 bg-white rounded-lg border border-ink/10">
            Attendance: <span className="text-ok font-bold">{attendance}%</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-ink/10 pb-2">
          <button
            onClick={() => setActiveTab("syllabus")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "syllabus"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-ink shadow-sm font-bold"
                : "text-ink/60 hover:text-gold-dark"
            }`}
          >
            📚 Curriculum Syllabus ({curriculum.modules.length} Modules)
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-ink shadow-sm font-bold"
                : "text-ink/60 hover:text-gold-dark"
            }`}
          >
            🎯 Course Objectives & Outcomes
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-sm">
          {activeTab === "syllabus" && (
            <div className="space-y-3">
              {curriculum.modules.map((m: CourseModule, mIdx: number) => (
                <div key={m.id} className="border border-ink/10 rounded-xl p-4 bg-paper/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-ink text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-ink font-bold flex items-center justify-center text-xs">
                        {mIdx + 1}
                      </span>
                      <span>{m.title}</span>
                    </h4>
                    <span className="text-[11px] text-ink/50 font-mono">{m.duration}</span>
                  </div>

                  <ul className="space-y-2 pl-7 text-xs">
                    {m.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-ink/5">
                        <span className="flex items-center gap-2 text-ink/85 font-medium">
                          <span>{lesson.completed ? "✅" : "⚪"}</span>
                          <span>{lesson.title}</span>
                        </span>
                        <div className="flex items-center gap-2 text-ink/50">
                          <span className="capitalize px-1.5 py-0.5 rounded bg-paper text-[10px]">
                            {lesson.type}
                          </span>
                          <span>{lesson.duration}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-4 p-2">
              <div>
                <h4 className="font-bold text-ink text-sm mb-1">Course Description</h4>
                <p className="text-xs text-ink/75 leading-relaxed">{curriculum.overview}</p>
              </div>

              <div>
                <h4 className="font-bold text-ink text-sm mb-2">Key Learning Outcomes</h4>
                <ul className="grid sm:grid-cols-2 gap-2 text-xs">
                  {curriculum.learningOutcomes.map((outcome, idx) => (
                    <li key={idx} className="p-3 rounded-lg bg-gold-soft/50 border border-gold/25 text-gold-dark font-medium flex items-start gap-2">
                      <span className="text-gold-dark font-bold">✓</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-ink/10 flex justify-end gap-2">
          <button onClick={onClose} className="btn text-xs px-4 py-2">
            Close Curriculum
          </button>
        </div>
      </div>
    </div>
  );
}

export function ResourceViewerModal({
  resourceTitle,
  onClose,
}: {
  resourceTitle: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const resource: ResourceContent = RESOURCE_CONTENTS[resourceTitle] || {
    id: "generic",
    title: resourceTitle,
    type: "guide",
    description: "Interactive learning workbook and code repository.",
    content: `-- ${resourceTitle}\n-- Sample practice material provided by Edura Academy.\nSELECT * FROM academy_resources WHERE title = '${resourceTitle}';`,
    fileSize: "1.2 MB",
  };

  function copyCode() {
    navigator.clipboard.writeText(resource.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadContent() {
    const blob = new Blob([resource.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resourceTitle.toLowerCase().replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-ink/10 space-y-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-ink/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-soft text-gold-dark text-[10px] font-bold uppercase mb-1 border border-gold/30">
              <span>📄</span>
              <span>{resource.type} • {resource.fileSize || "1.5 MB"}</span>
            </div>
            <h3 className="text-lg font-bold text-ink">{resource.title}</h3>
            <p className="text-xs text-ink/60 mt-0.5">{resource.description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-ink/5 hover:bg-ink/10 text-ink flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto rounded-xl bg-ink-dark text-gold-light p-4 font-mono text-xs leading-relaxed border border-gold/20 relative shadow-inner">
          <pre className="whitespace-pre-wrap">{resource.content}</pre>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex justify-between items-center gap-2 flex-wrap">
          <span className="text-[11px] text-ink/50">Verified Edura Learning Material</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyCode}
              className="btn-ghost text-xs px-3 py-1.5"
            >
              <span>{copied ? "✓ Copied!" : "📋 Copy Content"}</span>
            </button>
            <button
              type="button"
              onClick={downloadContent}
              className="btn text-xs px-3.5 py-1.5 shadow-sm"
            >
              <span>💾 Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
