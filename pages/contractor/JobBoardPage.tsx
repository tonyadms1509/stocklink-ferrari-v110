
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { JobPosting, JobStatus } from '../../types';
import { ArrowLeftIcon, PlusIcon, UserGroupIcon, SparklesIcon, XMarkIcon, MapPinIcon, CurrencyDollarIcon, CalendarDaysIcon, ClockIcon, PencilIcon, TrashIcon, BriefcaseIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI } from '@google/genai';
import JobPostingFormModal from '../../components/JobPostingFormModal';
import EmptyState from '../../components/EmptyState';

// --- Reusable Components --- //

const ApplyModal: React.FC<{ job: JobPosting; onClose: () => void; }> = ({ job, onClose }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { applyForJob } = useData();
    const [coverLetter, setCoverLetter] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);

    const handleAIDraft = async () => {
        if (!process.env.API_KEY || !user) return;
        setIsDrafting(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `You are a professional assistant for a contractor. Draft a concise and professional cover letter for the following job.
    
            Contractor's Profile:
            - Bio: ${user.bio || 'An experienced contractor.'}
            - Specialties: ${user.specialties?.join(', ') || 'General construction.'}

            Job Posting:
            - Title: ${job.title}
            - Description: ${job.description}
            - Required Skills: ${job.requiredSkills.join(', ')}
            
            Draft a short, compelling message (2-3 sentences) from the contractor expressing interest and highlighting their suitability for the job based on their profile. Start the message with "Hi ${job.contractorName},".`;

            const response = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: prompt
            });
            setCoverLetter(response.text);
        } catch (error) {
            console.error("AI Draft Error:", error);
            alert("Failed to generate AI draft.");
        } finally {
            setIsDrafting(false);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await applyForJob({ jobId: job.id, coverLetter });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-scale">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-primary"></div>
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                
                <div className="mb-6">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Applying for</p>
                    <h2 className="text-2xl font-extrabold text-gray-900">{job.title}</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-gray-700">{t('jobBoardCoverLetter')}</label>
                            <button type="button" onClick={handleAIDraft} disabled={isDrafting} className="flex items-center gap-1 text-xs text-purple-600 font-bold hover:text-purple-800 bg-purple-50 px-3 py-1 rounded-full transition-colors disabled:opacity-50">
                                <SparklesIcon className={`h-3 w-3 ${isDrafting ? 'animate-spin' : ''}`} />
                                {isDrafting ? t('jobBoardAIDrafting') : 'AI Write'}
                            </button>
                        </div>
                        <textarea 
                            value={coverLetter} 
                            onChange={e => setCoverLetter(e.target.value)} 
                            rows={5} 
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                            placeholder={t('jobBoardCoverLetterPlaceholder')} 
                            required 
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                        {t('jobBoardSubmitApplication')}
                    </button>
                </div>
            </form>
        </div>
    );
};


// --- Main Page Component --- //
interface JobBoardPageProps {
    onBack?: () => void;
}

const JobBoardPage: React.FC<JobBoardPageProps> = ({ onBack }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { jobPostings, jobApplications, deleteJobPosting } = useData();
    const [activeTab, setActiveTab] = useState<'find' | 'posted'>('find');
    const [applyingToJob, setApplyingToJob] = useState<JobPosting | null>(null);
    const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
    const [isPostingJob, setIsPostingJob] = useState(false);

    const openJobs = useMemo(() => {
        if (!user) return [];
        return jobPostings.filter(j => j.contractorId !== user.id && j.status === JobStatus.Open);
    }, [jobPostings, user]);

    const myPostings = useMemo(() => {
        if (!user) return [];
        return jobPostings.filter(j => j.contractorId === user.id);
    }, [jobPostings, user]);

    const handleOpenPostModal = (job: JobPosting | null = null) => {
        setEditingJob(job);
        setIsPostingJob(true);
    };

    const handleDelete = async (jobId: string) => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            await deleteJobPosting(jobId);
        }
    };

    return (
        <>
            <div className="h-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 flex-shrink-0">
                     <div className="flex items-center gap-4">
                        {onBack && (
                            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                                <ArrowLeftIcon className="h-5 w-5 text-gray-600"/>
                            </button>
                        )}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <BriefcaseIcon className="h-8 w-8 text-primary"/> {t('navJobBoard')}
                            </h2>
                            <p className="text-gray-500 mt-1">Find work or hire talent.</p>
                        </div>
                    </div>
                    <button onClick={() => handleOpenPostModal()} className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-md transition-transform hover:-translate-y-0.5">
                        <PlusIcon className="h-5 w-5"/>
                        {t('jobBoardPostNew')}
                    </button>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit mb-8">
                    <button onClick={() => setActiveTab('find')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'find' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t('jobBoardFindWork')}</button>
                    <button onClick={() => setActiveTab('posted')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'posted' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t('jobBoardMyPostings')}</button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto pb-10">
                    {activeTab === 'find' && (
                        <div className="space-y-4">
                            {openJobs.length > 0 ? openJobs.map(job => (
                                <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">{job.duration}</span>
                                                <span className="text-gray-400 text-xs">•</span>
                                                <span className="text-gray-500 text-xs font-medium">{new Date(job.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{job.title}</h3>
                                            <p className="text-sm text-gray-600 font-medium mt-1">{job.contractorName}</p>
                                            
                                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                                                <p className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100"><MapPinIcon className="h-4 w-4 text-gray-400"/> {job.location}</p>
                                                <p className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-md border border-green-100 text-green-700 font-bold"><CurrencyDollarIcon className="h-4 w-4"/> {job.payRate}</p>
                                                <p className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100"><CalendarDaysIcon className="h-4 w-4 text-gray-400"/> Start: {new Date(job.startDate).toLocaleDateString()}</p>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {job.requiredSkills.map(skill => (
                                                    <span key={skill} className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setApplyingToJob(job)} 
                                            className="bg-primary text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-sm hover:bg-blue-700 transition-colors flex-shrink-0 w-full md:w-auto text-center"
                                        >
                                            {t('jobBoardApply')}
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <EmptyState
                                    icon={BriefcaseIcon}
                                    title={t('jobBoardNoOpenings')}
                                    message="Check back later for new opportunities."
                                />
                            )}
                        </div>
                    )}

                    {activeTab === 'posted' && (
                         <div className="space-y-4">
                            {myPostings.length > 0 ? myPostings.map(job => {
                                const applicants = jobApplications.filter(app => app.jobId === job.id);
                                return (
                                    <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenPostModal(job)} className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-full transition-colors"><PencilIcon className="h-4 w-4"/></button>
                                            <button onClick={() => handleDelete(job.id)} className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full transition-colors"><TrashIcon className="h-4 w-4"/></button>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4">Posted on {new Date(job.createdAt).toLocaleDateString()}</p>

                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                                <UserGroupIcon className="h-4 w-4 text-gray-400"/>
                                                {t('jobBoardApplicants')} <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">{applicants.length}</span>
                                            </h4>
                                            {applicants.length > 0 ? (
                                                <div className="space-y-2">
                                                    {applicants.map(app => (
                                                        <div key={app.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
                                                            <div>
                                                                <p className="font-bold text-gray-800 text-sm">{app.applicantName}</p>
                                                                <p className="text-xs italic text-gray-500 truncate max-w-[200px] sm:max-w-md">"{app.coverLetter}"</p>
                                                            </div>
                                                            <button className="text-xs font-bold text-primary hover:underline">View Profile</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <p className="text-sm text-gray-400 italic">{t('jobBoardNoApplicants')}</p>}
                                        </div>
                                    </div>
                                )
                            }) : (
                                <EmptyState
                                    icon={PlusIcon}
                                    title="No Jobs Posted"
                                    message="Post a job to find skilled workers."
                                    action={
                                        <button onClick={() => handleOpenPostModal()} className="mt-4 text-primary font-bold hover:underline">
                                            Post a Job Now
                                        </button>
                                    }
                                />
                            )}
                         </div>
                    )}
                </div>
            </div>

            {applyingToJob && <ApplyModal job={applyingToJob} onClose={() => setApplyingToJob(null)} />}
            {isPostingJob && <JobPostingFormModal job={editingJob} onClose={() => { setIsPostingJob(false); setEditingJob(null); }} />}
        </>
    );
};

export default JobBoardPage;
