export interface CroppedVideo {
    id: string;
    name: string;
    description: string;
    originalPath: string;          
    croppedPath: string; 
    startTime: number;             
    endTime: number;               
    createdAt: string;   
}