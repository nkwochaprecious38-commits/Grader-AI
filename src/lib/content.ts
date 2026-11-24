export const NAV_LINKS = [
  { href: "/", label: "Home" }, { href: "/platform", label: "Platform" }, { href: "/solutions", label: "Solutions" },
  { href: "/features", label: "Features" }, { href: "/pricing", label: "Pricing" },
];

export const CORE = [
  { icon: "ScanSearch", title: "AI Assisted Grading", text: "Draft marks with a written explanation and rubric mapping. Instructors review, edit, approve or reject every suggestion.", href: "/features#ai-assisted-grading" },
  { icon: "ListChecks", title: "Smart Rubric Management", text: "Build reusable rubrics with point values, partial credit and a visible record of how every mark is calculated.", href: "/features#flexible-grading-rubrics" },
  { icon: "ClipboardList", title: "Assignment Management", text: "Create exams, quizzes, homework and projects with answer keys, deadlines and late submission settings.", href: "/features#assignment-creation" },
  { icon: "FileText", title: "Handwritten Submission Assessment", text: "Upload scanned papers and images, read extracted text beside the original, and flag unclear writing for manual review.", href: "/features#handwritten-answer-recognition" },
  { icon: "Code2", title: "Programming Autograding", text: "Define test cases and point values, then run submissions in an isolated sandbox with strict limits.", href: "/features#programming-assignment-grading" },
  { icon: "MessageSquareText", title: "Instant Student Feedback", text: "Attach rubric comments, inline notes and improvement advice, then publish when you are ready.", href: "/features#inline-feedback" },
  { icon: "Layers", title: "Answer Grouping", text: "Find similar responses, review the suggested groups, and apply a rubric to a whole group with individual exceptions.", href: "/features#answer-grouping" },
  { icon: "BarChart3", title: "Academic Performance Analytics", text: "See question level results, rubric outcomes and class trends to find common learning gaps.", href: "/features#academic-analytics" },
];

export const PROBLEMS = [
  "Educators spend too much time grading.", "Large classes make consistent assessment difficult.", "Feedback is often delayed.", "Manual grading can create inconsistencies.",
  "Student submissions arrive in different formats.", "Educators struggle to identify common learning gaps.", "Assessment records are scattered across multiple tools.", "Reviewing performance across large classes takes time.",
];

export const STEPS = [
  { t: "Create an assignment", d: "Create an assignment and define the grading criteria." },
  { t: "Collect submissions", d: "Collect digital, handwritten, or programming submissions." },
  { t: "Grade with review", d: "Use AI assisted grading and instructor review to assess responses." },
  { t: "Publish and learn", d: "Publish grades, deliver feedback, and analyze student performance." },
];

export const AUDIENCES = [
  { t: "Universities", d: "Large cohorts, shared rubrics across teaching teams, and programming assessment in one workspace." },
  { t: "Schools", d: "Faster marking of tests and homework, with consistent feedback for every student." },
  { t: "Educators", d: "One place for assignments, rubrics, grades and feedback without juggling tools." },
  { t: "Examination bodies", d: "Structured examiner workflows, marking criteria and auditable assessment records." },
  { t: "Tutoring organizations", d: "Quick assessment of exercises and a clear view of each learner's gaps." },
  { t: "Online learning providers", d: "Digital submissions, automated checks and feedback that scales with enrollment." },
];

export const MODULES = [
  { icon: "ClipboardList", t: "Assessment Management", d: "Create and organize examinations, quizzes, homework, programming assignments, and projects." },
  { icon: "ScanSearch", t: "AI Grading Engine", d: "Assist educators with grading student responses using predefined criteria, answer keys, and instructor approved rubrics." },
  { icon: "ListChecks", t: "Rubric Management", d: "Create reusable grading rubrics, define scoring criteria, assign point values, and maintain consistent assessment standards." },
  { icon: "Inbox", t: "Submission Management", d: "Collect, organize, and review handwritten, PDF, image, digital, and programming submissions." },
  { icon: "MessageSquareText", t: "Feedback Management", d: "Provide detailed comments, annotations, corrections, and performance feedback to students." },
  { icon: "BarChart3", t: "Academic Intelligence", d: "Analyze question performance, rubric outcomes, grading trends, and student learning gaps." },
];

export const SOLUTIONS = [
  { id: "universities", t: "Universities and Colleges", d: "Manage large classes, examinations, coursework, grading rubrics, programming assignments, and academic performance.", challenge: "Large cohorts, many markers and mixed assessment formats make consistency hard to maintain.", help: "Shared rubrics, answer grouping and instructor review keep marking consistent across teaching teams, while analytics show where cohorts struggle." },
  { id: "secondary", t: "Secondary Schools", d: "Simplify examination grading, assignment assessment, student feedback, and performance monitoring.", challenge: "Teachers mark many scripts under tight deadlines and feedback arrives after students have moved on.", help: "Automated multiple choice scoring, draft suggestions for written answers and one click publishing return results to students sooner." },
  { id: "primary", t: "Primary Schools", d: "Organize classroom assessments, quizzes, assignments, and student progress records.", challenge: "Records of small assessments are spread across notebooks and spreadsheets.", help: "Simple worksheets and quizzes, a central gradebook and progress views for each learner keep records together." },
  { id: "online", t: "Online Learning Platforms", d: "Manage digital submissions, automated assessment, grading workflows, and feedback at scale.", challenge: "Submissions arrive continuously in different formats and learners expect timely feedback.", help: "Digital intake, automated checks, rubric based review queues and a regrade workflow handle volume without losing oversight." },
  { id: "exam-bodies", t: "Examination Bodies", d: "Organize examination submissions, grading criteria, examiner workflows, and assessment records.", challenge: "Marking must be defensible, consistent and fully recorded.", help: "Examiner roles, approval controls and a complete audit log of grade changes support transparent marking." },
  { id: "tutoring", t: "Tutoring Organizations", d: "Assess student exercises, identify knowledge gaps, provide feedback, and track learning progress.", challenge: "Tutors need to see quickly what each learner has not yet understood.", help: "Question level and rubric level results highlight gaps, and drafted feedback saves preparation time." },
  { id: "corporate", t: "Corporate Training Providers", d: "Evaluate training assignments, quizzes, technical assessments, and employee learning outcomes.", challenge: "Training outcomes are hard to evidence across cohorts and programmes.", help: "Quizzes, technical assignments and exportable reports record learning outcomes for each group." },
  { id: "independent", t: "Independent Educators", d: "Create assignments, grade submissions, organize rubrics, and provide feedback through one workspace.", challenge: "Running assessment alone means managing files, scores and messages in several places.", help: "One workspace covers assignments, rubrics, grading, feedback and records for every student." },
];

export const FEATURES: { id: string; t: string; cat: string; d: string; b: string }[] = [
  ["ai-assisted-grading", "AI Assisted Grading", "Grading", "Suggests marks against answer keys and rubrics, with an explanation and rubric mapping.", "Saves time on first pass marking while the instructor keeps the final decision."],
  ["automated-multiple-choice-grading", "Automated Multiple Choice Grading", "Grading", "Scores selected options against the answer key instantly.", "Removes repetitive marking and returns objective results quickly."],
  ["short-answer-assessment", "Short Answer Assessment", "Grading", "Compares short responses with key points and rubric criteria.", "Applies the same expectations to every response."],
  ["essay-assessment-assistance", "Essay Assessment Assistance", "Grading", "Provides a suggested score and criterion by criterion reasoning for long answers, flagged for careful review.", "Gives markers a structured starting point for subjective work."],
  ["handwritten-answer-recognition", "Handwritten Answer Recognition", "Submissions", "Lets you read extracted text beside the original page. Unclear writing is flagged for manual review, never guessed.", "Keeps handwritten work in the same workflow as digital work."],
  ["pdf-submission-processing", "PDF Submission Processing", "Submissions", "Accepts multi page PDFs and links them to a student and assignment.", "Keeps scanned papers organized and reviewable."],
  ["image-submission-processing", "Image Submission Processing", "Submissions", "Accepts photographs and scans of written work in common image formats.", "Lets students submit from a phone without extra tools."],
  ["assignment-creation", "Assignment Creation", "Assessments", "Define questions, answer keys, rubric, dates, late rules and submission format.", "Sets clear expectations before work begins."],
  ["examination-management", "Examination Management", "Assessments", "Organize formal examinations with release dates, versions and examiner access.", "Keeps high stakes assessment controlled and recorded."],
  ["homework-management", "Homework Management", "Assessments", "Set and track recurring homework across courses.", "Shows who has submitted and what remains to mark."],
  ["quiz-management", "Quiz Management", "Assessments", "Build short quizzes with automatic scoring for objective questions.", "Gives frequent low stakes checks with little marking effort."],
  ["programming-assignment-grading", "Programming Assignment Grading", "Programming", "Create coding assignments in several languages with test cases and point values.", "Evaluates code against the same tests for every student."],
  ["code-autograding", "Code Autograding", "Programming", "Runs submissions in an isolated sandbox service with time, memory and network limits. Code never runs on the application server.", "Delivers repeatable results without risking the platform."],
  ["flexible-grading-rubrics", "Flexible Grading Rubrics", "Rubrics", "Reusable criteria with point values, explanations and positive or negative rules.", "Makes marks transparent and consistent."],
  ["partial-credit-management", "Partial Credit Management", "Rubrics", "Award a portion of the points when part of a criterion is met.", "Reflects real understanding rather than all or nothing outcomes."],
  ["answer-grouping", "Answer Grouping", "Grouping", "Collect similar responses into groups and apply a rubric to the whole group, with exceptions for individuals.", "Reduces repeated effort on near identical answers."],
  ["ai-assisted-answer-grouping", "AI Assisted Answer Grouping", "Grouping", "Detects similar answers and proposes groups for review. Similar wording is never treated as proof of misconduct.", "Surfaces patterns that would take hours to find by hand."],
  ["inline-feedback", "Inline Feedback", "Feedback", "Add comments, strengths, weaknesses and improvement advice at question level.", "Helps students understand exactly where marks were gained or lost."],
  ["digital-annotations", "Digital Annotations", "Feedback", "Mark up submitted work with notes tied to the response.", "Makes feedback specific and easy to act on."],
  ["student-grade-management", "Student Grade Management", "Grades", "A gradebook of scores, percentages, grading status and publication status.", "Keeps all records in one reliable place."],
  ["regrade-requests", "Regrade Requests", "Grades", "Students explain a concern and track the response. Instructors keep a history of changes.", "Resolves questions openly and fairly."],
  ["grade-publishing", "Grade Publishing", "Grades", "Release approved grades and feedback to students when ready.", "Nothing reaches students without instructor approval."],
  ["grade-export", "Grade Export", "Grades", "Export gradebook records as CSV.", "Moves results into other record systems."],
  ["academic-analytics", "Academic Analytics", "Analytics", "Class averages, distributions, trends and assessment completion.", "Shows how a class is performing at a glance."],
  ["question-level-performance", "Question Level Performance", "Analytics", "See the average result for each question.", "Identifies questions that were too hard, unclear or poorly taught."],
  ["rubric-level-analytics", "Rubric Level Analytics", "Analytics", "See how students performed on each rubric criterion.", "Points to the specific skills that need attention."],
  ["instructor-collaboration", "Instructor Collaboration", "Teams", "Roles for administrators, instructors, teaching assistants and examiners with shared rubrics.", "Lets teams mark together with clear responsibilities."],
  ["learning-management-integrations", "Learning Management Integrations", "Teams", "A directory for connecting Canvas, Moodle, Blackboard, Brightspace, Sakai, Google Classroom and Microsoft Teams for Education. Each connection stays inactive until configured and tested.", "Reduces duplicate data entry once connections are set up."],
].map(([id, t, cat, d, b]) => ({ id, t, cat, d, b }));

export const FAQ = [
  ["How do I pay for a plan?", "Each plan button opens its Selar checkout page, where the price and billing details are shown."],
  ["Which plan should I choose?", "Starter suits individual educators and small teams, Professional suits schools and departments, and Enterprise suits universities, examination bodies and large providers."],
  ["Can I change plans later?", "Contact us through the Enterprise option or your Selar order if you need a different plan. Replace this answer with your own policy."],
  ["Does AI grading replace instructors?", "No. AI suggests marks and explanations. An authorized instructor must approve grades before they can be published."],
  ["Is student data kept private?", "Records are separated by organization, and students can only see their own published results. Uploaded files are served only to authorized users."],
  ["Do you offer a trial or refunds?", "Replace this answer with your trial and refund policy. No terms are stated here until you confirm them."],
];

export const PLANS = [
  { id: "starter", name: "Starter Plan", d: "Designed for individual educators, tutors, and small educational teams that need a structured way to manage assessments and grading.", url: "https://selar.com/47plan?currency=USD", cta: "Get Started", price: "Price shown at checkout" },
  { id: "professional", name: "Professional Plan", d: "Designed for schools, academic departments, and growing educational organizations that need advanced grading workflows, rubrics, analytics, and team collaboration.", url: "https://selar.com/57plan?currency=USD", cta: "Choose Professional", price: "Price shown at checkout", featured: true },
  { id: "enterprise", name: "Enterprise Plan", d: "Designed for universities, examination bodies, large educational institutions, and online learning providers that need advanced assessment management and scalable organizational controls.", url: "https://selar.com/97plan?currency=USD", cta: "Contact Sales", price: "Price shown at checkout" },
];
