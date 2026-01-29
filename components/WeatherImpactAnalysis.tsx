
import React, { useMemo } from 'react';
import { ProjectTask, TaskStatus } from '../types';
import { CloudIcon, SunIcon, BoltIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface WeatherImpactAnalysisProps {
    tasks: ProjectTask[];
}

const WeatherImpactAnalysis: React.FC<WeatherImpactAnalysisProps> = ({ tasks }) => {
    // Mock Weather Forecast for Next 5 Days
    // In real app, this comes from API
    const forecast = [
        { day: 'Today', temp: 28, condition: 'Sunny', rainChance: 0, loadShedding: 2 },
        { day: 'Tomorrow', temp: 22, condition: 'Cloudy', rainChance: 10, loadShedding: 4 },
        { day: 'Wed', temp: 18, condition: 'Rain', rainChance: 80, loadShedding: 3 },
        { day: 'Thu', temp: 19, condition: 'Rain', rainChance: 60, loadShedding: 0 },
        { day: 'Fri', temp: 25, condition: 'Sunny', rainChance: 5, loadShedding: 1 },
    ];

    const weatherSensitiveKeywords = ['paint', 'roof', 'concrete', 'external', 'garden', 'paving', 'brickwork'];
    const powerSensitiveKeywords = ['weld', 'cut', 'drill', 'sand', 'grind'];

    const alerts = useMemo(() => {
        const alertsList: any[] = [];
        
        // Map tasks to days (simple logic: assuming tasks due today/tmrw/etc)
        // For demo, we'll check tasks due in next 5 days
        const today = new Date();
        
        forecast.forEach((dayData, index) => {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + index);
            const dateStr = checkDate.toISOString().split('T')[0];

            const tasksForDay = tasks.filter(t => t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] === dateStr && t.status !== TaskStatus.Completed);

            tasksForDay.forEach(task => {
                const desc = task.description.toLowerCase();
                
                // Rain Check
                if (dayData.rainChance > 40 && weatherSensitiveKeywords.some(k => desc.includes(k))) {
                    alertsList.push({
                        id: `rain-${task.id}`,
                        task: task.description,
                        date: dayData.day,
                        risk: 'Rain',
                        probability: `${dayData.rainChance}%`,
                        icon: CloudIcon,
                        color: 'text-blue-600 bg-blue-50 border-blue-200'
                    });
                }

                // Load Shedding Check
                if (dayData.loadShedding > 2 && powerSensitiveKeywords.some(k => desc.includes(k))) {
                     alertsList.push({
                        id: `ls-${task.id}`,
                        task: task.description,
                        date: dayData.day,
                        risk: `Stage ${dayData.loadShedding} Load Shedding`,
                        probability: 'High Impact',
                        icon: BoltIcon,
                        color: 'text-red-600 bg-red-50 border-red-200'
                    });
                }
            });
        });

        return alertsList;
    }, [tasks]);

    if (alerts.length === 0) return null;

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-500"/> Weather & Power Risks
            </h3>
            <div className="space-y-2">
                {alerts.map(alert => (
                    <div key={alert.id} className={`p-3 rounded-lg border flex items-center justify-between ${alert.color}`}>
                        <div className="flex items-center gap-3">
                            <alert.icon className="h-5 w-5"/>
                            <div>
                                <p className="text-sm font-bold">{alert.task} <span className="font-normal opacity-80">({alert.date})</span></p>
                                <p className="text-xs">{alert.risk} Risk ({alert.probability})</p>
                            </div>
                        </div>
                        <button className="text-xs font-bold underline">Reschedule</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeatherImpactAnalysis;
