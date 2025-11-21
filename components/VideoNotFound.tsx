import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const VideoNotFound = () => {
  const router = useRouter();

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      className="flex-1 bg-gray-900"
    >
      <SafeAreaView className="flex-1">
        <View className="items-center justify-center flex-1 px-6">
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
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

export default VideoNotFound;
