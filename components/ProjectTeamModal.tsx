
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { ProjectMember, Project } from '../types';
import { XMarkIcon, UserPlusIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from '@google/genai';
import { useData } from '../hooks/useDataContext';

interface ProjectTeamModalProps {
    project: Project;
    onClose: () => void;
    onInvite: (member: Omit<ProjectMember, 'id' | 'status'>) => void;
}

const ProjectTeamModal: React.FC<ProjectTeamModalProps> = ({ project, onClose, onInvite }) => {
    const { t } = useLocalization();
    const { projectMaterials } = useData();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [type, setType] = useState<'Internal' | 'External'>('External');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    useEffect(() => {
        const generateSuggestions = async () => {
            if (!process.env.API_KEY) return;
            setIsLoadingSuggestions(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const materials = projectMaterials
                    .filter(m => m.projectId === project.id)
                    .map(m => m.productName)
                    .join(', ');

                const prompt = `
                    Based on the following list of building materials for a construction project, suggest 3 key tradespeople or sub-contractor roles that would be required.
                    Materials: ${materials}
                    Return a JSON array of strings (e.g. ["Plumber", "Electrician"]).
                `;

                const responseSchema = {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                };

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { responseMimeType: 'application/json', responseSchema }
                });

                setSuggestions(JSON.parse(response.text));
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };
        generateSuggestions();
    }, [project, projectMaterials]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onInvite({
            projectId: project.id,
            name,
            email,
            role,
            type
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                <h2 className="text-xl font-bold text-primary mb-4">{t('projectTeamModalTitle')}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t('projectTeamName')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('projectTeamEmail')}</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('projectTeamRoleLabel')}</label>
                        <input type="text" value={role} onChange={e => setRole(e.target.value)} className="mt-1 p-2 w-full border rounded-md" required placeholder="e.g. Site Manager, Plumber" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('projectTeamType')}</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="mt-1 p-2 w-full border rounded-md bg-white">
                            <option value="External">{t('projectTeamType_External')}</option>
                            <option value="Internal">{t('projectTeamType_Internal')}</option>
                        </select>
                    </div>

                    {suggestions.length > 0 && (
                        <div className="bg-blue-50 p-3 rounded-lg mt-2">
                            <p className="text-xs font-bold text-blue-800 flex items-center gap-1 mb-2">
                                <SparklesIcon className="h-3 w-3"/> {t('projectTeamAISuggestions')}
                            </p>
                            <p className="text-xs text-blue-600 mb-2">{t('projectTeamAISuggestionsDesc')}</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map(s => (
                                    <button 
                                        key={s}
                                        type="button"
                                        onClick={() => setRole(s)}
                                        className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-100"
                                    >
                                        + {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('payoutCancel')}</button>
                        <button type="submit" className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg">{t('projectTeamSendInvite')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectTeamModal;
