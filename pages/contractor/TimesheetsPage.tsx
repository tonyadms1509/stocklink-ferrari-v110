


import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { TimesheetEntry, Project, ProjectMember } from '../../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon, PencilIcon, SparklesIcon, ClockIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from '@google/genai';
import TimesheetFormModal from '../../components/TimesheetFormModal';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';

const TimesheetsPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const { timesheets, projects, projectMembers, addTimesheetEntry, updateTimesheetEntry, deleteTimesheetEntry } = useData();
    const { user } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);
    const [quickLogText, setQuickLogText] = useState('');
    const [isAILogging, setIsAILogging] = useState(false);

    const myTimesheets = useMemo(() => {
        return timesheets.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [timesheets]);

    const stats = useMemo(() => {
        const totalHours = myTimesheets.reduce((sum, t) => sum + t.hours, 0);
        const totalCost = myTimesheets.reduce((sum, t) => sum + (t.hours * (t.hourlyRate || 0)), 0);
        return { totalHours, totalCost };
    }, [myTimesheets]);

    const handleOpenEdit = (entry: TimesheetEntry) => {
        setEditingEntry(entry);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this entry?')) {
            await deleteTimesheetEntry(id);
        }
    };

    const handleSaveEntry = async (entryData: any) => {
        if (editingEntry) {
            await updateTimesheetEntry(editingEntry.id, entryData);
        } else {
            await addTimesheetEntry(entryData);
        }
        setIsModalOpen(false);
        setEditingEntry(null);
    };

    const handleAIQuickLog = async () => {
        if (!quickLogText.trim() || !process.env.API_KEY) return;
        setIsAILogging(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Provide context
            const projectContext = projects.map(p => ({ id: p.id, name: p.projectName }));
            const memberContext = projectMembers.map(m => m.name);

            const prompt = `
                Extract timesheet entries from the following text: "${quickLogText}".
                
                Context:
                - Projects: ${JSON.stringify(projectContext)}
                - Team Members: ${memberContext.join(', ')}
                
                Return a JSON array of objects with:
                - workerName (string)
                - projectId (string, try to match from context)
                - projectName (string)
                - hours (number)
                - description (string)
                - date (string, YYYY-MM-DD, default to today if not specified)
            `;

            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        workerName: { type: Type.STRING },
                        projectId: { type: Type.STRING, nullable: true },
                        projectName: { type: Type.STRING, nullable: true },
                        hours: { type: Type.NUMBER },
                        description: { type: Type.STRING },
                        date: { type: Type.STRING }
                    },
                    required: ['workerName', 'hours', 'description']
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json', responseSchema }
            });

            const entries = JSON.parse(response.text);
            
            for (const entry of entries) {
                await addTimesheetEntry({
                    ...entry,
                    date: new Date(entry.date || new Date()),
                    hourlyRate: 0, // Default rate, can be edited
                    status: 'Pending'
                });
            }
            setQuickLogText('');

        } catch (e) {
            console.error(e);
            alert("Failed to parse text.");
        } finally {
            setIsAILogging(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
             {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    {t('backToDashboard')}
                </button>
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3"><ClockIcon className="h-8 w-8 text-primary"/> {t('timesheetsTitle')}</h2>
                    <p className="text-gray-600 mt-1">{t('timesheetsDescription')}</p>
                </div>
                <button onClick={() => { setEditingEntry(null); setIsModalOpen(true); }} className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusIcon className="h-5 w-5"/>
                    {t('timesheetsAddEntry')}
                </button>
            </div>

            {/* AI Quick Log */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4 text-accent"/> {t('timesheetsAIQuickLog')}
                </label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={quickLogText} 
                        onChange={e => setQuickLogText(e.target.value)} 
                        placeholder={t('timesheetsAIPlaceholder')} 
                        className="flex-grow p-2 border rounded-lg"
                        disabled={isAILogging}
                    />
                    <button 
                        onClick={handleAIQuickLog} 
                        disabled={isAILogging || !quickLogText}
                        className="bg-primary text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 flex items-center gap-2"
                    >
                        {isAILogging ? t('timesheetsAIProcessing') : t('timesheetsAILogButton')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
                    <span className="text-blue-800 font-semibold">{t('timesheetsTotalHours')}</span>
                    <span className="text-2xl font-bold text-blue-600">{stats.totalHours}</span>
                </div>
                 <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex justify-between items-center">
                    <span className="text-green-800 font-semibold">{t('timesheetsTotalCost')} (Est.)</span>
                    <span className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCost)}</span>
                </div>
            </div>

            {myTimesheets.length === 0 ? (
                <EmptyState
                    icon={CalendarDaysIcon}
                    title={t('timesheetsNoEntries')}
                    message="Log hours manually or use the AI Quick Log."
                />
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden flex-grow overflow-y-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-base-200">
                            <tr>
                                <th className="p-4">{t('timesheetsDate')}</th>
                                <th className="p-4">{t('timesheetsWorker')}</th>
                                <th className="p-4">{t('timesheetsProject')}</th>
                                <th className="p-4">{t('timesheetsDescriptionField')}</th>
                                <th className="p-4 text-center">{t('timesheetsHours')}</th>
                                <th className="p-4 text-right">{t('timesheetsActions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myTimesheets.map(entry => (
                                <tr key={entry.id} className="border-b last:border-0 hover:bg-base-100">
                                    <td className="p-4">{entry.date.toLocaleDateString()}</td>
                                    <td className="p-4 font-medium">{entry.workerName}</td>
                                    <td className="p-4 text-gray-600">{entry.projectName || '-'}</td>
                                    <td className="p-4 text-gray-600">{entry.description}</td>
                                    <td className="p-4 text-center font-bold">{entry.hours}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleOpenEdit(entry)} className="text-gray-500 hover:text-primary p-1"><PencilIcon className="h-4 w-4"/></button>
                                        <button onClick={() => handleDelete(entry.id)} className="text-gray-500 hover:text-red-500 p-1 ml-2"><TrashIcon className="h-4 w-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <TimesheetFormModal 
                    entry={editingEntry}
                    projects={projects}
                    members={projectMembers}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveEntry}
                />
            )}
        </div>
    );
};

export default TimesheetsPage;