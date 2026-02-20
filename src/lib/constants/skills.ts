// Common skills for autocomplete suggestions
export const COMMON_SKILLS = [
  // Programming Languages
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'Go',
  'Rust',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'Scala',
  'R',

  // Frontend
  'React',
  'Next.js',
  'Vue.js',
  'Angular',
  'Svelte',
  'HTML',
  'CSS',
  'Tailwind CSS',
  'SASS',
  'Bootstrap',
  'Material UI',
  'Chakra UI',

  // Backend
  'Node.js',
  'Express.js',
  'Django',
  'Flask',
  'FastAPI',
  'Spring Boot',
  'Ruby on Rails',
  'Laravel',
  'ASP.NET',
  'GraphQL',
  'REST API',

  // Databases
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'SQLite',
  'Oracle',
  'SQL Server',
  'DynamoDB',
  'Cassandra',
  'Elasticsearch',

  // Cloud & DevOps
  'AWS',
  'Google Cloud',
  'Azure',
  'Docker',
  'Kubernetes',
  'Terraform',
  'CI/CD',
  'Jenkins',
  'GitHub Actions',
  'GitLab CI',
  'Linux',
  'Nginx',

  // Data & ML
  'Machine Learning',
  'Deep Learning',
  'TensorFlow',
  'PyTorch',
  'Pandas',
  'NumPy',
  'Data Analysis',
  'Data Visualization',
  'SQL',
  'ETL',
  'Apache Spark',

  // Mobile
  'React Native',
  'Flutter',
  'iOS Development',
  'Android Development',
  'SwiftUI',
  'Jetpack Compose',

  // Tools & Practices
  'Git',
  'Agile',
  'Scrum',
  'Jira',
  'Figma',
  'Testing',
  'TDD',
  'Unit Testing',
  'Integration Testing',
  'Code Review',

  // Soft Skills
  'Communication',
  'Leadership',
  'Problem Solving',
  'Team Collaboration',
  'Project Management',
  'Time Management',
  'Critical Thinking',
  'Mentoring',
] as const

export type Skill = (typeof COMMON_SKILLS)[number]

/**
 * Filter skills based on search query
 */
export function filterSkills(query: string, excludeSkills: string[] = []): string[] {
  const lowerQuery = query.toLowerCase()
  return COMMON_SKILLS.filter(
    (skill) =>
      skill.toLowerCase().includes(lowerQuery) &&
      !excludeSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
  )
}
