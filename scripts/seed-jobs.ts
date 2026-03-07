import { PrismaClient, EmploymentType, WorkplaceType } from '@prisma/client'

const prisma = new PrismaClient()

function generateSlug(title: string, company: string): string {
    return `${title}-${company}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

function daysFromNow(days: number): Date {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date
}

const DEPARTMENTS = [
    { name: 'Technology', slug: 'technology' },
    { name: 'Engineering', slug: 'engineering' },
    { name: 'Finance', slug: 'finance' },
    { name: 'Operations', slug: 'operations' },
    { name: 'Marketing', slug: 'marketing' },
    { name: 'Human Resources', slug: 'human-resources' },
    { name: 'Legal', slug: 'legal' },
    { name: 'Risk & Compliance', slug: 'risk-compliance' },
    { name: 'Customer Experience', slug: 'customer-experience' },
    { name: 'Data & Analytics', slug: 'data-analytics' },
]

interface JobData {
    title: string
    company: string
    location: string
    description: string
    requirements: string
    benefits: string
    salaryMin?: number
    salaryMax?: number
    salaryCurrency: string
    employmentType: EmploymentType
    workplaceType: WorkplaceType
    department: string
    expiresInDays: number
}

const JOBS: JobData[] = [
    // Equity Bank Kenya Jobs
    {
        title: 'Senior Backend Developer (.Net)',
        company: 'Equity Bank Kenya',
        location: 'Nairobi, Kenya',
        description: `Design, develop, and maintain backend systems, APIs, and integrations while ensuring performance and security for Equity Bank's digital banking platforms.

Key Responsibilities:
- Design and implement scalable backend services using .NET Core and C#
- Develop and maintain RESTful APIs and microservices architecture
- Ensure code quality through unit testing, code reviews, and best practices
- Collaborate with frontend teams to integrate user-facing elements
- Optimize application performance and ensure high availability
- Implement security best practices and data protection measures
- Participate in agile development processes and sprint planning`,
        requirements: `Required Qualifications:
- Bachelor's degree in Computer Science, Software Engineering, or related field
- 5+ years of experience in backend development with .NET ecosystem
- Strong proficiency in C#, .NET Core, ASP.NET Web API
- Experience with SQL Server, Entity Framework, and database optimization
- Knowledge of microservices architecture and containerization (Docker, Kubernetes)
- Familiarity with CI/CD pipelines and DevOps practices
- Experience with message queues (RabbitMQ, Azure Service Bus)
- Understanding of banking/fintech domain is a plus

Soft Skills:
- Strong problem-solving and analytical abilities
- Excellent communication and teamwork skills
- Ability to work under pressure and meet deadlines`,
        benefits: `- Competitive salary package
- Medical insurance cover for staff and dependents
- Pension scheme contributions
- Annual leave and sick leave
- Professional development opportunities
- Staff banking facilities at preferential rates`,
        salaryMin: 250000,
        salaryMax: 450000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Technology',
        expiresInDays: 45,
    },
    {
        title: 'Angular Developer',
        company: 'Equity Bank Kenya',
        location: 'Nairobi, Kenya',
        description: `Senior role leading end-to-end development of sophisticated web applications using Angular framework for Equity Bank's digital transformation initiatives.

Key Responsibilities:
- Develop and maintain responsive front-end applications using Angular
- Implement complex UI components and ensure cross-browser compatibility
- Integrate with RESTful APIs and backend services
- Write clean, maintainable, and well-documented code
- Collaborate with UX designers to implement pixel-perfect designs
- Optimize applications for maximum speed and scalability
- Mentor junior developers and conduct code reviews
- Participate in technical architecture discussions`,
        requirements: `Required Qualifications:
- Bachelor's degree in Computer Science or equivalent
- 4+ years of experience in frontend development with Angular (v12+)
- Strong proficiency in TypeScript, JavaScript ES6+, HTML5, CSS3/SCSS
- Experience with state management (NgRx, RxJS)
- Knowledge of RESTful API integration and HTTP protocols
- Familiarity with testing frameworks (Jasmine, Karma, Jest)
- Experience with CI/CD pipelines and version control (Git)
- Understanding of responsive design and mobile-first principles

Preferred:
- Experience with Angular Material or PrimeNG
- Knowledge of accessibility standards (WCAG)
- Banking/fintech application development experience`,
        benefits: `- Competitive salary package
- Medical insurance cover
- Pension scheme
- Annual performance bonus
- Learning and development budget
- Flexible working arrangements`,
        salaryMin: 200000,
        salaryMax: 380000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Technology',
        expiresInDays: 30,
    },
    {
        title: 'Lead Data Engineer',
        company: 'Equity Bank Kenya',
        location: 'Nairobi, Kenya',
        description: `Design automated pipelines to extract, clean, and transform data for analytics, ML and AI initiatives across Equity Group's operations in multiple African countries.

Key Responsibilities:
- Design and implement scalable data pipelines and ETL/ELT processes
- Build and maintain data warehouse and data lake architectures
- Develop data models optimized for analytics and reporting
- Ensure data quality, governance, and compliance standards
- Collaborate with data scientists and analysts on ML/AI projects
- Implement real-time data streaming solutions
- Optimize query performance and reduce processing costs
- Lead and mentor a team of data engineers`,
        requirements: `Required Qualifications:
- Bachelor's or Master's degree in Computer Science, Data Engineering, or related field
- 5+ years of experience in data engineering roles
- Expert-level SQL and Python programming skills
- Experience with big data technologies (Spark, Hadoop, Kafka)
- Proficiency with cloud data platforms (Azure Data Factory, AWS Glue, GCP Dataflow)
- Knowledge of data warehousing concepts and dimensional modeling
- Experience with orchestration tools (Airflow, Prefect)
- Understanding of data governance and compliance requirements

Preferred:
- Experience in banking/financial services data environments
- Knowledge of machine learning pipelines and MLOps
- Certifications in cloud platforms (Azure, AWS, GCP)`,
        benefits: `- Attractive salary and benefits package
- Medical and life insurance
- Retirement benefits
- Performance bonus
- Professional certifications sponsorship
- Career growth opportunities across Africa`,
        salaryMin: 300000,
        salaryMax: 550000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Data & Analytics',
        expiresInDays: 30,
    },
    {
        title: 'Mid-Level Java Developer',
        company: 'Equity Bank Kenya',
        location: 'Nairobi, Kenya',
        description: `Develop backend systems for digital credit offerings including microloans and payment services, contributing to financial inclusion across Africa.

Key Responsibilities:
- Design and develop Java-based backend applications
- Build microservices using Spring Boot framework
- Implement REST APIs for mobile and web applications
- Write unit tests and integration tests
- Participate in code reviews and technical discussions
- Debug and resolve production issues
- Document technical specifications and APIs
- Collaborate with cross-functional teams`,
        requirements: `Required Qualifications:
- Bachelor's degree or Diploma in Computer Science or IT
- 4-6 years of experience in Java development
- Strong proficiency in Java 11+, Spring Boot, Spring Security
- Experience with microservices architecture and RESTful APIs
- Knowledge of SQL and NoSQL databases (PostgreSQL, MongoDB, Redis)
- Familiarity with containerization (Docker) and CI/CD pipelines
- Understanding of version control (Git) and agile methodologies
- Experience with message brokers (Kafka, RabbitMQ)

Preferred:
- Knowledge of financial systems and payment processing
- Experience with mobile money integrations
- AWS or Azure cloud experience`,
        benefits: `- Competitive remuneration
- Comprehensive medical cover
- Pension benefits
- Annual leave
- Training and development programs
- Opportunity to impact millions of lives`,
        salaryMin: 180000,
        salaryMax: 320000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'ONSITE',
        department: 'Technology',
        expiresInDays: 30,
    },
    {
        title: 'Senior Manager, Security Operations Centre (SOC)',
        company: 'Equity Bank Kenya',
        location: 'Nairobi, Kenya',
        description: `Manage in-house and outsourced SOC teams, overseeing 24x7x365 continuous investigation of correlated security event feeds to protect Equity Group's digital assets.

Key Responsibilities:
- Lead and manage the Security Operations Centre team
- Oversee continuous security monitoring and incident response
- Develop and implement security policies and procedures
- Coordinate with external security partners and vendors
- Conduct threat intelligence analysis and risk assessments
- Manage security tools (SIEM, EDR, IDS/IPS)
- Report on security posture to executive leadership
- Drive security awareness programs across the organization`,
        requirements: `Required Qualifications:
- Bachelor's degree in IT, Information Security, or Engineering
- 5-7 years of experience in cybersecurity roles
- Industry certifications required: GCIH, GCED, CISSP, CISA, or CISM
- Expert knowledge of SIEM tools (Splunk, QRadar, Sentinel)
- Experience in incident response and digital forensics
- Strong understanding of network security and threat landscapes
- Team leadership and management experience
- Knowledge of regulatory compliance (PCI-DSS, ISO 27001)

Preferred:
- Banking/financial services security experience
- Experience with cloud security (Azure, AWS)
- Malware analysis capabilities`,
        benefits: `- Executive compensation package
- Comprehensive insurance coverage
- Retirement benefits
- Annual performance bonus
- Executive health checkups
- International training opportunities`,
        salaryMin: 450000,
        salaryMax: 750000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'ONSITE',
        department: 'Technology',
        expiresInDays: 30,
    },
    {
        title: 'Sr. Product Manager (Fraud, Risk & AML)',
        company: 'Equity Bank Kenya',
        location: 'Nairobi, Kenya',
        description: `Lead digital products for fraud detection and compliance, leveraging platforms such as NetGuardians, ServiceNow GRC to protect customers and the bank.

Key Responsibilities:
- Define product vision and roadmap for fraud and AML solutions
- Lead cross-functional teams to deliver product initiatives
- Analyze fraud patterns and develop detection strategies
- Collaborate with compliance teams on regulatory requirements
- Manage vendor relationships for fraud prevention tools
- Drive product adoption and measure success metrics
- Present to stakeholders and executive leadership
- Stay current with industry trends and emerging threats`,
        requirements: `Required Qualifications:
- Bachelor's or Master's degree in Computer Science, Business, or related field
- 8+ years of experience, with 6+ years in Product Management
- Deep knowledge of fraud detection and AML systems
- Experience with platforms like NetGuardians, ServiceNow GRC
- Understanding of banking regulations and compliance frameworks
- Strong analytical and data-driven decision making skills
- Excellent stakeholder management abilities
- Product management certifications (CSPO, PSPO) preferred

Preferred:
- Experience in digital banking or fintech
- Knowledge of machine learning for fraud detection
- Pan-African market experience`,
        benefits: `- Senior management compensation
- Executive medical cover
- Pension and gratuity
- Performance-based bonus
- Stock options
- International exposure opportunities`,
        salaryMin: 500000,
        salaryMax: 850000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Risk & Compliance',
        expiresInDays: 30,
    },
    {
        title: 'CX Analytics Officer',
        company: 'Equity Bank Kenya',
        location: 'Nairobi, Kenya',
        description: `Analyze customer experience data, generate insights, and maintain dashboards supporting evidence-based CX improvements across Equity Group.

Key Responsibilities:
- Collect and analyze customer feedback data from multiple channels
- Build and maintain CX dashboards and reports
- Identify trends, patterns, and areas for improvement
- Present insights to stakeholders with actionable recommendations
- Support Voice of Customer (VOC) programs
- Collaborate with business units to implement CX improvements
- Track and report on CX metrics and KPIs
- Conduct customer journey mapping and analysis`,
        requirements: `Required Qualifications:
- Bachelor's degree in Statistics, Economics, Business, or IT
- 3+ years of experience in analytics or CX roles
- Strong proficiency in data analysis tools (Excel, SQL, Python/R)
- Experience with BI tools (Power BI, Tableau)
- Knowledge of CX metrics (NPS, CSAT, CES)
- Excellent data visualization and storytelling skills
- Strong communication and presentation abilities
- Understanding of statistical analysis methods

Preferred:
- Experience with CX platforms (Medallia, Qualtrics)
- Banking or financial services experience
- Knowledge of customer segmentation techniques`,
        benefits: `- Competitive salary
- Medical insurance
- Pension scheme
- Annual bonus
- Learning opportunities
- Career progression paths`,
        salaryMin: 120000,
        salaryMax: 200000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Customer Experience',
        expiresInDays: 30,
    },
    {
        title: 'NOC Shift Engineer',
        company: 'Equity Bank Kenya',
        location: 'Nairobi, Kenya',
        description: `Monitor network infrastructure, manage incidents, ensure system uptime, and provide timely technical support for Equity Bank's critical systems.

Key Responsibilities:
- Monitor network and system infrastructure 24/7
- Respond to and resolve incidents within SLA
- Escalate complex issues to appropriate teams
- Perform routine maintenance and health checks
- Document incidents and resolutions
- Participate in change management processes
- Generate operational reports and metrics
- Maintain operational runbooks and procedures`,
        requirements: `Required Qualifications:
- Diploma or Bachelor's degree in IT, Computer Science, or related field
- 2-4 years of experience in NOC or IT operations
- Knowledge of network protocols (TCP/IP, DNS, DHCP)
- Experience with monitoring tools (Nagios, Zabbix, SolarWinds)
- Understanding of ITIL processes and best practices
- Ability to work in shifts including nights and weekends
- Strong troubleshooting and analytical skills
- Good communication and documentation abilities

Preferred:
- CCNA or equivalent networking certification
- Experience in banking/financial services environment
- Knowledge of cloud infrastructure monitoring`,
        benefits: `- Competitive salary with shift allowances
- Medical insurance
- Pension benefits
- Meal allowances for night shifts
- Training and certifications
- Career growth opportunities`,
        salaryMin: 80000,
        salaryMax: 150000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'ONSITE',
        department: 'Operations',
        expiresInDays: 45,
    },
    {
        title: 'GM - Business Process Re-engineering and Automation',
        company: 'Equity Bank Kenya',
        location: 'Nairobi, Kenya',
        description: `Lead enterprise-wide process optimization and automation initiatives, drive efficiency, and oversee digital transformation programs across Equity Group.

Key Responsibilities:
- Define and execute the process automation strategy
- Lead digital transformation initiatives across the Group
- Identify and prioritize automation opportunities
- Manage RPA and intelligent automation implementations
- Drive operational efficiency and cost optimization
- Build and lead a high-performing team
- Collaborate with business units on process improvements
- Report to executive leadership on transformation progress`,
        requirements: `Required Qualifications:
- Master's degree in Business, Engineering, or related field
- 10+ years of experience with 5+ in leadership roles
- Proven track record in process re-engineering and automation
- Experience with RPA tools (UiPath, Blue Prism, Automation Anywhere)
- Strong knowledge of Lean Six Sigma methodologies
- Excellent strategic thinking and execution abilities
- Outstanding leadership and stakeholder management skills
- Experience in banking or financial services preferred

Certifications:
- Lean Six Sigma Black Belt preferred
- PMP or equivalent project management certification`,
        benefits: `- Executive compensation package
- Comprehensive executive benefits
- Performance bonus
- Company vehicle or allowance
- International travel opportunities
- Executive development programs`,
        salaryMin: 800000,
        salaryMax: 1500000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Operations',
        expiresInDays: 60,
    },

    // Safaricom Kenya Jobs
    {
        title: 'Software Engineer',
        company: 'Safaricom PLC',
        location: 'Nairobi, Kenya',
        description: `Join Safaricom's Technology Division to design, develop and maintain innovative software solutions that power M-PESA and other digital services used by millions.

Key Responsibilities:
- Design and develop high-quality software solutions
- Write clean, scalable, and efficient code
- Participate in full software development lifecycle
- Collaborate with cross-functional teams
- Conduct code reviews and ensure best practices
- Debug, troubleshoot, and resolve software issues
- Contribute to technical documentation
- Stay updated with emerging technologies`,
        requirements: `Required Qualifications:
- BSc in Computer Science, Software Engineering, or IT
- 3+ years of experience in software development
- Extensive programming experience using Java J2EE, Spring Boot
- Proficiency with databases - relational data model, Stored Procedures, PL/SQL, NoSQL, InMemory DBs
- Experience developing and deploying enterprise APIs on TIBCO/WebLogic/Tomcat/Docker/Kubernetes/Openshift/Azure/AWS
- Solid understanding of REST/JSON, WSDL, XML, XSD
- Experience with event-based systems (Apache Kafka, ActiveMQ, RabbitMQ)
- Experience with Git/SVN, CI/CD (Jenkins/Drone/CircleCI)
- Experience in Agile Development/SDLC

Soft Skills:
- Excellent communication and analytical skills
- Team player with problem-solving mindset`,
        benefits: `- Competitive salary (Average KES 1.1M - 1.8M annually)
- Wellness programme
- Creche facilities
- Subsidized gym facilities
- Regular social events
- Career development opportunities
- Medical cover for staff and dependents`,
        salaryMin: 150000,
        salaryMax: 300000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Engineering',
        expiresInDays: 120,
    },
    {
        title: 'DevOps Full Stack Engineer',
        company: 'Safaricom PLC',
        location: 'Nairobi, Kenya',
        description: `Join the Digital IT Department to focus on availability, latency, performance, efficiency, change management, monitoring, emergency response, security and capacity planning.

Key Responsibilities:
- Build operational software and automation scripts
- Manage incident and problem responses
- Design and develop code in agile cycles
- Execute automation scripts for deployment and monitoring
- Conduct peer reviews and maintain documentation
- Ensure system reliability and performance
- Implement security best practices
- Participate in on-call rotations`,
        requirements: `Required Qualifications:
- Master's or Bachelor's degree in Computer Science, Information Systems, or related field
- 3-5 years in programming/systems analysis using agile frameworks
- Proficiency with Scrum, Kanban, XP, LSD, and FDD methodologies
- Multiple programming languages: Android, iOS, HTML, CSS, JavaScript, Java, Ruby, SQL, XML, JSON, YAML, Python
- Strong software architecture knowledge
- Cloud-native environment experience (Kubernetes, Docker)
- CI/CD pipeline management
- Infrastructure as Code (Terraform, Ansible)

Preferred:
- Telecommunications industry background
- Certified Scrum Developer (CSD)
- UX/UI competency`,
        benefits: `- Competitive remuneration
- Medical insurance
- Pension scheme
- Wellness programs
- Learning and development
- Flexible working arrangements`,
        salaryMin: 180000,
        salaryMax: 350000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Engineering',
        expiresInDays: 60,
    },
    {
        title: 'IT Solutions Architect',
        company: 'Safaricom PLC',
        location: 'Nairobi, Kenya',
        description: `Carry out full business requirements discovery including interviewing relevant stakeholders and end users, and design enterprise-grade technology solutions.

Key Responsibilities:
- Lead requirements elicitation and analysis
- Design scalable and secure solution architectures
- Create technical specifications and documentation
- Evaluate and recommend technologies and platforms
- Collaborate with development teams on implementation
- Ensure alignment with enterprise architecture standards
- Review and approve technical designs
- Provide technical leadership and mentoring`,
        requirements: `Required Qualifications:
- Bachelor's or Master's degree in Computer Science or Engineering
- 7+ years of experience in IT with 3+ in architecture roles
- Strong knowledge of enterprise architecture frameworks (TOGAF, Zachman)
- Experience with cloud platforms (Azure, AWS, GCP)
- Understanding of microservices and API-first design
- Knowledge of security architecture principles
- Excellent communication and presentation skills
- Experience in telecommunications or fintech preferred

Certifications:
- TOGAF certification preferred
- Cloud architecture certifications (Azure/AWS Solutions Architect)`,
        benefits: `- Senior-level compensation
- Comprehensive benefits package
- Performance bonus
- Professional development
- International exposure
- Work-life balance initiatives`,
        salaryMin: 350000,
        salaryMax: 600000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Technology',
        expiresInDays: 90,
    },
    {
        title: 'Technology Intern',
        company: 'Safaricom PLC',
        location: 'Nairobi, Kenya',
        description: `Join Safaricom's 2026/27 Annual Internship Program in the Technology department. Gain hands-on experience in one of Africa's leading technology companies.

Key Responsibilities:
- Support software development projects
- Assist in testing and quality assurance
- Participate in agile ceremonies
- Learn enterprise technologies and best practices
- Collaborate with experienced engineers
- Contribute to documentation and knowledge base
- Present learnings to the team`,
        requirements: `Required Qualifications:
- Currently pursuing or recently completed undergraduate degree in Computer Science, IT, Engineering, or related field
- Strong academic record
- Basic programming knowledge (any language)
- Eagerness to learn and grow
- Good communication skills
- Team player attitude
- Available for 3-month structured cycle (July-Sept, Oct-Dec, or Jan-Mar)

Preferred:
- Personal projects or portfolio
- Participation in hackathons or coding competitions
- Knowledge of modern web technologies`,
        benefits: `- Monthly stipend
- Mentorship from industry experts
- Hands-on project experience
- Networking opportunities
- Potential pathway to permanent employment
- Certificate of completion`,
        salaryMin: 30000,
        salaryMax: 50000,
        salaryCurrency: 'KES',
        employmentType: 'INTERNSHIP',
        workplaceType: 'ONSITE',
        department: 'Technology',
        expiresInDays: 180,
    },

    // KCB Bank Kenya Jobs
    {
        title: 'Software Quality Assurance Analyst',
        company: 'KCB Bank Kenya',
        location: 'Nairobi, Kenya',
        description: `Perform quality reviews on business requirements, develop standardized testing methods and strategies, and lead execution of functional and non-functional tests.

Key Responsibilities:
- Review and validate business requirements for testability
- Develop comprehensive test strategies and plans
- Design and execute test cases (manual and automated)
- Lead functional, integration, and regression testing
- Conduct performance and security testing
- Track and report defects using bug tracking systems
- Collaborate with developers to resolve issues
- Maintain testing documentation and metrics`,
        requirements: `Required Qualifications:
- Bachelor's degree in Computer Science, IT, or related field
- 4+ years of experience in software testing
- Strong knowledge of testing methodologies and best practices
- Experience with test automation tools (Selenium, Cypress, JMeter)
- Proficiency in SQL for database testing
- Understanding of CI/CD and DevOps practices
- Experience with Agile/Scrum methodologies
- Knowledge of API testing (Postman, REST Assured)

Certifications:
- ISTQB Foundation or Advanced Level preferred`,
        benefits: `- Competitive salary
- Medical cover
- Pension benefits
- Annual leave
- Professional development
- Banking benefits`,
        salaryMin: 150000,
        salaryMax: 280000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Technology',
        expiresInDays: 60,
    },

    // CRDB Bank Tanzania Jobs
    {
        title: 'IT Support Specialist',
        company: 'CRDB Bank PLC',
        location: 'Dar es Salaam, Tanzania',
        description: `Provide technical assistance and support for computer systems, hardware, and software at CRDB Bank, Tanzania's leading commercial bank.

Key Responsibilities:
- Provide first and second level IT support to staff
- Install, configure, and maintain hardware and software
- Troubleshoot and resolve technical issues
- Manage user accounts and access permissions
- Support network infrastructure and connectivity
- Document issues and solutions in ticketing system
- Assist in IT asset management
- Participate in IT projects and rollouts`,
        requirements: `Required Qualifications:
- Diploma or Bachelor's degree in IT, Computer Science, or related field
- 2-3 years of experience in IT support roles
- Knowledge of Windows and Linux operating systems
- Experience with Microsoft 365 and Active Directory
- Understanding of networking concepts
- Customer service orientation
- Good communication skills in English and Swahili
- Ability to work under pressure

Preferred:
- ITIL Foundation certification
- Banking industry experience
- Hardware troubleshooting skills`,
        benefits: `- Competitive salary
- Medical insurance
- Pension scheme
- Annual leave
- Training opportunities
- Career growth paths`,
        salaryMin: 1500000,
        salaryMax: 2500000,
        salaryCurrency: 'TZS',
        employmentType: 'FULL_TIME',
        workplaceType: 'ONSITE',
        department: 'Technology',
        expiresInDays: 60,
    },
    {
        title: 'Digital Product Manager',
        company: 'CRDB Bank PLC',
        location: 'Dar es Salaam, Tanzania',
        description: `Drive document management solutions, oversee product lifecycle, and align systems with business needs for CRDB Bank's digital transformation journey.

Key Responsibilities:
- Define product vision and strategy for digital solutions
- Manage product backlog and prioritize features
- Collaborate with stakeholders to gather requirements
- Work with engineering teams to deliver products
- Monitor product performance and user feedback
- Conduct market research and competitive analysis
- Drive product adoption and user engagement
- Report on product metrics and KPIs`,
        requirements: `Required Qualifications:
- Bachelor's degree in Business, IT, or related field
- 5+ years of experience in product management
- Experience with digital banking or fintech products
- Strong understanding of product development lifecycle
- Excellent analytical and problem-solving skills
- Outstanding communication and presentation abilities
- Experience with Agile methodologies
- Knowledge of UX principles

Preferred:
- MBA or product management certification
- Experience with mobile money or digital payments
- Fluency in English and Swahili`,
        benefits: `- Attractive compensation package
- Comprehensive medical cover
- Pension benefits
- Performance bonus
- Professional development
- Modern work environment`,
        salaryMin: 4000000,
        salaryMax: 7000000,
        salaryCurrency: 'TZS',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Technology',
        expiresInDays: 30,
    },

    // Vodacom Tanzania Jobs
    {
        title: 'Senior Specialist - Application Development',
        company: 'Vodacom Tanzania',
        location: 'Dar es Salaam, Tanzania',
        description: `Design, develop and implement various applications and API services for Vodacom Tanzania's digital ecosystem serving millions of customers.

Key Responsibilities:
- Design and develop enterprise applications
- Build and maintain API services and integrations
- Implement mobile and web applications
- Ensure code quality and security standards
- Collaborate with business teams on requirements
- Mentor junior developers
- Participate in architecture discussions
- Support production systems and troubleshoot issues`,
        requirements: `Required Qualifications:
- Bachelor's degree in Computer Science or Engineering
- 5+ years of experience in software development
- Strong proficiency in Java, Python, or Node.js
- Experience with mobile development (Android/iOS)
- Knowledge of API design and microservices
- Experience with cloud platforms (AWS, Azure)
- Understanding of CI/CD and DevOps practices
- Telecommunications experience preferred

Soft Skills:
- Strong analytical and problem-solving abilities
- Excellent communication skills
- Ability to work in a fast-paced environment`,
        benefits: `- Competitive salary
- Medical insurance for family
- Pension scheme
- Annual bonus
- Mobile device and airtime allowance
- Learning and development opportunities`,
        salaryMin: 3500000,
        salaryMax: 6000000,
        salaryCurrency: 'TZS',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Technology',
        expiresInDays: 90,
    },

    // MTN Uganda Jobs
    {
        title: 'Senior Specialist - API & Application Development',
        company: 'MTN Uganda',
        location: 'Kampala, Uganda',
        description: `Join MTN Uganda to design, develop and implement various applications and API services that power digital experiences for customers across Uganda.

Key Responsibilities:
- Lead development of APIs and integration services
- Design scalable application architectures
- Implement mobile and web applications
- Drive adoption of best development practices
- Collaborate with product teams on digital initiatives
- Ensure security and compliance standards
- Mentor and guide development team members
- Manage technical debt and system improvements`,
        requirements: `Required Qualifications:
- Bachelor's degree in Computer Science, IT, or related field
- 5+ years of experience in software development
- Expert-level skills in at least two programming languages
- Strong API design and development experience
- Knowledge of microservices and containerization
- Experience with cloud platforms and DevOps
- Understanding of mobile technologies
- Telecommunications experience is a plus

Preferred:
- Master's degree
- Technical certifications
- Experience with M-Money or fintech systems`,
        benefits: `- Competitive compensation
- Medical cover for family
- Pension benefits
- Performance bonus
- Mobile device and airtime
- International exposure opportunities`,
        salaryMin: 8000000,
        salaryMax: 15000000,
        salaryCurrency: 'UGX',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Technology',
        expiresInDays: 90,
    },

    // Additional diverse roles
    {
        title: 'Data Scientist',
        company: 'Safaricom PLC',
        location: 'Nairobi, Kenya',
        description: `Apply advanced analytics and machine learning to solve complex business problems and drive data-driven decision making at Safaricom.

Key Responsibilities:
- Develop and deploy machine learning models
- Analyze large datasets to extract insights
- Build predictive and prescriptive analytics solutions
- Create data visualizations and dashboards
- Collaborate with business teams on use cases
- Present findings to stakeholders
- Stay current with AI/ML advancements
- Contribute to the data science community`,
        requirements: `Required Qualifications:
- Master's degree in Statistics, Mathematics, Computer Science, or related field
- 4+ years of experience in data science or analytics
- Strong proficiency in Python and R
- Experience with ML frameworks (TensorFlow, PyTorch, Scikit-learn)
- Knowledge of SQL and big data technologies
- Experience with cloud ML platforms
- Strong statistical analysis skills
- Excellent communication and storytelling abilities

Preferred:
- PhD in quantitative field
- Publications or research contributions
- Experience in telecommunications or fintech`,
        benefits: `- Senior-level compensation
- Comprehensive benefits
- Research and development time
- Conference attendance
- Cutting-edge technology stack
- Collaborative environment`,
        salaryMin: 250000,
        salaryMax: 500000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Data & Analytics',
        expiresInDays: 90,
    },
    {
        title: 'Cybersecurity Analyst',
        company: 'KCB Bank Kenya',
        location: 'Nairobi, Kenya',
        description: `Protect KCB Bank's digital assets by monitoring security systems, analyzing threats, and responding to security incidents.

Key Responsibilities:
- Monitor security systems and SIEM platforms
- Analyze security alerts and investigate incidents
- Conduct vulnerability assessments and penetration testing
- Implement security controls and hardening measures
- Respond to and contain security incidents
- Document and report security events
- Stay updated on threat landscape
- Support security awareness programs`,
        requirements: `Required Qualifications:
- Bachelor's degree in IT, Cybersecurity, or related field
- 3+ years of experience in cybersecurity
- Knowledge of SIEM tools and security technologies
- Understanding of network security and protocols
- Experience with vulnerability management
- Knowledge of security frameworks (ISO 27001, NIST)
- Strong analytical and problem-solving skills
- Good communication abilities

Certifications:
- CEH, CompTIA Security+, or equivalent required
- CISSP, CISM preferred`,
        benefits: `- Competitive salary
- Medical cover
- Pension scheme
- Performance bonus
- Certification sponsorship
- Career advancement opportunities`,
        salaryMin: 180000,
        salaryMax: 320000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'ONSITE',
        department: 'Technology',
        expiresInDays: 60,
    },
    {
        title: 'UI/UX Designer',
        company: 'Equity Bank Kenya',
        location: 'Nairobi, Kenya',
        description: `Create intuitive and engaging user experiences for Equity Bank's digital banking platforms used by millions of customers across Africa.

Key Responsibilities:
- Design user interfaces for web and mobile applications
- Conduct user research and usability testing
- Create wireframes, prototypes, and design specifications
- Develop and maintain design systems
- Collaborate with product and engineering teams
- Ensure accessibility and inclusive design
- Stay current with design trends and best practices
- Present designs to stakeholders`,
        requirements: `Required Qualifications:
- Bachelor's degree in Design, HCI, or related field
- 4+ years of experience in UI/UX design
- Strong portfolio demonstrating design process
- Proficiency in Figma, Sketch, or Adobe XD
- Experience with prototyping tools
- Knowledge of design systems and component libraries
- Understanding of accessibility standards (WCAG)
- Experience with user research methods

Preferred:
- Banking or fintech design experience
- Knowledge of HTML/CSS
- Motion design skills`,
        benefits: `- Competitive salary
- Medical insurance
- Pension benefits
- Creative work environment
- Design tools and resources
- Professional development`,
        salaryMin: 150000,
        salaryMax: 280000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Technology',
        expiresInDays: 45,
    },
    {
        title: 'Cloud Infrastructure Engineer',
        company: 'Safaricom PLC',
        location: 'Nairobi, Kenya',
        description: `Design, implement, and manage cloud infrastructure supporting Safaricom's digital services and M-PESA platform.

Key Responsibilities:
- Design and implement cloud infrastructure on Azure/AWS
- Manage Kubernetes clusters and containerized workloads
- Implement Infrastructure as Code using Terraform
- Ensure high availability and disaster recovery
- Optimize cloud costs and resource utilization
- Implement security controls and compliance
- Support development teams with cloud services
- Automate operations and monitoring`,
        requirements: `Required Qualifications:
- Bachelor's degree in Computer Science, IT, or related field
- 5+ years of experience in infrastructure/cloud engineering
- Strong experience with Azure or AWS
- Expert-level Kubernetes and Docker skills
- Proficiency with Terraform, Ansible, or Pulumi
- Strong scripting skills (Python, Bash)
- Knowledge of networking and security
- Experience with monitoring tools (Prometheus, Grafana)

Certifications:
- Azure/AWS Solutions Architect or equivalent
- CKA (Certified Kubernetes Administrator) preferred`,
        benefits: `- Competitive compensation
- Comprehensive benefits
- Cloud certification sponsorship
- Cutting-edge technology
- International projects
- Flexible working`,
        salaryMin: 280000,
        salaryMax: 480000,
        salaryCurrency: 'KES',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Engineering',
        expiresInDays: 90,
    },
    {
        title: 'Mobile Application Developer',
        company: 'CRDB Bank PLC',
        location: 'Dar es Salaam, Tanzania',
        description: `Develop and maintain mobile banking applications for CRDB Bank's customers, enabling convenient access to banking services.

Key Responsibilities:
- Develop native and cross-platform mobile applications
- Implement secure banking features and transactions
- Integrate with core banking systems and APIs
- Ensure app performance and user experience
- Conduct code reviews and maintain quality standards
- Support app store submissions and updates
- Troubleshoot and resolve mobile app issues
- Stay updated with mobile development trends`,
        requirements: `Required Qualifications:
- Bachelor's degree in Computer Science or related field
- 4+ years of mobile development experience
- Proficiency in Kotlin/Java for Android or Swift for iOS
- Experience with cross-platform frameworks (Flutter, React Native)
- Knowledge of RESTful APIs and mobile security
- Understanding of mobile UI/UX principles
- Experience with mobile testing and CI/CD
- Published apps on Play Store or App Store

Preferred:
- Banking or fintech app development experience
- Knowledge of mobile money integrations
- Experience with biometric authentication`,
        benefits: `- Competitive salary
- Medical cover
- Pension scheme
- Performance bonus
- Device allowance
- Training opportunities`,
        salaryMin: 3000000,
        salaryMax: 5500000,
        salaryCurrency: 'TZS',
        employmentType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        department: 'Technology',
        expiresInDays: 90,
    },
]

async function main() {
    console.log('Seeding departments...\n')

    const departmentMap = new Map<string, string>()
    for (const dept of DEPARTMENTS) {
        const department = await prisma.department.upsert({
            where: { slug: dept.slug },
            update: {},
            create: {
                name: dept.name,
                slug: dept.slug,
            },
        })
        departmentMap.set(dept.name, department.id)
        console.log(`  Created department: ${dept.name}`)
    }

    console.log('\nSeeding jobs...\n')

    for (const job of JOBS) {
        const departmentId = departmentMap.get(job.department)
        const slug = generateSlug(job.title, job.company)
        const expiresAt = daysFromNow(job.expiresInDays)

        await prisma.job.upsert({
            where: { slug },
            update: {
                title: job.title,
                company: job.company,
                location: job.location,
                description: job.description,
                requirements: job.requirements,
                benefits: job.benefits,
                salaryMin: job.salaryMin,
                salaryMax: job.salaryMax,
                salaryCurrency: job.salaryCurrency,
                employmentType: job.employmentType,
                workplaceType: job.workplaceType,
                status: 'PUBLISHED',
                departmentId,
                expiresAt,
            },
            create: {
                slug,
                title: job.title,
                company: job.company,
                location: job.location,
                description: job.description,
                requirements: job.requirements,
                benefits: job.benefits,
                salaryMin: job.salaryMin,
                salaryMax: job.salaryMax,
                salaryCurrency: job.salaryCurrency,
                employmentType: job.employmentType,
                workplaceType: job.workplaceType,
                status: 'PUBLISHED',
                departmentId,
                publishedAt: new Date(),
                expiresAt,
            },
        })

        console.log(`  Upserted job: ${job.title} at ${job.company}`)
    }

    console.log('\n--- Seeding Complete ---')
    console.log(`Departments upserted: ${DEPARTMENTS.length}`)
    console.log(`Jobs upserted: ${JOBS.length}`)
    console.log('------------------------\n')
}

main()
    .catch(error => {
        console.error('Error seeding jobs:', error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
