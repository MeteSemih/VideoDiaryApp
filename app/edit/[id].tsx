import { useVideoStore } from '@/store/videoStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { videoMetadataSchema } from '../lib/validation';
import Animated, { FadeInDown, FadeOutUp, SlideInRight } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function EditVideoScreen() {
  // Get video ID from URL parameters and initialize state
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const videos = useVideoStore((state) => state.videos);
  const updateVideo = useVideoStore((state) => state.updateVideo);

  // Find the video to edit
  const video = videos.find((v) => v.id === id);

  // Form state management
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(true); // Track if changes are saved
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  // Initialize form with video data when component loads
  useEffect(() => {
    if (video) {
      setName(video.name);
      setDescription(video.description || '');
      setIsSaved(true);
    }
  }, [video]);

  // Handle name input changes and track save state
  const handleNameChange = (text: string) => {
    setName(text);
    setIsSaved(text === video?.name && description === (video?.description || ''));
  };

  // Handle description input changes and track save state
  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    setIsSaved(name === video?.name && text === (video?.description || ''));
  };

  // Video not found state - show error message
  if (!video) {
    return (
      <GestureHandlerRootView className="flex-1">
        <View className="flex-1 bg-gray-900">
          <Animated.View
            entering={FadeInDown.duration(500)}
            className="items-center justify-center flex-1 px-6"
          >
            <View className="items-center">
              <Animated.View
                entering={FadeInDown.duration(500).delay(100)}
                className="p-4 mb-4 bg-gray-800 rounded-full"
              >
                <Ionicons name="close-circle-outline" size={48} color="#ef4444" />
              </Animated.View>
              <Animated.View entering={FadeInDown.duration(500).delay(200)}>
                <Text className="mb-2 text-xl font-semibold text-white">Video Not Found</Text>
                <Text className="mb-6 text-center text-gray-400">
                  The video you want to edit is not available
                </Text>
              </Animated.View>
              <AnimatedTouchableOpacity
                entering={FadeInDown.duration(500).delay(300)}
                onPress={() => router.back()}
                className="px-8 py-3 bg-blue-600 rounded-xl"
              >
                <Text className="font-semibold text-white">Go Back</Text>
              </AnimatedTouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    );
  }

  // Validate form inputs using Zod schema
  const validateForm = () => {
    const validation = videoMetadataSchema.safeParse({
      name,
      description,
    });

    if (!validation.success) {
    
      const errorMap: { name?: string; description?: string } = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field === 'name' || field === 'description') {
          errorMap[field] = issue.message;
        }
      });
      setErrors(errorMap);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await updateVideo(video.id, {
        name: name.trim(),
        description: description.trim(),
      });

      setIsSaved(true);
      Alert.alert('Success', 'Video updated successfully', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while updating the video';
      Alert.alert('Error', errorMessage);
      console.error('Video update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel action with confirmation for unsaved changes
  const handleCancel = () => {
    if (!isSaved) {
      Alert.alert(
        'Cancel Changes',
        'Are you sure you want to discard your changes?',
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes, Discard',
            style: 'destructive',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  // Format date for display
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

  // Calculate video duration from start and end times
  const calculateDuration = (startTime: number, endTime: number) => {
    const duration = endTime - startTime;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-gray-900">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header with title and close button */}
          <Animated.View
            entering={FadeInDown.duration(500)}
            className="flex-row items-center justify-between px-6 py-4 mt-10 border-b border-gray-800"
          >
            <Text className="text-2xl font-bold text-white">Edit Video</Text>
            <View className="flex-row gap-3">
              <AnimatedTouchableOpacity
                entering={SlideInRight.duration(500)}
                onPress={handleCancel}
                disabled={isLoading}
                className="p-2 bg-gray-800 rounded-full active:bg-gray-700"
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </AnimatedTouchableOpacity>
            </View>
          </Animated.View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <AnimatedView className="px-6 py-6" entering={FadeInDown.duration(500).delay(100)}>
              {/* Information card explaining the edit functionality */}
              <Animated.View
                entering={FadeInDown.duration(500).delay(150)}
                className="p-4 mb-6 bg-gray-800 border border-gray-700 rounded-2xl"
              >
                <View className="flex-row items-start gap-3">
                  <Ionicons name="information-circle" size={20} color="#3b82f6" />
                  <View className="flex-1">
                    <Text className="mb-1 text-sm font-semibold text-white">Video Information</Text>
                    <Text className="text-xs leading-5 text-gray-400">
                      You can edit the video name and description below.
                    </Text>
                  </View>
                </View>
              </Animated.View>

              {/* Video metadata display - read-only information */}
              <Animated.View
                entering={FadeInDown.duration(500).delay(200)}
                className="flex-row gap-3 mb-6"
              >
                <View className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                  <Text className="mb-1 text-xs text-gray-400">Creation Date</Text>
                  <Text className="text-sm font-semibold text-white">{formatDate(video.createdAt)}</Text>
                </View>
                <View className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                  <Text className="mb-1 text-xs text-gray-400">Video Duration</Text>
                  <Text className="text-sm font-semibold text-white">
                    {calculateDuration(video.startTime, video.endTime)}
                  </Text>
                </View>
              </Animated.View>

              {/* Video Name Input Field */}
              <Animated.View
                entering={FadeInDown.duration(500).delay(250)}
                className="mb-6"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-semibold text-gray-300">Video Name</Text>
                    <Text className="text-xs text-red-500">*</Text>
                  </View>
                  <Text className="text-xs text-gray-500">
                    {name.length}/50
                  </Text>
                </View>
                <TextInput
                  placeholder="Enter video name..."
                  value={name}
                  onChangeText={handleNameChange}
                  maxLength={50}
                  editable={!isLoading}
                  className={`p-4 rounded-xl text-white border ${
                    errors.name ? 'bg-red-950 border-red-700' : 'bg-gray-800 border-gray-700'
                  }`}
                  placeholderTextColor="#6b7280"
                  style={{ fontSize: 16 }}
                />
                {/* Error message display for name field */}
                {errors.name && (
                  <Animated.View
                    entering={FadeInDown.duration(300)}
                    className="flex-row items-center gap-2 mt-2"
                  >
                    <Ionicons name="alert-circle" size={16} color="#ef4444" />
                    <Text className="text-xs text-red-400">{errors.name}</Text>
                  </Animated.View>
                )}
              </Animated.View>

              {/* Description Input Field */}
              <Animated.View
                entering={FadeInDown.duration(500).delay(300)}
                className="mb-6"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm font-semibold text-gray-300">Description</Text>
                  <Text className="text-xs text-gray-500">
                    {description.length}/200
                  </Text>
                </View>
                <TextInput
                  placeholder="Enter video description (optional)..."
                  value={description}
                  onChangeText={handleDescriptionChange}
                  maxLength={200}
                  editable={!isLoading}
                  multiline
                  numberOfLines={5}
                  className={`p-4 rounded-xl text-white border ${
                    errors.description
                      ? 'bg-red-950 border-red-700'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                  placeholderTextColor="#6b7280"
                  style={{ fontSize: 16, textAlignVertical: 'top' }}
                />
                {/* Error message display for description field */}
                {errors.description && (
                  <Animated.View
                    entering={FadeInDown.duration(300)}
                    className="flex-row items-center gap-2 mt-2"
                  >
                    <Ionicons name="alert-circle" size={16} color="#ef4444" />
                    <Text className="text-xs text-red-400">{errors.description}</Text>
                  </Animated.View>
                )}
              </Animated.View>

              {/* Warning banner for unsaved changes */}
              {!isSaved && (
                <Animated.View
                  entering={FadeInDown.duration(400)}
                  exiting={FadeOutUp.duration(300)}
                  className="p-3 mb-6 border border-blue-700 rounded-lg bg-blue-950"
                >
                  <View className="flex-row items-start gap-2">
                    <Ionicons name="warning" size={16} color="#3b82f6" />
                    <Text className="flex-1 text-xs text-blue-300">
                      You have unsaved changes. Please select "Save" or "Cancel" to proceed.
                    </Text>
                  </View>
                </Animated.View>
              )}

              {/* Action Buttons - Save and Cancel */}
              <Animated.View
                entering={FadeInDown.duration(500).delay(400)}
                className="gap-3"
              >
                {/* Save Button - disabled when loading or no changes */}
                <AnimatedTouchableOpacity
                  onPress={handleSave}
                  disabled={isLoading || isSaved}
                  className={`flex-row items-center justify-center gap-2 p-4 rounded-xl ${
                    isLoading || isSaved
                      ? 'bg-gray-700'
                      : 'bg-green-600 active:bg-green-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text className="text-base font-bold text-white">Saving...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-done"
                        size={24}
                        color="#ffffff"
                      />
                      <Text className="text-base font-bold text-white">
                        {isSaved ? 'Saved' : 'Save Changes'}
                      </Text>
                    </>
                  )}
                </AnimatedTouchableOpacity>

                {/* Cancel Button */}
                <AnimatedTouchableOpacity
                  onPress={handleCancel}
                  disabled={isLoading}
                  className="flex-row items-center justify-center gap-2 p-4 bg-gray-800 border border-gray-700 rounded-xl active:bg-gray-700"
                >
                  <Ionicons name="close-outline" size={24} color="#ffffff" />
                  <Text className="text-base font-bold text-white">Cancel</Text>
                </AnimatedTouchableOpacity>
              </Animated.View>
            </AnimatedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </GestureHandlerRootView>
  );
}