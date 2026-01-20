# Thrive 🚀

> **An open-source, offline-first learning platform built to democratize education.**  
> Thrive is a multilingual learning platform that provides students with *personalized learning paths* and *curated open-source resources*. It uses a *hint-based AI tutor*, *conversational learning*, and *offline access* to make quality learning simple, accessible, and effective for everyone.

---

[💚 Live Platform](https://thrive-learn.vercel.app)


## 🌍 Why Thrive?

Access to quality education should not depend on bandwidth, geography, or language.

**Thrive** is built to close that gap.

In regions with unreliable internet or limited resources, Thrive enables:
- 📶 **Seamless offline learning**
- 🌐 **Multilingual education**
- 🧠 **Personalized, AI-driven instruction**
- 🏫 **Scalable tools for teachers and institutions**

Whether you're a student learning independently or a school managing hundreds of learners, Thrive adapts to you.

---

## ✨ Core Features

### 🧠 AI Course Planner & Generator

Thrive doesn’t just host content — it **creates structured learning paths**.

- **Custom Curriculum Generation**  
  Input a topic (e.g. *“Advanced Game Theory”*) and receive a fully structured course:
  - Modules
  - Lessons
  - Quizzes  
  Automatically tailored to the learner’s level.

- **AI-Generated Visuals**  
  Each course gets a unique, cinematic 3D cover image generated using **Google Gemini / Imagen**, ensuring a modern and engaging interface.

- **Pre-Assessment Engine**  
  Optional placement tests dynamically adjust course difficulty based on learner knowledge.

---

### 💬 The Unenthusiastic AI

Meet **Unenthusiastic AI**, an AI tutor that refuses to spoon-feed answers.

- 🧩 **Socratic Teaching Style**  
  Guides students through reasoning instead of giving direct solutions.

- 📈 **Topic-Level Mastery Tracking**  
  Progress is measured per concept, not just completion.

- 🧠 **Context-Aware Conversations**  
  Remembers course state, prior questions, and learning goals.

> Learning happens through thinking — Unenthusiastic AI makes sure of it.

---

### 🏫 Teacher & Classroom Management

A powerful dashboard for educators.

- **Role-Based Access Control**  
  Secure flows for Students, Teachers, Admins, and Supervisors.

- **Classroom Creation**  
  Teachers can create classrooms and share unique **Invite Codes**.

- **Student Management**  
  View rosters, remove students, and manage enrollment.

- **Progress Monitoring** *(Coming Soon)*  
  Track quiz performance, lesson completion, and mastery trends.

---

### 📅 Smart Learning Calendar

Learning without overwhelm.

- **Auto-Scheduling**  
  Courses are intelligently distributed across a calendar based on start dates and workload.

- **Daily Learning Notes**  
  Built-in journaling for reflection and goal-setting.

- **Live Sync**  
  Automatically updates based on lesson progress and quizzes.

---

### 📶 Offline-First PWA Architecture

Designed for real-world constraints.

- **True Offline Mode**  
  When connectivity drops, users are seamlessly redirected to their **Downloads** page.

- **Downloadable Resources**  
  Videos, PDFs, and articles are available offline.

- **Local Caching**  
  UI, routes, and critical data are cached to provide a native-app-like experience.

---

### 📚 Open Learning Library

A community-driven knowledge hub.

- 🎥 Videos
- 📄 PDFs
- 📝 Articles & Blogs

**Features**
- Admin-moderated submissions
- Difficulty, language, and media-type filters
- Scalable for institutional use

---

## 🛠️ Technical Architecture

Thrive is built with performance, scalability, and developer experience in mind.

| Layer | Technology | Purpose |
|------|-----------|---------|
| **Framework** | **Next.js (App Router)** | SSR, API routes, RSC |
| **Language** | **TypeScript** | End-to-end type safety |
| **Styling** | **Tailwind CSS** | Custom design system |
| **Database & Auth** | **Supabase (PostgreSQL)** | Auth, DB, Storage |
| **AI (Logic)** | **OpenAI (GPT-4)** | Planner & Tutor |
| **AI (Visuals)** | **Google Gemini / Imagen** | Course artwork |
| **Icons** | **Lucide React** | Consistent UI |

---

## 🚀 Getting Started

### Prerequisites

- Node.js **18+**
- npm / yarn
- Supabase project
- OpenAI & Google Gemini API keys

---

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/thrive.git
cd thrive
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# Role Access
ADMIN_INVITE_CODE=secure_admin_code
TEACHER_INVITE_CODE=secure_teacher_code
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open in your browser**

```
http://localhost:3000
```

---

## 📂 Project Structure

```bash
thrive/
├── app/
│   ├── admin/        # Admin dashboard
│   ├── api/          # Backend routes (AI, Auth, DB)
│   ├── calendar/     # Scheduling & notes
│   ├── chat/         # AI Tutor
│   ├── course/       # Course player & quizzes
│   ├── dashboard/    # Student overview
│   ├── downloads/    # Offline access
│   ├── library/      # Community resources
│   ├── planner/      # AI course generator
│   ├── teacher/      # Classroom tools
│   └── page.tsx      # Landing page
├── components/       # Shared UI components
├── lib/              # Supabase clients & utilities
└── public/           # Static assets & PWA files
```

---

## 🤝 Contributing

We welcome contributions from:

* Developers
* Educators
* Translators
* Accessibility advocates

### How to contribute

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

Licensed under the **MIT License**.
See `LICENSE` for details.

---

<div align="center">

**Built with ❤️ for accessible education**


[GitHub](https://github.com/UmarYaksambi/thrive) •
[Website](https://thrive-learn.vercel.app) •
[Donate](https://https://buymeacoffee.com/UmarYaksambi)

</div>

