// components/EmptyVideos.tsx
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

type EmptyView = {
  onAddVideo: () => void;
}

const EmptyView = ({ onAddVideo }: EmptyView) => {
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center">
          {/* Icon */}
          <View className="p-6 mb-6 bg-blue-600 rounded-3xl shadow-2xl">
            <Ionicons name="videocam-outline" size={64} color="white" />
          </View>

          {/* Title */}
          <Text className="mb-2 text-2xl font-bold text-white">
            Henüz video yok
          </Text>

          {/* Description */}
          <Text className="mb-8 max-w-sm leading-6 text-center text-gray-400">
            İlk video günlüğünüzü oluşturmak için aşağıdaki butona tıklayın ve anılarınızı kaydedin.
          </Text>

          {/* Add Button */}
          <TouchableOpacity 
            onPress={onAddVideo} 
            className="flex-row gap-2 items-center px-8 py-4 bg-blue-600 rounded-xl shadow-lg active:bg-blue-700"
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text className="text-lg font-bold text-white">Video Ekle</Text>
          </TouchableOpacity>

          {/* Helper Text */}
          <Text className="mt-6 text-sm text-center text-gray-500">
            Galerinizden video seçebilir veya yeni video kaydedebilirsiniz
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default EmptyView