/**
 * Skill Extractor & Categorization Service
 * Curates hundreds of technical & non-technical skills across 6 primary categories
 * with dynamic strength rating (Strong | Moderate | Weak) and missing domain skill recommendations.
 */

export interface SkillCategoryRating {
  name: string;
  skills: string[];
  strength: 'Strong' | 'Moderate' | 'Weak';
}

export interface ExtractedSkillsPayload {
  programmingLanguages: string[];
  frameworks: string[];
  tools: string[];
  databases: string[];
  softSkills: string[];
  certifications: string[];
  totalCount: number;
  skillCategories: SkillCategoryRating[];
  missingDomainSkills: string[];
}

// 1. Programming Languages
export const PROGRAMMING_LANGUAGES = [
  'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'C',
  'Ruby', 'Go', 'Golang', 'Rust', 'Swift', 'Kotlin', 'Scala', 'PHP',
  'Perl', 'R', 'MATLAB', 'Julia', 'Dart', 'Lua', 'Haskell', 'Elixir',
  'Clojure', 'F#', 'Objective-C', 'Groovy', 'VB.NET', 'Visual Basic',
  'Assembly', 'Cobol', 'Fortran', 'Pascal', 'Shell', 'Bash', 'PowerShell',
  'SQL', 'PL/SQL', 'T-SQL', 'HTML', 'CSS', 'Sass', 'SCSS', 'Less'
];

// 2. Frameworks & Libraries
export const FRAMEWORKS = [
  // Frontend
  'React', 'React.js', 'Angular', 'AngularJS', 'Vue', 'Vue.js', 'Svelte', 'Next.js',
  'Nuxt.js', 'Gatsby', 'Ember', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Material-UI',
  'MUI', 'Chakra UI', 'Ant Design', 'Styled-Components',
  // Backend
  'Node.js', 'Express', 'Express.js', 'FastAPI', 'Django', 'Flask', 'Spring', 'Spring Boot',
  '.NET', 'ASP.NET', 'Ruby on Rails', 'Laravel', 'Symfony', 'Fastify', 'NestJS', 'Fiber',
  // Mobile
  'React Native', 'Flutter', 'Ionic', 'Xamarin', 'SwiftUI', 'Jetpack Compose',
  // Data / AI / ML
  'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'SciPy',
  'Matplotlib', 'Seaborn', 'Plotly', 'OpenCV', 'NLTK', 'spaCy', 'Hugging Face',
  'Transformers', 'XGBoost', 'LightGBM', 'LangChain',
  // Testing
  'Jest', 'Mocha', 'Jasmine', 'PyTest', 'JUnit', 'Selenium', 'Cypress', 'Playwright', 'Puppeteer', 'TestNG'
];

// 3. Tools & Platforms
export const TOOLS = [
  // Cloud & DevOps
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Google Cloud', 'Heroku', 'Vercel',
  'Netlify', 'DigitalOcean', 'Terraform', 'Ansible', 'Jenkins', 'CircleCI', 'GitHub Actions',
  'GitLab CI', 'Prometheus', 'Grafana', 'Datadog', 'Splunk', 'ELK', 'Elasticsearch',
  // Version Control & IDEs
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'VS Code', 'Visual Studio', 'IntelliJ', 'PyCharm', 'Eclipse',
  'Sublime Text', 'Vim', 'Neovim', 'WebStorm', 'Android Studio', 'Xcode',
  // Project & Collaboration
  'Jira', 'Confluence', 'Trello', 'Asana', 'Notion', 'Monday.com', 'Slack', 'Teams',
  // API & Architecture
  'Postman', 'Insomnia', 'Swagger', 'GraphQL', 'REST APIs', 'gRPC', 'Kafka', 'RabbitMQ', 'Redis',
  'Nginx', 'Apache', 'Webpack', 'Vite',
  // Data, BI & Specialized
  'Spark', 'Hadoop', 'Airflow', 'Databricks', 'Snowflake', 'dbt', 'Tableau', 'Power BI',
  'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Canva',
  'SolidWorks', 'AutoCAD', 'ANSYS', 'Altium', 'Salesforce', 'Workday', 'HubSpot'
];

// 4. Databases & Storage
export const DATABASES = [
  'PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Oracle', 'SQL Server', 'MariaDB',
  'Cassandra', 'DynamoDB', 'Firebase', 'Firestore', 'CouchDB', 'Neo4j', 'Redis',
  'Supabase', 'PlanetScale', 'CockroachDB', 'Prisma', 'Mongoose', 'Sequelize', 'TypeORM', 'SQLAlchemy'
];

// 5. Core Fundamentals & Soft Skills
export const CORE_FUNDAMENTALS = [
  'Data Structures', 'Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks',
  'OOP', 'Object-Oriented Programming', 'System Design', 'Design Patterns', 'Distributed Systems'
];

export const SOFT_SKILLS = [
  'Leadership', 'Communication', 'Teamwork', 'Collaboration', 'Problem Solving',
  'Critical Thinking', 'Adaptability', 'Time Management', 'Project Management',
  'Agile', 'Scrum', 'Public Speaking', 'Mentoring', 'Decision Making',
  'Attention to Detail', 'Stakeholder Management', 'Cross-functional Collaboration'
];

// 6. Professional Certifications
export const CERTIFICATIONS = [
  'AWS Certified', 'AWS Cloud Practitioner', 'AWS Solutions Architect',
  'Azure Certified', 'GCP Certified', 'Google Cloud Certified', 'CKA', 'CKAD',
  'CISSP', 'CEH', 'CompTIA Security+', 'CCNA', 'CCNP',
  'PMP', 'Scrum Master', 'CSM', 'Safe Agile', 'CFA', 'CPA', 'NPTEL'
];

/**
 * Domain-specific in-demand skill recommendations (25+ domains)
 */
export const DOMAIN_RECOMMENDED_SKILLS: Record<string, string[]> = {
  'Software / IT': ['Python', 'TypeScript', 'React', 'Node.js', 'Docker', 'AWS', 'Git', 'PostgreSQL', 'REST APIs'],
  'Data Science / AI': ['Python', 'SQL', 'TensorFlow', 'PyTorch', 'Pandas', 'Machine Learning', 'Statistics', 'Tableau', 'Data Pipeline'],
  'Cybersecurity': ['Splunk', 'SIEM', 'Penetration Testing', 'Firewalls', 'Security Frameworks', 'CISSP', 'Kali Linux', 'Vulnerability Assessment'],
  'Marketing': ['Google Analytics', 'SEO', 'Content Strategy', 'Social Media Marketing', 'HubSpot', 'Google Ads', 'Email Marketing'],
  'Finance / Banking': ['Excel', 'Financial Modeling', 'SQL', 'Bloomberg', 'Risk Analysis', 'Python', 'VBA', 'Valuation'],
  'Sales': ['CRM', 'Salesforce', 'Pipeline Management', 'Negotiation', 'Lead Generation', 'Cold Calling', 'Account Management'],
  'Human Resources': ['HRIS', 'ATS', 'Talent Acquisition', 'Employee Relations', 'Compliance', 'Workday', 'LinkedIn Recruiter'],
  'Operations / Supply Chain': ['SAP', 'Lean Six Sigma', 'Inventory Management', 'Procurement', 'ERP', 'Excel Modeling', 'Supply Chain Logistics'],
  'Consulting': ['PowerPoint', 'Excel', 'Financial Modeling', 'Stakeholder Management', 'Corporate Strategy', 'Problem Solving'],
  'Project Management': ['Jira', 'PMP', 'Agile Methodologies', 'Scrum', 'MS Project', 'Risk Management', 'Stakeholder Communication'],
  'Healthcare / Medical': ['Epic', 'Cerner', 'HIPAA', 'Medical Terminology', 'EMR/EHR', 'Patient Care Protocols', 'Clinical Documentation'],
  'Pharmaceutical / Biotech': ['SAS', 'R', 'Clinical Trials', 'GMP', 'Regulatory Affairs', 'FDA Compliance', 'Quality Assurance'],
  'Design / UX': ['Figma', 'Adobe Creative Suite', 'UI/UX Prototyping', 'Design Systems', 'User Research', 'Wireframing', 'Responsive Design'],
  'Content / Media': ['WordPress', 'SEO Copywriting', 'Adobe Premiere', 'Content Strategy', 'Social Media Storytelling', 'Editorial Management'],
  'Mechanical Engineering': ['SolidWorks', 'AutoCAD', 'CATIA', 'ANSYS', 'GD&T', 'FEA Analysis', 'Manufacturing Tolerancing'],
  'Electrical / Electronics': ['Altium', 'MATLAB', 'Embedded C', 'PCB Design', 'FPGA', 'Verilog', 'Circuit Analysis'],
  'Civil / Construction': ['AutoCAD', 'Revit', 'Civil 3D', 'Primavera', 'Structural Analysis', 'Project Site Supervision'],
  'Legal': ['Westlaw', 'LexisNexis', 'Contract Management', 'Legal Research', 'Regulatory Compliance', 'Legal Drafting'],
  'Education / Academia': ['Curriculum Development', 'LMS', 'Assessment Design', 'Classroom Facilitation', 'Pedagogy'],
  'Hospitality / Tourism': ['Opera PMS', 'Guest Relations', 'Event Planning', 'Reservation Systems', 'Revenue Optimization'],
  'Retail / E-commerce': ['Shopify', 'Inventory Merchandising', 'POS Systems', 'Google Analytics', 'Omnichannel Fulfillment'],
  'Government / Public Sector': ['Policy Analysis', 'Grant Writing', 'Public Speaking', 'Regulatory Compliance', 'Civil Service Guidelines'],
  'Non-Profit / NGO': ['Grant Writing', 'Donor Management', 'Fundraising Campaigns', 'Volunteer Coordination', 'Salesforce Nonprofit'],
  'Real Estate': ['MLS', 'Property Management', 'CoStar', 'Financial Analysis', 'Contract Negotiation', 'Real Estate Appraisal'],
  'Student / Fresher': ['Data Structures', 'Git & GitHub', 'Python or Java', 'SQL Database', 'REST APIs', 'Problem Solving', 'Teamwork']
};

/**
 * Extract skills from resume text across all categories
 */
export function extractSkills(text: string, domain = 'Software / IT'): ExtractedSkillsPayload {
  const textLower = text.toLowerCase();

  const matchSet = (pool: string[]) => {
    const found: string[] = [];
    for (const item of pool) {
      const regex = new RegExp(`\\b${escapeRegExp(item.toLowerCase())}\\b`, 'i');
      if (regex.test(textLower)) {
        found.push(item);
      }
    }
    return Array.from(new Set(found));
  };

  const programmingLanguages = matchSet(PROGRAMMING_LANGUAGES);
  const frameworks = matchSet(FRAMEWORKS);
  const tools = matchSet(TOOLS);
  const databases = matchSet(DATABASES);
  const softSkills = matchSet(SOFT_SKILLS);
  const certifications = matchSet(CERTIFICATIONS);
  const fundamentals = matchSet(CORE_FUNDAMENTALS);

  const totalCount =
    programmingLanguages.length +
    frameworks.length +
    tools.length +
    databases.length +
    softSkills.length +
    certifications.length;

  // Compute Skill Category Strength Ratings
  const skillCategories: SkillCategoryRating[] = [];

  if (programmingLanguages.length > 0) {
    skillCategories.push({
      name: 'Programming Languages',
      skills: programmingLanguages,
      strength: programmingLanguages.length >= 4 ? 'Strong' : programmingLanguages.length >= 2 ? 'Moderate' : 'Weak',
    });
  }

  if (frameworks.length > 0) {
    skillCategories.push({
      name: 'Frameworks & Libraries',
      skills: frameworks,
      strength: frameworks.length >= 4 ? 'Strong' : frameworks.length >= 2 ? 'Moderate' : 'Weak',
    });
  }

  if (tools.length > 0) {
    skillCategories.push({
      name: 'Tools & Platforms',
      skills: tools,
      strength: tools.length >= 5 ? 'Strong' : tools.length >= 3 ? 'Moderate' : 'Weak',
    });
  }

  if (databases.length > 0) {
    skillCategories.push({
      name: 'Databases & Storage',
      skills: databases,
      strength: databases.length >= 2 ? 'Strong' : 'Moderate',
    });
  }

  if (fundamentals.length > 0) {
    skillCategories.push({
      name: 'Core CS Fundamentals',
      skills: fundamentals,
      strength: fundamentals.length >= 3 ? 'Strong' : 'Moderate',
    });
  }

  if (softSkills.length > 0) {
    skillCategories.push({
      name: 'Professional & Soft Skills',
      skills: softSkills,
      strength: softSkills.length >= 4 ? 'Strong' : softSkills.length >= 2 ? 'Moderate' : 'Weak',
    });
  }

  // Find missing high-demand skills for the candidate's detected domain
  const domainTargets = DOMAIN_RECOMMENDED_SKILLS[domain] || DOMAIN_RECOMMENDED_SKILLS['Software / IT'];
  const allFoundLower = new Set(
    [
      ...programmingLanguages,
      ...frameworks,
      ...tools,
      ...databases,
      ...softSkills,
      ...fundamentals,
    ].map((s) => s.toLowerCase())
  );

  const missingDomainSkills = domainTargets.filter((skill) => !allFoundLower.has(skill.toLowerCase())).slice(0, 6);

  return {
    programmingLanguages,
    frameworks,
    tools,
    databases,
    softSkills,
    certifications,
    totalCount,
    skillCategories,
    missingDomainSkills,
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
