import React from 'react';
import { ResumeTemplate } from '../types.ts';
import { UserInfo, Suggestion } from '../types.ts';
import { EmailIcon } from './icons/EmailIcon.tsx';
import { PhoneIcon } from './icons/PhoneIcon.tsx';
import { LinkedinIcon } from './icons/LinkedinIcon.tsx';
import { LinkIcon } from './icons/LinkIcon.tsx';
import ProofreadTextRenderer from './common/ProofreadTextRenderer.tsx';
import { ProofreadIcon } from './icons/ProofreadIcon.tsx';

interface ResumePreviewProps {
  userInfo: UserInfo;
  generatedSummary: string | null;
  template: ResumeTemplate;
  suggestions: Suggestion[];
  onAcceptSuggestion: (id: string) => void;
  onRejectSuggestion: (id: string) => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ 
  userInfo, 
  generatedSummary, 
  template,
  suggestions,
  onAcceptSuggestion,
  onRejectSuggestion,
}) => {

  const modernContactInfo = () => (
    <>
      {userInfo.email && <div className="flex items-center gap-2"><EmailIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" /><span>{userInfo.email}</span></div>}
      {userInfo.phone && <div className="flex items-center gap-2"><PhoneIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" /><span>{userInfo.phone}</span></div>}
      {userInfo.linkedin && <div className="flex items-center gap-2"><LinkedinIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" /><span>{userInfo.linkedin}</span></div>}
      {userInfo.website && <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" /><span>{userInfo.website}</span></div>}
    </>
  );

  const summaryText = generatedSummary || userInfo.summary;

  let content;

  if (template === 'modern') {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 font-sans">
        <aside className="md:col-span-1 md:border-r md:pr-8 border-slate-200 dark:border-slate-700">
          {userInfo.photo && (
            <img src={userInfo.photo} alt={userInfo.name} className="w-32 h-32 rounded-full mx-auto mb-6 object-cover" />
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center">{userInfo.name}</h1>
          <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <h2 className="text-base sm:text-lg font-semibold text-indigo-600 dark:text-indigo-400 border-b dark:border-slate-700 pb-2 mb-3">CONTACT</h2>
            {modernContactInfo()}
          </div>
          {userInfo.skills && (
            <div className="mt-8">
              <h2 className="text-base sm:text-lg font-semibold text-indigo-600 dark:text-indigo-400 border-b dark:border-slate-700 pb-2 mb-3">SKILLS</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{userInfo.skills}</p>
            </div>
          )}
        </aside>
        <main className="md:col-span-2">
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 border-b-2 border-indigo-500 pb-2 mb-4">PROFESSIONAL SUMMARY</h2>
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-6">
              <ProofreadTextRenderer
                text={summaryText}
                suggestions={suggestions}
                onAccept={onAcceptSuggestion}
                onReject={onRejectSuggestion}
              />
            </div>
          </section>
          <section className="mt-8">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 border-b-2 border-indigo-500 pb-2 mb-4">WORK EXPERIENCE</h2>
            {userInfo.experience.map(exp => (
              <div key={exp.id} className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">{exp.role}</h3>
                <p className="text-base text-slate-600 dark:text-slate-300 font-medium">{exp.company}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{exp.startDate} - {exp.endDate}</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-6">{exp.description}</p>
              </div>
            ))}
          </section>
          <section className="mt-8">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 border-b-2 border-indigo-500 pb-2 mb-4">EDUCATION</h2>
            {userInfo.education.map(edu => (
              <div key={edu.id} className="mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">{edu.degree}</h3>
                <p className="text-base text-slate-600 dark:text-slate-300 font-medium">{edu.school}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{edu.startDate} - {edu.endDate}</p>
              </div>
            ))}
          </section>
          {userInfo.customSections?.map(section => (
            <section className="mt-8" key={section.id}>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 border-b-2 border-indigo-500 pb-2 mb-4">{section.title.toUpperCase()}</h2>
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-6 custom-content" dangerouslySetInnerHTML={{ __html: section.content }} />
            </section>
          ))}
          {userInfo.referees?.length > 0 && (
            <section className="mt-8">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 border-b-2 border-indigo-500 pb-2 mb-4">REFEREES</h2>
                {userInfo.referees.map(ref => (
                <div key={ref.id} className="mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">{ref.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{ref.title}, {ref.company}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ref.email}{ref.phone && ` | ${ref.phone}`}</p>
                </div>
                ))}
            </section>
          )}
        </main>
      </div>
    );
  } else if (template === 'classic') {
    content = (
      <div className="font-serif">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-wide text-slate-900 dark:text-white">{userInfo.name}</h1>
          <div className="mt-3 flex justify-center items-center flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
              {[userInfo.email, userInfo.phone, userInfo.linkedin, userInfo.website].filter(Boolean).map((item, index) => (
                  <React.Fragment key={item}>
                      {index > 0 && <span className="text-slate-400 dark:text-slate-500 mx-2">&bull;</span>}
                      <span>{item}</span>
                  </React.Fragment>
              ))}
          </div>
        </header>
        <main>
          {(generatedSummary || userInfo.summary) && (
              <section>
                  <div className="border-b-2 border-slate-200 dark:border-slate-700 pb-2 mb-4">
                      <h2 className="text-base sm:text-lg font-semibold tracking-wider text-slate-800 dark:text-slate-200 text-center uppercase">Summary</h2>
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-center">
                    <ProofreadTextRenderer
                      text={summaryText}
                      suggestions={suggestions}
                      onAccept={onAcceptSuggestion}
                      onReject={onRejectSuggestion}
                    />
                  </div>
              </section>
          )}
          {userInfo.experience?.length > 0 && (
              <section className="mt-8">
                  <div className="border-b-2 border-slate-200 dark:border-slate-700 pb-2 mb-4">
                      <h2 className="text-base sm:text-lg font-semibold tracking-wider text-slate-800 dark:text-slate-200 text-center uppercase">Experience</h2>
                  </div>
                  {userInfo.experience.map(exp => (
                      <div key={exp.id} className="mb-6">
                          <div className="flex justify-between items-baseline mb-1">
                              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">{exp.company}</h3>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{exp.startDate} - {exp.endDate}</p>
                          </div>
                          <p className="text-base italic text-slate-600 dark:text-slate-400 mb-2">{exp.role}</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                      </div>
                  ))}
              </section>
          )}
          {userInfo.education?.length > 0 && (
              <section className="mt-8">
                  <div className="border-b-2 border-slate-200 dark:border-slate-700 pb-2 mb-4">
                      <h2 className="text-base sm:text-lg font-semibold tracking-wider text-slate-800 dark:text-slate-200 text-center uppercase">Education</h2>
                  </div>
                  {userInfo.education.map(edu => (
                      <div key={edu.id} className="mb-4 text-center">
                          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">{edu.school}</h3>
                          <p className="text-base text-slate-600 dark:text-slate-300">{edu.degree}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{edu.startDate} - {edu.endDate}</p>
                      </div>
                  ))}
              </section>
          )}
          {userInfo.customSections?.map(section => (
            <section className="mt-8" key={section.id}>
              <div className="border-b-2 border-slate-200 dark:border-slate-700 pb-2 mb-4">
                  <h2 className="text-base sm:text-lg font-semibold tracking-wider text-slate-800 dark:text-slate-200 text-center uppercase">{section.title}</h2>
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed custom-content" dangerouslySetInnerHTML={{ __html: section.content }} />
            </section>
          ))}
          {userInfo.skills && (
              <section className="mt-8">
                  <div className="border-b-2 border-slate-200 dark:border-slate-700 pb-2 mb-4">
                      <h2 className="text-base sm:text-lg font-semibold tracking-wider text-slate-800 dark:text-slate-200 text-center uppercase">Skills</h2>
                  </div>
                  <p className="text-sm text-center text-slate-700 dark:text-slate-300 leading-relaxed">{userInfo.skills}</p>
              </section>
          )}
          {userInfo.referees?.length > 0 && (
            <section className="mt-8">
                <div className="border-b-2 border-slate-200 dark:border-slate-700 pb-2 mb-4">
                    <h2 className="text-base sm:text-lg font-semibold tracking-wider text-slate-800 dark:text-slate-200 text-center uppercase">Referees</h2>
                </div>
                {userInfo.referees.map(ref => (
                    <div key={ref.id} className="mb-4 text-center">
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">{ref.name}</h3>
                        <p className="text-base text-slate-600 dark:text-slate-300">{ref.title}, {ref.company}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{ref.email}{ref.phone && ` | ${ref.phone}`}</p>
                    </div>
                ))}
            </section>
          )}
        </main>
      </div>
    );
  } else if (template === 'minimalist') {
    content = (
      <div className="font-sans">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extralight tracking-widest text-slate-800 dark:text-white uppercase">{userInfo.name || 'Your Name'}</h1>
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 tracking-wider">
            {[userInfo.email, userInfo.phone, userInfo.linkedin, userInfo.website].filter(Boolean).join('  |  ')}
          </div>
        </header>
        <main>
          {(generatedSummary || userInfo.summary) && (
            <section className="mb-8">
              <h2 className="text-sm font-medium tracking-widest text-slate-700 dark:text-slate-300 uppercase mb-3 pb-2 border-b dark:border-slate-700">Summary</h2>
              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <ProofreadTextRenderer
                  text={summaryText}
                  suggestions={suggestions}
                  onAccept={onAcceptSuggestion}
                  onReject={onRejectSuggestion}
                />
              </div>
            </section>
          )}
          {userInfo.experience?.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-medium tracking-widest text-slate-700 dark:text-slate-300 uppercase mb-4 pb-2 border-b dark:border-slate-700">Experience</h2>
              {userInfo.experience.map(exp => (
                <div key={exp.id} className="mb-5">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{exp.role}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{exp.startDate} - {exp.endDate}</p>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{exp.company}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </section>
          )}
          {userInfo.customSections?.map(section => (
              <section className="mb-8" key={section.id}>
                <h2 className="text-sm font-medium tracking-widest text-slate-700 dark:text-slate-300 uppercase mb-3 pb-2 border-b dark:border-slate-700">{section.title}</h2>
                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed custom-content" dangerouslySetInnerHTML={{ __html: section.content }} />
              </section>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {userInfo.education?.length > 0 && (
              <section>
                <h2 className="text-sm font-medium tracking-widest text-slate-700 dark:text-slate-300 uppercase mb-4 pb-2 border-b dark:border-slate-700">Education</h2>
                {userInfo.education.map(edu => (
                  <div key={edu.id} className="mb-4">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{edu.school}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{edu.degree}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{edu.startDate} - {edu.endDate}</p>
                  </div>
                ))}
              </section>
            )}
            {userInfo.skills && (
              <section>
                <h2 className="text-sm font-medium tracking-widest text-slate-700 dark:text-slate-300 uppercase mb-4 pb-2 border-b dark:border-slate-700">Skills</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{userInfo.skills}</p>
              </section>
            )}
          </div>
          {userInfo.referees?.length > 0 && (
            <section className="mt-8">
                <h2 className="text-sm font-medium tracking-widest text-slate-700 dark:text-slate-300 uppercase mb-4 pb-2 border-b dark:border-slate-700">Referees</h2>
                {userInfo.referees.map(ref => (
                    <div key={ref.id} className="mb-4">
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{ref.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{ref.title}, {ref.company}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{ref.email}{ref.phone && ` | ${ref.phone}`}</p>
                    </div>
                ))}
            </section>
          )}
        </main>
      </div>
    );
  } else if (template === 'creative') {
    content = (
      <div className="font-sans flex flex-col md:flex-row min-h-[29.7cm]">
        <aside className="w-full md:w-1/3 bg-slate-800 text-white p-6 sm:p-8 print:bg-slate-800 dark:bg-slate-800">
            {userInfo.photo && (
              <img src={userInfo.photo} alt={userInfo.name} className="w-32 h-32 rounded-full mx-auto mb-6 object-cover ring-4 ring-teal-400" />
            )}
            <div className="text-center">
              <h2 className="text-lg font-semibold text-teal-400 uppercase tracking-wider mb-4">Contact</h2>
              <div className="space-y-2 text-sm text-slate-300 break-words">
                {userInfo.email && <p>{userInfo.email}</p>}
                {userInfo.phone && <p>{userInfo.phone}</p>}
                {userInfo.linkedin && <p>{userInfo.linkedin}</p>}
                {userInfo.website && <p>{userInfo.website}</p>}
              </div>
            </div>
            {userInfo.skills && (
              <div className="mt-8 text-center">
                <h2 className="text-lg font-semibold text-teal-400 uppercase tracking-wider mb-4">Skills</h2>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{userInfo.skills}</p>
              </div>
            )}
        </aside>
        <main className="w-full md:w-2/3 p-6 sm:p-8">
          <header className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-white">{userInfo.name}</h1>
          </header>
          {(generatedSummary || userInfo.summary) && (
            <section className="mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-teal-500 dark:text-teal-400 uppercase tracking-widest mb-3">Summary</h2>
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <ProofreadTextRenderer
                  text={summaryText}
                  suggestions={suggestions}
                  onAccept={onAcceptSuggestion}
                  onReject={onRejectSuggestion}
                />
              </div>
            </section>
          )}
          {userInfo.experience?.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-teal-500 dark:text-teal-400 uppercase tracking-widest mb-4">Experience</h2>
              {userInfo.experience.map(exp => (
                <div key={exp.id} className="mb-5 relative pl-5">
                  <div className="absolute left-0 top-1.5 w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                  <div className="absolute left-[3px] top-1.5 w-0.5 h-full bg-slate-300 dark:bg-slate-600"></div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">{exp.role}</h3>
                  <p className="text-base text-slate-600 dark:text-slate-300">{exp.company}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{exp.startDate} - {exp.endDate}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </section>
          )}
          {userInfo.education?.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-teal-500 dark:text-teal-400 uppercase tracking-widest mb-4">Education</h2>
                {userInfo.education.map(edu => (
                <div key={edu.id} className="mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">{edu.school}</h3>
                  <p className="text-base text-slate-600 dark:text-slate-300">{edu.degree}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </section>
          )}
          {userInfo.customSections?.map(section => (
              <section className="mb-8" key={section.id}>
                <h2 className="text-lg sm:text-xl font-bold text-teal-500 dark:text-teal-400 uppercase tracking-widest mb-3">{section.title}</h2>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed custom-content" dangerouslySetInnerHTML={{ __html: section.content }} />
              </section>
          ))}
          {userInfo.referees?.length > 0 && (
            <section className="mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-teal-500 dark:text-teal-400 uppercase tracking-widest mb-3">Referees</h2>
                {userInfo.referees.map(ref => (
                    <div key={ref.id} className="mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">{ref.name}</h3>
                        <p className="text-base text-slate-600 dark:text-slate-300">{ref.title}, {ref.company}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ref.email}{ref.phone && ` | ${ref.phone}`}</p>
                    </div>
                ))}
            </section>
          )}
        </main>
      </div>
    );
  }

  return (
    <div 
      id="resume-preview" 
      className={`bg-white dark:bg-slate-900 shadow-md print:shadow-none print:rounded-none print:p-0 transition-all duration-300 ${template === 'creative' ? 'p-0 overflow-hidden rounded-lg' : 'p-4 sm:p-6 md:p-10 lg:p-12 rounded-lg'}`}
    >
      <style>{`
        .dark .custom-content ul {
          color: #cbd5e1; /* slate-300 */
        }
        .dark .custom-content li::marker {
          color: #94a3b8; /* slate-400 */
        }
        .dark .custom-content strong {
          color: #f1f5f9; /* slate-100 */
        }
        .dark .custom-content a {
          color: #818cf8; /* indigo-400 */
        }
      `}</style>
      {content}
    </div>
  );
};

export default ResumePreview;