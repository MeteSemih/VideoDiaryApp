// app/(tabs)/index.tsx veya app/index.tsx
import EmptyView from '@/components/EmptyView';
import VideoItem from '@/components/VideoItem';
import { useVideoStore } from '@/store/videoStore';
import { CroppedVideo } from '@/types/CroppedVideo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, Layout } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

const Main = () => {
  // State management for videos and search
  const videos = useVideoStore((state) => state.videos);
  const isLoading = useVideoStore((state) => state.isLoading);
  const loadVideos = useVideoStore((state) => state.loadVideos);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Navigation handlers
  const handleAddVideo = () => {
    router.push('/modal')
  }

  const handleVideoPress = (videoId: string) => {
    router.push(`/details/${videoId}`)
  }

  // Loading state - show spinner while videos are being fetched
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="items-center justify-center flex-1">
          <View className="items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="mt-4 text-lg font-medium text-gray-300">Loading your videos...</Text>
            <Text className="mt-2 text-sm text-gray-500">Please wait while we prepare your content</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Empty state - show empty view when no videos exist
  if (!videos || videos.length === 0) {
    return <EmptyView onAddVideo={handleAddVideo} />
  }

  // ✅ Filter videos based on search query
  const filteredVideos = videos.filter(video =>
    video.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render individual video item with animations
  const renderVideoItem = ({ item, index }: { item: CroppedVideo; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400)}
      exiting={FadeOutUp}
      layout={Layout.springify()}
    >
      <VideoItem item={item} onPress={handleVideoPress} />
    </Animated.View>
  )

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1">
          {/* Header Section with title and add button */}
          <Animated.View
            entering={FadeInDown.duration(500)}
            className="px-6 pt-4 pb-6 bg-gray-900"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="mb-1 text-3xl font-bold text-white">Video Diary</Text>
                <Text className="text-sm text-gray-400">
                  {videos.length} {videos.length === 1 ? 'video' : 'videos'} in your collection
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  Manage, edit, and organize your video clips
                </Text>
              </View>
              {/* Add Video Button */}
              <AnimatedPressable
                onPress={handleAddVideo}
                entering={FadeInDown.duration(500).delay(100)}
                className="p-3 ml-4 bg-blue-600 rounded-full shadow-lg active:bg-blue-700"
              >
                <Ionicons name="add" size={24} color="white" />
              </AnimatedPressable>
            </View>

            <Animated.View
              className="relative"
              entering={FadeInDown.duration(500).delay(200)}
            >
              <View className="absolute z-10 top-3 left-4">
                <Ionicons name="search" size={20} color="#9ca3af" />
              </View>
              <TextInput
                placeholder="Search videos by name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="w-full py-3 pl-12 pr-4 text-white bg-gray-800 border border-gray-700 rounded-xl"
                placeholderTextColor="#9ca3af"
                style={{ fontSize: 16 }}
              />
              {/* Clear search button (only visible when there's text) */}
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery('')}
                  className="absolute top-3 right-4"
                >
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </Pressable>
              )}
            </Animated.View>
          </Animated.View>

          {/* Search Results Info - shows count when searching */}
          {filteredVideos.length > 0 && searchQuery && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              className="px-6 py-3 bg-gray-900 border-b border-gray-800"
            >
              <Text className="text-sm text-gray-400">
                Found {filteredVideos.length} {filteredVideos.length === 1 ? 'result' : 'results'} for "{searchQuery}"
              </Text>
            </Animated.View>
          )}

          {/* No Search Results State */}
          {filteredVideos.length === 0 && searchQuery ? (
            <Animated.View
              entering={FadeInDown.duration(400)}
              className="items-center justify-center flex-1 px-6"
            >
              <View className="items-center">
                <View className="p-4 mb-4 bg-gray-800 rounded-full">
                  <Ionicons name="search-outline" size={48} color="#6b7280" />
                </View>
                <Text className="mb-2 text-xl font-semibold text-gray-300">No videos found</Text>
                <Text className="mb-4 text-center text-gray-500">
                  No results found for "{searchQuery}"
                </Text>
                <Text className="text-sm text-center text-gray-600">
                  Try different keywords or check your spelling
                </Text>
              </View>
            </Animated.View>
          ) : (
            // Main Content Area - either shows video grid or empty state
            <Animated.View
              className="flex-1"
              entering={FadeInDown.duration(500)}
              layout={Layout.springify()}
            >
              {/* Empty collection state (no search) */}
              {filteredVideos.length === 0 && !searchQuery ? (
                <Animated.View
                  entering={FadeInDown.duration(400)}
                  className="items-center justify-center flex-1 px-6"
                >
                  <View className="items-center">
                    <View className="p-4 mb-4 bg-gray-800 rounded-full">
                      <Ionicons name="videocam-off" size={48} color="#6b7280" />
                    </View>
                    <Text className="mb-2 text-xl font-semibold text-gray-300">No videos available</Text>
                    <Text className="text-center text-gray-500">
                      Your videos will appear here once added
                    </Text>
                  </View>
                </Animated.View>
              ) : (
                // Video Grid - displays videos in 2-column layout
                <FlatList
                  data={filteredVideos}
                  renderItem={renderVideoItem}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  columnWrapperStyle={filteredVideos.length > 0 ? {
                    gap: 12,
                    paddingHorizontal: 12,
                    marginTop: 8,
                  } : undefined}
                  contentContainerStyle={{
                    paddingBottom: 24,
                    paddingTop: 8,
                  }}
                  showsVerticalScrollIndicator={false}
                  // Footer with video count and call-to-action
                  ListFooterComponent={
                    filteredVideos.length > 0 ? (
                      <View className="py-6">
                        <Text className="text-xs text-center text-gray-500">
                          {filteredVideos.length} of {videos.length} videos displayed
                        </Text>
                        <Text className="mt-1 text-xs text-center text-gray-600">
                          Tap + to add more videos to your collection
                        </Text>
                      </View>
                    ) : null
                  }
                />
              )}
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

export default Main