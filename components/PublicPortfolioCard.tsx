
import React from 'react';
import { PortfolioProject } from '../types';

interface PublicPortfolioCardProps {
    project: PortfolioProject;
    onClick: () => void;
}

const PublicPortfolioCard: React.FC<PublicPortfolioCardProps> = ({ project, onClick }) => (
    <div onClick={onClick} className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer transition-shadow hover:shadow-xl">
        <div className="aspect-w-4 aspect-h-3">
            <img src={project.imageUrls[0] || 'https://picsum.photos/400/300'} alt={project.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-800 truncate">{project.title}</h4>
            <p className="text-xs text-gray-500">Completed: {new Date(project.completionDate).toLocaleDateString()}</p>
        </div>
    </div>
);

export default PublicPortfolioCard;
