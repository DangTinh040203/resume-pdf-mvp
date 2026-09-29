import { Globe, Link, Mail, MapPin, Phone } from 'lucide-react';

// Plain Tailwind/React resume template — no PDF-renderer primitives. This
// exact markup drives the on-screen preview (via Paged.js in App.jsx) AND
// the exported PDF (rendered as-is by the backend's headless Chromium at
// /print, relying on the browser's native print pagination). Same DOM, same
// CSS, both places — that's the whole point of this architecture.
const infoIcons = {
  email: Mail,
  phone: Phone,
  location: MapPin,
  linkedin: Link,
  website: Globe,
};

const formatRange = (start, end) => `${start} — ${end ?? 'Present'}`;

const SectionHeading = ({ children }) => (
  <h2 className='text-primary mb-2 text-[8.25pt] font-bold tracking-[0.15em] uppercase'>
    {children}
  </h2>
);

const ResumeContent = ({ resume }) => {
  return (
    <div className='text-[10.5pt] leading-relaxed text-neutral-800'>
      {/* Header */}
      <header className='border-b-2 border-neutral-900 pb-4'>
        <h1 className='text-[22.5pt] font-bold tracking-tight text-neutral-900'>
          {resume.title}
        </h1>
        <p className='text-primary mt-1 text-[12pt] font-medium'>
          {resume.subTitle}
        </p>
        <div className='mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[9.5pt] text-neutral-600'>
          {resume.information.map((info) => {
            const Icon = infoIcons[info.label] ?? Globe;
            return (
              <span key={info.id} className='inline-flex items-center gap-1.5'>
                <Icon className='h-3.5 w-3.5' />
                {info.value}
              </span>
            );
          })}
        </div>
      </header>

      {/* Summary */}
      <section className='mt-5'>
        <SectionHeading>Summary</SectionHeading>
        <p className='text-neutral-700'>{resume.overview}</p>
      </section>

      {/* Skills */}
      <section className='mt-5'>
        <SectionHeading>Skills</SectionHeading>
        <div className='flex flex-wrap gap-2'>
          {resume.skills.map((skill) => (
            <span
              key={skill.id}
              className='rounded border border-neutral-300 bg-neutral-50 px-2 py-0.5 text-[9.5pt] text-neutral-700'
            >
              {skill.label}
              <span className='text-neutral-400'> · {skill.value}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className='mt-5'>
        <SectionHeading>Experience</SectionHeading>
        <div className='space-y-4'>
          {resume.workExperiences.map((exp) => (
            <div key={exp.id} className='break-inside-avoid'>
              <div className='flex items-baseline justify-between gap-4'>
                <h3 className='font-semibold text-neutral-900'>
                  {exp.position} · {exp.company}
                </h3>
                <span className='shrink-0 text-[9pt] whitespace-nowrap text-neutral-500'>
                  {formatRange(exp.startDate, exp.endDate)}
                </span>
              </div>
              <ul className='mt-1 list-disc space-y-0.5 pl-4 text-neutral-700'>
                {exp.description
                  .split('\n')
                  .filter(Boolean)
                  .map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className='mt-5'>
        <SectionHeading>Education</SectionHeading>
        <div className='space-y-2'>
          {resume.educations.map((edu) => (
            <div
              key={edu.id}
              className='flex items-baseline justify-between gap-4 break-inside-avoid'
            >
              <div>
                <h3 className='font-semibold text-neutral-900'>{edu.school}</h3>
                <p className='text-neutral-600'>
                  {edu.degree} · {edu.major}
                </p>
              </div>
              <span className='shrink-0 text-[9pt] whitespace-nowrap text-neutral-500'>
                {formatRange(edu.startDate, edu.endDate)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className='mt-5'>
        <SectionHeading>Projects</SectionHeading>
        <div className='space-y-3'>
          {resume.projects.map((project) => (
            <div key={project.id} className='break-inside-avoid'>
              <h3 className='font-semibold text-neutral-900'>
                {project.title}
                <span className='font-normal text-neutral-500'> — {project.subTitle}</span>
              </h3>
              <p className='text-neutral-700'>{project.responsibilities}</p>
              <p className='text-[9.5pt] text-neutral-500'>Tech: {project.technologies}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications + Languages, side by side */}
      <div className='mt-5 grid grid-cols-2 gap-6'>
        <section>
          <SectionHeading>Certifications</SectionHeading>
          <ul className='space-y-1'>
            {resume.certifications.map((cert) => (
              <li key={cert.id} className='text-neutral-700'>
                <span className='font-medium text-neutral-900'>{cert.name}</span> —{' '}
                {cert.issuer} ({cert.date})
              </li>
            ))}
          </ul>
        </section>
        <section>
          <SectionHeading>Languages</SectionHeading>
          <ul className='space-y-1'>
            {resume.languages.map((lang) => (
              <li key={lang.id} className='text-neutral-700'>
                <span className='font-medium text-neutral-900'>{lang.name}</span> —{' '}
                {lang.description}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ResumeContent;
