import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CroppedVideo } from '@/types/CroppedVideo';
import * as FileSystem from 'expo-file-system/legacy';

interface VideoStore {
  videos: CroppedVideo[];
  isLoading: boolean;
  error: string | null;

  // Fonksiyonlar
  addVideo: (video: CroppedVideo) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  updateVideo: (id: string, updates: Partial<CroppedVideo>) => Promise<void>;
  loadVideos: () => Promise<void>;
}

const STORAGE_KEY = 'videos_data';
const VIDEO_DIR = `${FileSystem.documentDirectory}videos/`;

// Copy videos to permanent folder
const copyVideoToStorage = async (sourceUri: string, videoId: string): Promise<string> => {
  try {
    // Check if the folder exists, if not, create it
    const dirInfo = await FileSystem.getInfoAsync(VIDEO_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(VIDEO_DIR, { intermediates: true });
    }
    const fileName = `video_${videoId}.mp4`;
    const destUri = `${VIDEO_DIR}${fileName}`;

    // If the file already exists, delete the old file
    try {
      const fileInfo = await FileSystem.getInfoAsync(destUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(destUri);
      }
    } catch (err) {
      console.warn('Eski dosya silme uyarısı:', err);
    }

    // Copy video
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destUri,
    });

    // Check that the file was actually copied
    const copiedFileInfo = await FileSystem.getInfoAsync(destUri);
    if (!copiedFileInfo.exists) {
      throw new Error('Video dosyası başarıyla kopyalanmadı');
    }

    console.log('Video başarıyla kopyalandı:', destUri);
    return destUri;
  } catch (error) {
    console.error('Video kopyalama hatası:', error);
    throw new Error('Video kaydedilemedi: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
  }
};


const validateVideoExists = async (path: string): Promise<boolean> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(path);
    return fileInfo.exists;
  } catch (error) {
    console.error('Dosya kontrol hatası:', error);
    return false;
  }
};

export const useVideoStore = create<VideoStore>((set, get) => ({
  videos: [],
  isLoading: false,
  error: null,

  loadVideos: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        let parsedVideos = JSON.parse(data);
        
        if (Array.isArray(parsedVideos)) {
        
          const validatedVideos: CroppedVideo[] = [];
          
          for (const video of parsedVideos) {
            const fileExists = await validateVideoExists(video.croppedPath);
            if (fileExists) {
              validatedVideos.push(video);
            } else {
              console.warn(`Video dosyası bulunamadı: ${video.id} - ${video.croppedPath}`);
            }
          }
          
          if (validatedVideos.length !== parsedVideos.length) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validatedVideos));
          }
          
          set({ videos: validatedVideos, isLoading: false });
        } else {
          set({ videos: [], isLoading: false });
        }
      } else {
        set({ videos: [], isLoading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Video yükleme hatası';
      set({ error: errorMessage, isLoading: false });
      console.error('Video yükleme hatası:', error);
    }
  },

  addVideo: async (video: CroppedVideo) => {
    try {
      // Copy video to permanent folder
      const permanentPath = await copyVideoToStorage(video.croppedPath, video.id);

      const persistedVideo: CroppedVideo = {
        ...video,
        croppedPath: permanentPath,
      };

      const updatedVideos = [...get().videos, persistedVideo];
      set({ videos: updatedVideos, error: null });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVideos));
      
      console.log('Video başarıyla eklendi:', persistedVideo.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Video ekleme hatası';
      set({ error: errorMessage });
      console.error('Video ekleme hatası:', error);
      throw error;
    }
  },

  // Delete file
  deleteVideo: async (id: string) => {
    try {
      const video = get().videos.find(v => v.id === id);
 
      if (video) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(video.croppedPath);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(video.croppedPath);
            console.log('Video dosyası silindi:', video.croppedPath);
          }
        } catch (err) {
          console.warn('Dosya silme hatası:', err);
        }
      }

      const updatedVideos = get().videos.filter(video => video.id !== id);
      set({ videos: updatedVideos, error: null });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVideos));
      
      console.log('Video kaydından silindi:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Video silme hatası';
      set({ error: errorMessage });
      console.error('Video silme hatası:', error);
      throw error;
    }
  },

  updateVideo: async (id: string, updates: Partial<CroppedVideo>) => {
    try {
      const updatedVideos = get().videos.map(video =>
        video.id === id ? { ...video, ...updates } : video
      );
      set({ videos: updatedVideos, error: null });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVideos));
      
      console.log('Video güncellendi:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Video güncelleme hatası';
      set({ error: errorMessage });
      console.error('Video güncelleme hatası:', error);
      throw error;
    }
  },
}));