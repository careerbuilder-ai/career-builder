import { UserInfo } from './types';

// A simple, royalty-free placeholder avatar image (encoded as base64)
const samplePhoto = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2FkYmVkZCI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMC00LjQ4LTEwLTEwLTEwek0xMiA1YzEuNjYgMCAzIDEuMzQgMyAzcy0xLjM0IDMtMyAzLTMtMS4zNC0zLTMgMS4zNC0zIDMtM3ptMCAxMy4yYy0yLjA4IDAtMy45Ni0uODYtNS4zMy0yLjI0LjgxLTEuNDggMy4xOC0yLjQ2IDUuMzMtMi40NnM0LjUyLjk4IDUuMzMgMi40NmMtMS4zNyAxLjM4LTMuMjUgMi4yNC01LjMzIDIuMjR6Ii8+PC9zdmc+';


export const sampleUserInfo: UserInfo = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  phone: '123-456-7890',
  linkedin: 'linkedin.com/in/alexdoe',
  website: 'alexdoe.dev',
  summary: 'Innovative and results-driven Senior Frontend Developer with over 8 years of experience in creating dynamic, responsive, and user-friendly web applications. Proficient in React, TypeScript, and modern JavaScript frameworks. Passionate about performance optimization and building pixel-perfect user interfaces.',
  photo: samplePhoto,
  experience: [
    {
      id: 'exp1',
      company: 'Innovatech Solutions',
      role: 'Senior Frontend Developer',
      startDate: 'Jan 2020',
      endDate: 'Present',
      description: `- Led the development of a new client-facing dashboard using React and TypeScript, resulting in a 30% increase in user engagement.\n- Mentored a team of 4 junior developers, fostering a culture of code quality and continuous learning.\n- Optimized application performance, reducing initial load time by 40% through code splitting and lazy loading techniques.`,
      years: '4'
    },
    {
      id: 'exp2',
      company: 'Digital Creations Inc.',
      role: 'Frontend Developer',
      startDate: 'Jun 2016',
      endDate: 'Dec 2019',
      description: `- Developed and maintained responsive websites for various clients using HTML, CSS, and JavaScript.\n- Collaborated with UI/UX designers to translate wireframes into high-quality, functional code.\n- Implemented A/B tests that improved conversion rates by 15%.`,
      years: '3'
    }
  ],
  education: [
    {
      id: 'edu1',
      school: 'State University',
      degree: 'B.S. in Computer Science',
      startDate: 'Aug 2012',
      endDate: 'May 2016',
    }
  ],
  skills: 'React, TypeScript, JavaScript (ES6+), Next.js, Redux, GraphQL, Webpack, Babel, Jest, Cypress, HTML5, CSS3, SASS, Styled-Components, Agile Methodologies, CI/CD',
  customSections: [
    {
      id: 'custom1',
      title: 'Projects',
      content: '<ul><li><strong>Portfolio Website:</strong> A personal portfolio built with Next.js and deployed on Vercel, showcasing various projects.</li><li><strong>E-commerce Store UI:</strong> A mock e-commerce frontend built with Redux Toolkit for state management.</li></ul>',
    }
  ],
  referees: [
    {
      id: 'ref1',
      name: 'Jane Smith',
      title: 'Engineering Manager',
      company: 'Innovatech Solutions',
      email: 'jane.smith@innovatech.com',
      phone: '987-654-3210',
    }
  ]
};

export const sampleJobDescription = `**Job Title:** Senior Frontend Engineer (React)

**Location:** Remote

**About the Role:**
We are looking for a passionate Senior Frontend Engineer to join our growing team. You will be responsible for building and maintaining our core web application, which serves thousands of users daily. The ideal candidate has a strong background in React, a keen eye for detail, and a commitment to creating exceptional user experiences.

**Responsibilities:**
- Develop new user-facing features using React.js and TypeScript.
- Build reusable components and front-end libraries for future use.
- Translate designs and wireframes into high-quality code.
- Optimize components for maximum performance across a vast array of web-capable devices and browsers.
- Collaborate with backend developers and UI/UX designers to improve usability.
- Participate in code reviews and mentor junior engineers.

**Qualifications:**
- 5+ years of professional experience in frontend development.
- Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model.
- Thorough understanding of React.js and its core principles.
- Experience with popular React.js workflows (such as Redux or Context API).
- Familiarity with modern front-end build pipelines and tools (e.g., Webpack, Babel, NPM).
- Experience with RESTful APIs.
- A knack for benchmarking and optimization.
`;