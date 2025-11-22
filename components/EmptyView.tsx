import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

type EmptyView = {
  onAddVideo: () => void;
}

const EmptyView = ({ onAddVideo }: EmptyView) => {
  return (
<SafeAreaView className="flex-1 bg-gray-900">
  <View className="items-center justify-center flex-1 px-6">
    
    <View className="mb-8 shadow-xl p-7 rounded-3xl bg-blue-600/90">
      <Ionicons name="videocam-outline" size={72} color="white" />
    </View>

    <Text className="mb-3 text-3xl font-extrabold text-white">
      No Videos Yet
    </Text>

    <Text className="max-w-xs mb-10 leading-6 text-center text-gray-400">
      Start your journey by creating your first video diary. 
      Tap the button below and begin capturing your moments.
    </Text>

    <TouchableOpacity
      onPress={onAddVideo}
      className="flex-row items-center gap-3 px-10 py-4 bg-blue-600 shadow-2xl rounded-xl active:bg-blue-700"
      style={{ elevation: 6 }}
    >
      <Ionicons name="add-circle" size={26} color="white" />
      <Text className="w-24 text-lg font-bold text-white">Add Video</Text>
    </TouchableOpacity>

    <Text className="mt-8 text-sm text-center text-gray-500">
      Choose a video from your gallery or record a new one
    </Text>
  </View>
</SafeAreaView>


  )
}

export default EmptyView