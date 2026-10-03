export type Lesson = {
  id: string;
  title: string;
  duration: string;
  type: "video" | "lab" | "quiz" | "reading";
  completed: boolean;
};

export type CourseModule = {
  id: string;
  title: string;
  duration: string;
  lessons: Lesson[];
};

export type ResourceContent = {
  id: string;
  title: string;
  type: "code" | "guide" | "cheatsheet" | "dataset";
  description: string;
  content: string;
  fileSize?: string;
};

export const COURSE_CURRICULA: Record<number | string, { modules: CourseModule[]; overview: string; learningOutcomes: string[] }> = {
  1: {
    overview: "Master real-world data analytics with practical SQL querying, Excel data modeling, interactive Power BI dashboards, and business stakeholder reporting.",
    learningOutcomes: [
      "Write multi-table SQL queries, window functions, and CTEs",
      "Automate data cleaning and ETL pipelines with Power Query",
      "Build executive-ready Power BI reporting dashboards with DAX",
      "Translate raw datasets into high-impact strategic business decisions",
    ],
    modules: [
      {
        id: "m1",
        title: "Module 1: Advanced SQL for Analytics",
        duration: "2 Weeks",
        lessons: [
          { id: "l1", title: "Relational Schemas, Constraints & Indexes", duration: "45 mins", type: "video", completed: true },
          { id: "l2", title: "Complex Joins, Subqueries & CTEs", duration: "60 mins", type: "lab", completed: true },
          { id: "l3", title: "Window Functions: ROW_NUMBER, RANK, LAG/LEAD", duration: "50 mins", type: "video", completed: true },
          { id: "l4", title: "SQL Query Optimization & Performance Quiz", duration: "30 mins", type: "quiz", completed: false },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Excel & Power Query Data Modeling",
        duration: "2 Weeks",
        lessons: [
          { id: "l5", title: "Advanced XLOOKUP, INDEX-MATCH & Dynamic Arrays", duration: "40 mins", type: "video", completed: false },
          { id: "l6", title: "ETL with Power Query: Transforming Messy Data", duration: "55 mins", type: "lab", completed: false },
          { id: "l7", title: "Financial & Statistical Modeling in Excel", duration: "45 mins", type: "reading", completed: false },
        ],
      },
      {
        id: "m3",
        title: "Module 3: Power BI Dashboards & DAX",
        duration: "2 Weeks",
        lessons: [
          { id: "l8", title: "Star Schema Design & Dimension Tables", duration: "50 mins", type: "video", completed: false },
          { id: "l9", title: "DAX Measures: CALCULATE, ALL, Time Intelligence", duration: "65 mins", type: "lab", completed: false },
          { id: "l10", title: "Interactive Visuals, Bookmarks & Drill-throughs", duration: "45 mins", type: "video", completed: false },
        ],
      },
      {
        id: "m4",
        title: "Module 4: Capstone Industry Project",
        duration: "2 Weeks",
        lessons: [
          { id: "l11", title: "E-commerce Cohort Retention & Churn Analysis", duration: "3 Hours", type: "lab", completed: false },
          { id: "l12", title: "Final Project Presentation & Stakeholder Pitch", duration: "1 Hour", type: "quiz", completed: false },
        ],
      },
    ],
  },
  2: {
    overview: "Build modern, scalable full-stack applications with React 19, Next.js App Router, Tailwind CSS, TypeScript, Supabase, and PostgreSQL.",
    learningOutcomes: [
      "Architect full-stack apps with Next.js App Router & Server Components",
      "Design relational databases, write custom Postgres triggers & RLS policies",
      "Integrate AI APIs, server actions, and optimistic UI updates",
      "Deploy production bundles on Vercel with CI/CD automation",
    ],
    modules: [
      {
        id: "m1",
        title: "Module 1: Modern TypeScript & React 19",
        duration: "2 Weeks",
        lessons: [
          { id: "l1", title: "TypeScript Generics, Discriminated Unions & Strict Mode", duration: "50 mins", type: "video", completed: true },
          { id: "l2", title: "React 19 Server Components, Actions & useHook", duration: "60 mins", type: "lab", completed: true },
          { id: "l3", title: "State Management & Custom Reusable Hooks", duration: "45 mins", type: "video", completed: true },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Next.js App Router & Routing",
        duration: "2 Weeks",
        lessons: [
          { id: "l4", title: "Dynamic Routes, Layouts, Parallel & Intercepting Routes", duration: "55 mins", type: "video", completed: true },
          { id: "l5", title: "Server Actions, Optimistic Updates & Zod Validation", duration: "65 mins", type: "lab", completed: false },
          { id: "l6", title: "Caching, Revalidation & Static/Dynamic Rendering", duration: "40 mins", type: "reading", completed: false },
        ],
      },
      {
        id: "m3",
        title: "Module 3: Supabase, Postgres & Authentication",
        duration: "2 Weeks",
        lessons: [
          { id: "l7", title: "Postgres Schemas, Foreign Keys & RLS Security", duration: "50 mins", type: "lab", completed: false },
          { id: "l8", title: "Supabase Auth, OAuth Providers & RBAC Roles", duration: "45 mins", type: "video", completed: false },
          { id: "l9", title: "Realtime Subscriptions & Postgres Functions", duration: "50 mins", type: "lab", completed: false },
        ],
      },
      {
        id: "m4",
        title: "Module 4: Full-Stack Production Capstone",
        duration: "2 Weeks",
        lessons: [
          { id: "l10", title: "Building a SaaS Application End-to-End", duration: "4 Hours", type: "lab", completed: false },
          { id: "l11", title: "Automated Testing, Dockerization & Vercel Deployment", duration: "2 Hours", type: "quiz", completed: false },
        ],
      },
    ],
  },
  3: {
    overview: "End-to-end Machine Learning foundations: mathematical theory, feature engineering, scikit-learn models, neural networks, and model deployment.",
    learningOutcomes: [
      "Implement supervised algorithms (Linear/Logistic Regression, Random Forests, XGBoost)",
      "Perform exploratory data analysis and feature engineering with Pandas & Seaborn",
      "Evaluate models with Precision, Recall, ROC-AUC, and Cross-Validation",
      "Deploy machine learning inference endpoints using FastAPI",
    ],
    modules: [
      {
        id: "m1",
        title: "Module 1: Exploratory Data Analysis & Statistics",
        duration: "2 Weeks",
        lessons: [
          { id: "l1", title: "NumPy Vectorization & Pandas DataFrames", duration: "50 mins", type: "video", completed: true },
          { id: "l2", title: "Statistical Distributions, Hypothesis Testing & Outlier Detection", duration: "60 mins", type: "lab", completed: false },
          { id: "l3", title: "Feature Scaling, Imputation & One-Hot Encoding", duration: "45 mins", type: "lab", completed: false },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Supervised Learning Algorithms",
        duration: "2 Weeks",
        lessons: [
          { id: "l4", title: "Linear & Logistic Regression from Scratch", duration: "55 mins", type: "video", completed: false },
          { id: "l5", title: "Decision Trees, Random Forests & Gradient Boosting", duration: "70 mins", type: "lab", completed: false },
          { id: "l6", title: "Support Vector Machines & KNN Classifiers", duration: "40 mins", type: "reading", completed: false },
        ],
      },
      {
        id: "m3",
        title: "Module 3: Deep Learning & NLP Fundamentals",
        duration: "2 Weeks",
        lessons: [
          { id: "l7", title: "Multi-Layer Perceptrons & Backpropagation in PyTorch", duration: "65 mins", type: "lab", completed: false },
          { id: "l8", title: "Text Embeddings, TF-IDF & Sentiment Classification", duration: "55 mins", type: "video", completed: false },
        ],
      },
      {
        id: "m4",
        title: "Module 4: ML Ops & API Deployment",
        duration: "2 Weeks",
        lessons: [
          { id: "l9", title: "Model Serialization with Joblib & ONNX", duration: "45 mins", type: "lab", completed: false },
          { id: "l10", title: "Serving Real-Time Predictions via FastAPI & Docker", duration: "2 Hours", type: "quiz", completed: false },
        ],
      },
    ],
  },
  4: {
    overview: "Comprehensive UI/UX design: user persona research, wireframing, design systems in Figma, interactive micro-animations, and usability audits.",
    learningOutcomes: [
      "Conduct user interviews and synthesize affinity diagrams",
      "Construct wireframes, user flow diagrams, and interactive prototypes",
      "Build multi-brand tokenized Design Systems with auto-layout in Figma",
      "Run quantitative usability tests and create developer handoff specs",
    ],
    modules: [
      {
        id: "m1",
        title: "Module 1: User Research & UX Architecture",
        duration: "2 Weeks",
        lessons: [
          { id: "l1", title: "User Personas, Empathy Maps & Journey Mapping", duration: "45 mins", type: "video", completed: true },
          { id: "l2", title: "Information Architecture & Card Sorting Methods", duration: "50 mins", type: "lab", completed: false },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Figma Prototyping & Design Tokens",
        duration: "2 Weeks",
        lessons: [
          { id: "l3", title: "Auto-Layout, Component Variants & Interactive States", duration: "60 mins", type: "lab", completed: false },
          { id: "l4", title: "Design Tokens: Color Palettes, Typography Scales & Spacing", duration: "50 mins", type: "video", completed: false },
        ],
      },
      {
        id: "m3",
        title: "Module 3: Usability Audits & Developer Handoff",
        duration: "2 Weeks",
        lessons: [
          { id: "l5", title: "Heuristic Evaluation & WCAG Accessibility Standards", duration: "45 mins", type: "reading", completed: false },
          { id: "l6", title: "Dev Mode Specs, Exporting Assets & Documentation", duration: "40 mins", type: "quiz", completed: false },
        ],
      },
    ],
  },
};

export const RESOURCE_CONTENTS: Record<string, ResourceContent> = {
  "SQL practice workbook": {
    id: "res-1",
    title: "SQL Practice Workbook — Analytics & Window Functions",
    type: "code",
    fileSize: "1.4 MB",
    description: "Production SQL queries with sample schemas for cohort analysis, rolling revenue calculations, and customer retention metrics.",
    content: `-- ========================================================
-- EDURA ACADEMY: DATA ANALYTICS SQL WORKBOOK
-- Problem: Calculate 30-Day Student Retention & Cohort Churn
-- ========================================================

WITH student_cohorts AS (
  SELECT
    id AS student_id,
    DATE_TRUNC('month', created_at) AS cohort_month
  FROM profiles
  WHERE role = 'student'
),
student_activity AS (
  SELECT
    t.student_id,
    DATE_TRUNC('month', t.created_at) AS activity_month
  FROM tickets t
  GROUP BY t.student_id, DATE_TRUNC('month', t.created_at)
)
SELECT
  c.cohort_month,
  COUNT(DISTINCT c.student_id) AS total_cohort_students,
  COUNT(DISTINCT a.student_id) AS active_in_month,
  ROUND(
    COUNT(DISTINCT a.student_id)::NUMERIC / 
    COUNT(DISTINCT c.student_id) * 100, 
    2
  ) AS retention_percentage
FROM student_cohorts c
LEFT JOIN student_activity a 
  ON c.student_id = a.student_id
GROUP BY c.cohort_month
ORDER BY c.cohort_month DESC;

-- 2. SLA Breach Forecast Query
SELECT
  category,
  COUNT(*) AS total_tickets,
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)::NUMERIC(10,1) AS avg_resolution_hours,
  SUM(CASE WHEN escalated THEN 1 ELSE 0 END) AS escalated_count
FROM tickets
GROUP BY category
ORDER BY escalated_count DESC;`,
  },
  "Power BI starter files": {
    id: "res-2",
    title: "Power BI Starter Files & DAX Formulas Guide",
    type: "guide",
    fileSize: "2.8 MB",
    description: "Star-schema data model templates, calendar tables, and essential DAX formulas for dynamic KPI calculation.",
    content: `// ========================================================
// EDURA ACADEMY: POWER BI STARTER DAX FORMULAS
// ========================================================

// 1. Total Cleared Tuition Revenue
Total Revenue = 
CALCULATE(
    SUM(Payments[amount]),
    Payments[status] = "paid"
)

// 2. Month-over-Month Growth %
MoM Revenue Growth % = 
VAR CurrentMonth = [Total Revenue]
VAR PreviousMonth = CALCULATE([Total Revenue], DATEADD('Calendar'[Date], -1, MONTH))
RETURN
IF(
    ISBLANK(PreviousMonth) || PreviousMonth = 0,
    BLANK(),
    DIVIDE(CurrentMonth - PreviousMonth, PreviousMonth, 0)
)

// 3. Dynamic Customer Satisfaction (CSAT) Score
CSAT Score % = 
VAR TotalRated = COUNTROWS(FILTER(Tickets, NOT(ISBLANK(Tickets[rating]))))
VAR PositiveRatings = COUNTROWS(FILTER(Tickets, Tickets[rating] >= 4))
RETURN
DIVIDE(PositiveRatings, TotalRated, 0) * 100`,
  },
  "React cheat sheet": {
    id: "res-3",
    title: "React 19 & Next.js App Router Architecture Cheat Sheet",
    type: "cheatsheet",
    fileSize: "980 KB",
    description: "Essential patterns for Server Components, Server Actions, optimistic UI mutations, and Supabase client caching.",
    content: `// ========================================================
// EDURA ACADEMY: REACT 19 & NEXT.JS APP ROUTER CHEAT SHEET
// ========================================================

// 1. Server Component Data Fetching (Zero Client JS)
import { admin } from "@/lib/supabase-server";

export default async function DashboardServer() {
  const db = admin();
  const { data: tickets } = await db.from("tickets").select("*");

  return (
    <div className="space-y-4">
      {tickets?.map((t) => (
        <TicketCard key={t.id} ticket={t} />
      ))}
    </div>
  );
}

// 2. Server Action with Optimistic Updates
"use server";
import { revalidatePath } from "next/cache";

export async function updateTicketStatus(ticketId: string, status: string) {
  const db = admin();
  await db.from("tickets").update({ status }).eq("id", ticketId);
  revalidatePath("/admin/tickets");
  return { success: true };
}`,
  },
  "ML notebooks": {
    id: "res-4",
    title: "Machine Learning Notebooks & Pipeline Template",
    type: "code",
    fileSize: "3.2 MB",
    description: "Jupyter Python notebook pipeline for data preprocessing, cross-validated model tuning, and FastAPI deployment.",
    content: `# ========================================================
# EDURA ACADEMY: MACHINE LEARNING PIPELINE
# Supervised Random Forest Classifier with Scikit-Learn
# ========================================================

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score

# 1. Load and prepare feature dataset
df = pd.read_csv("student_outcomes.csv")
X = df.drop(columns=["dropped_out"])
y = df["dropped_out"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 2. Hyperparameter Grid Search
rf = RandomForestClassifier(random_state=42)
param_grid = {
    "n_estimators": [100, 200],
    "max_depth": [6, 12, None],
    "min_samples_split": [2, 5],
}

clf = GridSearchCV(rf, param_grid, cv=5, scoring="roc_auc", n_jobs=-1)
clf.fit(X_train, y_train)

# 3. Model Evaluation
y_pred = clf.predict(X_test)
y_prob = clf.predict_proba(X_test)[:, 1]

print("Best Parameters:", clf.best_params_)
print("ROC-AUC Score:", roc_auc_score(y_test, y_prob))
print(classification_report(y_test, y_pred))`,
  },
};
