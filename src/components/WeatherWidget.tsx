import React, { useState, useEffect } from 'react';
import { SunIcon, CloudIcon, BoltIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../hooks/useLocalization';

const WeatherWidget: React.FC<{ condensed?: boolean }> = ({ condensed = false }) => {
    const { t } = useLocalization();
    const [weather, setWeather] = useState<{ temp: number, condition: string, code: number } | null>(null);
    const [loadSheddingStage, setLoadSheddingStage] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Weather from Open-Meteo API
        const fetchWeather = async (lat: number, lon: number) => {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
                );
                const data = await response.json();
                
                const getWeatherDescription = (code: number) => {
                    if (code <= 1) return 'Sunny';
                    if (code <= 3) return 'Cloudy';
                    if (code <= 67) return 'Rain';
                    return 'Storm';
                };

                setWeather({
                    temp: Math.round(data.current_weather.temperature),
                    condition: getWeatherDescription(data.current_weather.weathercode),
                    code: data.current_weather.weathercode
                });
            } catch (error) {
                console.error("Weather fetch failed:", error);
                setWeather({ temp: 24, condition: 'Sunny', code: 0 }); 
            } finally {
                setLoading(false);
            }
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
                (error) => {
                    console.warn("Geolocation denied:", error);
                    fetchWeather(-26.2041, 28.0473); // Default to Johannesburg
                }
            );
        } else {
            fetchWeather(-26.2041, 28.0473); // Default to Johannesburg
        }

        // Simulate Load Shedding Stage based on time of day (Mock logic)
        const hour = new Date().getHours();
        if (hour >= 17 && hour <= 21) setLoadSheddingStage(4);
        else if (hour >= 6 && hour <= 9) setLoadSheddingStage(2);
        else setLoadSheddingStage(0);

    }, []);

    const getWeatherIcon = (code: number) => {
        if (code <= 1) return <SunIcon className={`text-yellow-400 ${condensed ? 'h-3 w-3' : 'h-12 w-12'}`} />;
        if (code <= 3) return <CloudIcon className={`text-gray-300 ${condensed ? 'h-3 w-3' : 'h-12 w-12'}`} />;
        if (code <= 67) return <CloudIcon className={`text-blue-400 ${condensed ? 'h-3 w-3' : 'h-12 w-12'}`} />;
        return <BoltIcon className={`text-yellow-600 ${condensed ? 'h-3 w-3' : 'h-12 w-12'}`} />;
    };

    const getStageColor = (stage: number) => {
        if (stage === 0) return 'bg-green-500/20 text-green-100 border-green-500/30';
        if (stage <= 2) return 'bg-yellow-500/20 text-yellow-100 border-yellow-500/30';
        return 'bg-red-500/20 text-red-100 border-red-500/30 animate-pulse';
    };

    if (loading) return <div className={`animate-pulse bg-white/10 rounded ${condensed ? 'h-6 w-20' : 'h-32 w-full'}`}></div>;
    if (!weather) return null;

    if (condensed) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    {getWeatherIcon(weather.code)}
                    <span>{weather.temp}°C</span>
                </div>
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${getStageColor(loadSheddingStage)}`}>
                    <BoltIcon className="h-3 w-3" />
                    {loadSheddingStage === 0 ? 'No LS' : `Stage ${loadSheddingStage}`}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-xl shadow-md text-white border border-white/10 text-left">
            <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold flex items-center gap-2"><CloudIcon className="h-5 w-5"/> Site Status</h4>
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border ${getStageColor(loadSheddingStage)}`}>
                    <BoltIcon className="h-3 w-3" />
                    {loadSheddingStage === 0 ? 'Grid Stable' : `Eskom Stage ${loadSheddingStage}`}
                </div>
            </div>
            
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-3xl font-bold">{weather.temp}°C</p>
                    <p className="text-blue-100 text-sm">{weather.condition}</p>
                </div>
                {getWeatherIcon(weather.code)}
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-xs">
                <p className="font-bold bg-white/20 inline-block px-2 py-1 rounded">
                    {weather.code > 50 ? 'Rain Risk: High' : 'Rain Risk: Low'}
                </p>
                {loadSheddingStage > 0 && <span className="text-red-200 font-bold">Plan for outages</span>}
            </div>
        </div>
    );
};

export default WeatherWidget;