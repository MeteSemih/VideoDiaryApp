import { TouchableOpacity, View, Text, Dimensions, Pressable } from 'react-native'
import { Video } from 'expo-av';
import { CroppedVideo } from '@/types/CroppedVideo';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const { width: screenWidth } = Dimensions.get('window');

type VideoItemProps = {
  item: CroppedVideo;
  onPress: (id: string) => void;
  onDelete?: (id: string) => void;
}

const VideoItem = ({ item, onPress }: VideoItemProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const CARD_WIDTH = screenWidth * 0.44; 
  const CARD_HEIGHT = 220;

  const handleVideoError = (error: any) => {
    console.error('Video yükleme hatası:', item.id, error);
    setVideoError(true);
  };

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      className={`bg-gray-300 rounded-2xl shadow-md overflow-hidden ${
        isPressed ? 'scale-95' : 'scale-100'
      }`}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginBottom: 16,
      }}
    >
      {/* VIDEO */}
      <View className="w-full bg-black" style={{ height: 140 }}>
        {!videoError ? (
          <>
            <Video
              source={{ uri: item.croppedPath }}
              rate={1.0}
              isMuted={true}
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
              onError={handleVideoError}
            />

            {/* Play Icon */}
            <View className="absolute inset-0 items-center justify-center">
              <View className="p-2 rounded-full bg-black/40">
                <Ionicons name="play" size={22} color="white" />
              </View>
            </View>
          </>
        ) : (
          // Error fallback - Video yüklenemediğinde 
          <View className="items-center justify-center flex-1 bg-gray-800">
            <Ionicons name="alert-circle" size={32} color="#ef4444" />
            <Text className="px-2 mt-2 text-xs text-center text-red-400">
              Video yüklenemedi
            </Text>
          </View>
        )}
      </View>

      {/* DETAILS */}
      <View className="justify-between flex-1 p-3 rounded-s">
        {/* Title */}
        <Text
          className="text-3xl font-bold text-white size-14" 
          numberOfLines={1}
        >
          {item.name}
        </Text>

        {/* Date + Time */}
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={18} color="#f8fafd" />
            <Text className="ml-1 font-bold text-blue-400 text-m">
              {new Date(item.createdAt).toLocaleDateString('tr-TR')}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text className="ml-1 text-lg text-gray-500">
              {new Date(item.createdAt).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default VideoItem;