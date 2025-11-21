import { useVideoStore } from '@/store/videoStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function DetailsScreen() {
  // Get video ID from URL parameters and initialize store/state
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const videos = useVideoStore((state) => state.videos);
  const deleteVideo = useVideoStore((state) => state.deleteVideo);
  const videoRef = useRef<Video>(null);

  // Find the specific video to display
  const video = videos.find((v) => v.id === id);
  console.log(`id = ${id}`)
  
  // Video player state management
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Video not found state - show error message
  if (!video) {
    return (
      <GestureHandlerRootView className="flex-1">
        <SafeAreaView className="flex-1 bg-gray-900">
          <Animated.View
            entering={FadeInDown.duration(500)}
            className="items-center justify-center flex-1 px-6"
          >
            <View className="items-center">
              <View className="p-4 mb-4 bg-gray-800 rounded-full">
                <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
              </View>
              <Text className="mb-2 text-xl font-semibold text-white">
                Video Not Found
              </Text>
              <Text className="mb-6 text-center text-gray-400">
                This video is no longer available
              </Text>
              <AnimatedTouchableOpacity
                entering={FadeInDown.duration(500).delay(200)}
                onPress={() => router.back()}
                className="px-8 py-3 bg-blue-600 rounded-xl"
              >
                <Text className="font-semibold text-white">Go Back</Text>
              </AnimatedTouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  // Handle video deletion with confirmation dialog
  const handleDelete = () => {
    Alert.alert(
      'Delete Video',
      'This action cannot be undone. Are you sure you want to delete this video?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteVideo(video.id);
              Alert.alert('Success', 'Video deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => {
                    router.back();
                  },
                },
              ]);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting the video';
              Alert.alert('Error', errorMessage);
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Toggle video play/pause state
  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle fullscreen mode for video player
  const toggleFullscreen = async () => {
    if (videoRef.current) {
      if (isFullscreen) {
        await videoRef.current.dismissFullscreenPlayer();
      } else {
        await videoRef.current.presentFullscreenPlayer();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // Update playback state when video status changes
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
    }
  };

  // Format date for display in readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate duration from start and end times
  const calculateDuration = (startTime: number, endTime: number) => {
    const duration = endTime - startTime;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView className="flex-1 bg-gray-900">
        {/* Header with navigation and action buttons */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800"
        >
          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Video title */}
          <Text className="flex-wrap flex-1 ml-4 text-2xl font-bold text-white">{video.name}</Text>
          
          {/* Action buttons - Edit and Delete */}
          <View className="flex-row gap-3">
            <AnimatedTouchableOpacity
              entering={FadeInDown.duration(500).delay(100)}
              onPress={() => router.push(`/edit/${video.id}`)}
              className="p-2 bg-blue-600 rounded-full"
            >
              <Ionicons name="pencil" size={24} color="white" />
            </AnimatedTouchableOpacity>
            <AnimatedTouchableOpacity
              entering={FadeInDown.duration(500).delay(200)}
              onPress={handleDelete}
              disabled={isDeleting}
              className={`p-2 rounded-full ${isDeleting ? 'bg-gray-600' : 'bg-red-600'}`}
            >
              <Ionicons name="trash" size={24} color="white" />
            </AnimatedTouchableOpacity>
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Video Player Section */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            className="px-6 pt-6"
          >
            <View style={{ width: '100%', height: 300, borderRadius: 12, backgroundColor: '#000', overflow: 'hidden' }}>
              <Video
                ref={videoRef}
                source={{ uri: video.croppedPath || video.originalPath }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                shouldPlay={false}
                useNativeControls={false}
                style={{ width: '100%', height: '100%' }}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                resizeMode="contain"
              />
              
              {/* Custom Video Controls Overlay */}
              <View 
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {/* Play/Pause Button - Center of video */}
                <TouchableOpacity 
                  onPress={togglePlayPause}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}
                >
                  <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={32} 
                    color="white" 
                  />
                </TouchableOpacity>

                {/* Fullscreen Button - Bottom right corner */}
                <TouchableOpacity 
                  onPress={toggleFullscreen}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                  }}
                >
                  <Ionicons 
                    name={isFullscreen ? "contract" : "expand"} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Video Information Card */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200)}
            className="px-6 pt-6"
          >
            <View className="p-4 bg-gray-800 border border-gray-700 rounded-2xl">
              <View className="flex-row items-start gap-3 mb-4">
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <View className="flex-1">
                  <Text className="mb-1 text-sm font-semibold text-white">Video Information</Text>
                  <Text className="text-xs leading-5 text-gray-400">
                    View detailed information about this video.
                  </Text>
                </View>
              </View>

              {/* Stats Grid - Video metadata in 2x2 layout */}
              <View className="gap-3">
                <View className="flex-row gap-3">
                  {/* Creation Date */}
                  <View className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg">
                    <Text className="text-xs text-gray-400">Creation Date</Text>
                    <Text className="mt-1 text-sm font-semibold text-white">
                      {formatDate(video.createdAt)}
                    </Text>
                  </View>
                  {/* Video Duration */}
                  <View className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg">
                    <Text className="text-xs text-gray-400">Video Duration</Text>
                    <Text className="mt-1 text-sm font-semibold text-white">
                      {calculateDuration(video.startTime, video.endTime)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  {/* Start Time */}
                  <View className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg">
                    <Text className="text-xs text-gray-400">Start Time</Text>
                    <Text className="mt-1 text-sm font-semibold text-white">
                      {Math.floor(video.startTime)}s
                    </Text>
                  </View>
                  {/* End Time */}
                  <View className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg">
                    <Text className="text-xs text-gray-400">End Time</Text>
                    <Text className="mt-1 text-sm font-semibold text-white">
                      {Math.floor(video.endTime)}s
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Description Section */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            className="px-6 pt-6"
          >
            <Text className="mb-3 text-sm font-semibold text-gray-300">Description</Text>
            <View className="p-4 bg-gray-800 border border-gray-700 rounded-xl">
              <Text className="text-sm leading-6 text-gray-300">
                {video.description && video.description.length > 0
                  ? video.description
                  : 'No description added for this video'}
              </Text>
            </View>
          </Animated.View>

   
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}