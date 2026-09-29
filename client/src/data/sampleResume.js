// Hardcoded resume data, long enough to overflow a single A4 page so
// pagination behavior (Paged.js on screen, native Chromium print on export)
// is actually visible.
export const sampleResume = {
  title: 'John Anderson',
  subTitle: 'Senior Software Engineer',
  overview:
    'Senior software engineer with 8+ years building scalable web ' +
    'applications and leading cross-functional teams. Passionate about ' +
    'clean architecture, developer experience, and shipping products that ' +
    'customers love.',
  information: [
    { id: 'i1', label: 'email', value: 'john.anderson@email.com' },
    { id: 'i2', label: 'phone', value: '+1 (555) 012-3456' },
    { id: 'i3', label: 'location', value: 'San Francisco, CA' },
    { id: 'i4', label: 'linkedin', value: 'linkedin.com/in/johnanderson' },
    { id: 'i5', label: 'website', value: 'johnanderson.dev' },
  ],
  skills: [
    { id: 's1', label: 'TypeScript', value: 'Expert' },
    { id: 's2', label: 'React / Next.js', value: 'Expert' },
    { id: 's3', label: 'Node.js', value: 'Advanced' },
    { id: 's4', label: 'PostgreSQL', value: 'Advanced' },
    { id: 's5', label: 'System Design', value: 'Advanced' },
    { id: 's6', label: 'AWS', value: 'Intermediate' },
    { id: 's7', label: 'Kubernetes', value: 'Intermediate' },
    { id: 's8', label: 'GraphQL', value: 'Advanced' },
    { id: 's9', label: 'Redis', value: 'Intermediate' },
    { id: 's10', label: 'CI/CD', value: 'Advanced' },
    { id: 's11', label: 'Terraform', value: 'Intermediate' },
    { id: 's12', label: 'Team Leadership', value: 'Advanced' },
  ],
  workExperiences: [
    {
      id: 'w1',
      company: 'Meta',
      position: 'Senior Software Engineer',
      startDate: 'Jan 2022',
      endDate: null,
      description:
        'Led the redesign of the internal design-system library used by ' +
        '40+ product teams, cutting UI implementation time by 30%.\n' +
        'Mentored 4 junior engineers and ran the frontend architecture ' +
        'review for two major product launches.\n' +
        'Drove adoption of automated visual regression testing, reducing ' +
        'production UI bugs by 45%.\n' +
        'Introduced a component-level performance budget enforced in CI, ' +
        'cutting median bundle size by 22% across product surfaces.\n' +
        'Represented the frontend platform team in quarterly roadmap ' +
        'planning with design, product, and infra stakeholders.',
    },
    {
      id: 'w2',
      company: 'Stripe',
      position: 'Software Engineer',
      startDate: 'Jun 2018',
      endDate: 'Dec 2021',
      description:
        'Built and scaled payment-dashboard features serving 500k+ ' +
        'monthly active merchants.\n' +
        'Improved p95 API latency by 60% through query optimization and ' +
        'targeted caching.\n' +
        'Partnered with design and product to ship a self-serve onboarding ' +
        'flow that increased activation rate by 18%.\n' +
        'Built an internal feature-flagging service adopted by 8 other ' +
        'engineering teams within 6 months of launch.\n' +
        'On-call rotation lead for the payments-dashboard service, ' +
        'driving incident postmortems and runbook improvements.',
    },
    {
      id: 'w3',
      company: 'Airbnb',
      position: 'Software Engineer',
      startDate: 'Jul 2016',
      endDate: 'May 2018',
      description:
        'Shipped the host-side pricing suggestions feature, adopted by ' +
        '200k+ hosts within the first quarter.\n' +
        'Rebuilt the search-results rendering pipeline, reducing time-to-' +
        'interactive on mobile web by 35%.\n' +
        'Collaborated with data science to instrument and A/B test ranking ' +
        'changes across the search funnel.',
    },
    {
      id: 'w4',
      company: 'Dropbox',
      position: 'Software Engineer Intern',
      startDate: 'Jun 2015',
      endDate: 'Sep 2015',
      description:
        'Built an internal tool for visualizing sync-engine conflict ' +
        'resolution, used daily by the desktop client team.\n' +
        'Wrote integration tests that caught 3 regressions before they ' +
        'reached production during the internship.',
    },
    {
      id: 'w5',
      company: 'UC Berkeley CS Department',
      position: 'Undergraduate Teaching Assistant',
      startDate: 'Aug 2014',
      endDate: 'May 2016',
      description:
        'Taught weekly discussion sections for the Data Structures course ' +
        'to 150+ students across two semesters.\n' +
        'Held office hours and graded assignments, maintaining a sub-24h ' +
        'turnaround on regrade requests.',
    },
  ],
  educations: [
    {
      id: 'e1',
      school: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      major: 'Computer Science',
      startDate: '2014',
      endDate: '2018',
    },
    {
      id: 'e2',
      school: 'Stanford University',
      degree: 'Master of Science',
      major: 'Computer Science (part-time, employer-sponsored)',
      startDate: '2019',
      endDate: '2021',
    },
    {
      id: 'e3',
      school: 'Coursera / DeepLearning.AI',
      degree: 'Specialization',
      major: 'Machine Learning',
      startDate: '2022',
      endDate: '2022',
    },
  ],
  projects: [
    {
      id: 'p1',
      title: 'CVCraft',
      subTitle: 'AI-powered resume builder',
      technologies: 'Next.js, NestJS, PostgreSQL, Gemini',
      responsibilities:
        'Designed the WYSIWYG resume editor and PDF export pipeline, ' +
        'including real-time preview and ATS-friendly templates.',
    },
    {
      id: 'p2',
      title: 'DevMetrics',
      subTitle: 'Engineering analytics dashboard',
      technologies: 'React, GraphQL, ClickHouse',
      responsibilities:
        'Built a self-hosted dashboard for tracking deploy frequency, ' +
        'lead time, and incident recovery across 12 engineering teams.',
    },
    {
      id: 'p3',
      title: 'OpenShelf',
      subTitle: 'Community book-lending platform',
      technologies: 'React Native, Firebase, Node.js',
      responsibilities:
        'Weekend side project connecting neighbors to lend and borrow ' +
        'books; grew to 3,000+ users across 4 cities with no paid ' +
        'marketing.',
    },
    {
      id: 'p4',
      title: 'Terraform AWS Landing Zone',
      subTitle: 'Open-source infra module',
      technologies: 'Terraform, AWS Organizations, GitHub Actions',
      responsibilities:
        'Published a reusable multi-account AWS landing-zone module with ' +
        '400+ GitHub stars, including CI-driven plan/apply workflows.',
    },
  ],
  certifications: [
    {
      id: 'c1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
    {
      id: 'c2',
      name: 'Certified Kubernetes Administrator',
      issuer: 'CNCF',
      date: '2022',
    },
    {
      id: 'c3',
      name: 'Professional Scrum Master I',
      issuer: 'Scrum.org',
      date: '2021',
    },
    {
      id: 'c4',
      name: 'HashiCorp Certified: Terraform Associate',
      issuer: 'HashiCorp',
      date: '2023',
    },
  ],
  languages: [
    { id: 'l1', name: 'English', description: 'Native' },
    { id: 'l2', name: 'Spanish', description: 'Professional working' },
    { id: 'l3', name: 'Vietnamese', description: 'Limited working' },
    { id: 'l4', name: 'Japanese', description: 'Elementary' },
  ],
};
