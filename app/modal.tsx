import { Alert, Pressable, TextInput, View as RNView, View, Text } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useVideoStore } from '@/store/videoStore';
import { CroppedVideo } from '@/types/CroppedVideo';
import { Video } from 'expo-av';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { videoMetadataSchema } from './lib/validation';
import { useTrimmingMutation } from '@/hooks/useTrimmingMutation';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from "react-native";
const TRIM_DURATION = 5;

export default function ModalScreen() {
  const router = useRouter();
  const addVideo = useVideoStore((state) => state.addVideo);
  const trimMutation = useTrimmingMutation();

  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [croppedUri, setCroppedUri] = useState<string | null>(null);
  const [trimming, setTrimming] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(TRIM_DURATION);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll access is needed');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setVideoUri(uri);
      setStep(2);
    }
  };

  const handleVideoLoad = (event: any) => {
    const duration = event.durationMillis / 1000;
    setVideoDuration(duration);
    setEndTime(Math.min(TRIM_DURATION, duration));
  };

  const handleStartTimeChange = (value: number) => {
    const maxStart = Math.max(0, videoDuration - TRIM_DURATION);
    const newStart = Math.min(value, maxStart);
    const newEnd = newStart + TRIM_DURATION;
    
    setStartTime(newStart);
    setEndTime(newEnd);
  };

  const handleTrimVideo = () => {
    if (!videoUri) {
      Alert.alert('Error', 'No video selected');
      return;
    }

    setTrimming(true);
    trimMutation.mutate(
      { uri: videoUri, start: startTime, end: endTime },
      {
        onSuccess: (result) => {
          setCroppedUri(result);
          setStep(3);
          setTrimming(false);
        },
        onError: (error) => {
          setTrimming(false);
          console.error('Trim error:', error);
          Alert.alert('Error', error instanceof Error ? error.message : 'Trimming failed');
        },
      }
    );
  };

  const cropAndSaveVideo = async () => {
    const validation = videoMetadataSchema.safeParse({ name, description });
    
    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map(issue => issue.message)
        .join('\n');
      return Alert.alert('Validation Error', errorMessages);
    }

    if (!videoUri) {
      return Alert.alert('Error', 'Video is missing');
    }

    try {
      const newVideo: CroppedVideo = {
        id: Date.now().toString(),
        name: validation.data.name,
        description: validation.data.description || '',
        originalPath: videoUri,
        croppedPath: croppedUri || videoUri, // Trimmed video varsa onu kullan
        startTime: Math.floor(startTime),
        endTime: Math.floor(endTime),
        createdAt: new Date().toISOString(),
      };

      // Eğer trimmed video varsa ve temporary ise, kontrol et
      if (croppedUri) {
        const fileInfo = await FileSystem.getInfoAsync(croppedUri);
        if (!fileInfo.exists) {
          throw new Error('Trimmed video file not found');
        }
      }

      await addVideo(newVideo);
      
      Alert.alert('Success', 'Video added successfully', [
        {
          text: 'OK',
          onPress: () => {
            // Formu sıfırla
            setName('');
            setDescription('');
            setVideoUri(null);
            setCroppedUri(null);
            setStartTime(0);
            setEndTime(TRIM_DURATION);
            setVideoDuration(0);
            setStep(1);
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to add video'
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-900">

      

<View 
  className="items-center"
  style={{ marginTop: Platform.OS === "android" ? 32 : 12 }}
>
  <Text className="text-3xl font-extrabold text-white">
    <Text className="text-blue-400">Choose</Text> Video
  </Text>

  <View className="w-24 h-1 mt-2 bg-blue-500 rounded-full opacity-80" />
</View>


      {/* Step 1: Choose Video */}
      {step === 1 && !videoUri && (
        <View className="items-center justify-center flex-1 px-4">
          <Pressable
            onPress={pickVideo}
            className="items-center w-full max-w-xs p-8 bg-blue-600 rounded-3xl"
          >
           <AntDesign name="video-camera-add" size={64} color="white" />
            <Text className="mt-6 text-2xl font-bold text-center text-white">
              Select Video
            </Text>
            <Text className="mt-2 text-sm text-center text-blue-100">
              Choose a video to trim
            </Text>
          </Pressable>
        </View>
      )}

      {/* Step 2: Video Trim */}
      {step === 2 && videoUri && (
        <RNView className="flex-1 px-4 pt-6 pb-6">
          <Text className="mb-6 text-3xl font-bold text-white">Trim Video</Text>

          {/* Video Player with Overlay */}
          <View style={{ position: 'relative', marginBottom: 24 }}>
            <Video
              source={{ uri: videoUri }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              shouldPlay
              isLooping
              onLoad={handleVideoLoad}
              style={{ 
                width: '100%', 
                height: 280, 
                borderRadius: 20,
                backgroundColor: '#000',
              }}
            />

            {/* Overlay - Kesim alanını göster */}
            {videoDuration > 0 && (
              <View 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: 280,
                  borderRadius: 20,
                  pointerEvents: 'none',
                }}
              >
                {/* Sol taraf - kesim dışı (karartılı) */}
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${(startTime / videoDuration) * 100}%`,
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                  }}
                />

                {/* Sağ taraf - kesim dışı (karartılı) */}
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: `${((videoDuration - endTime) / videoDuration) * 100}%`,
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                  }}
                />

                {/* Başlangıç çizgisi */}
                <View
                  style={{
                    position: 'absolute',
                    left: `${(startTime / videoDuration) * 100}%`,
                    top: 0,
                    width: 4,
                    height: '100%',
                    backgroundColor: '#3b82f6',
                    shadowColor: '#3b82f6',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 4,
                  }}
                />

                {/* Bitiş çizgisi */}
                <View
                  style={{
                    position: 'absolute',
                    left: `${(endTime / videoDuration) * 100}%`,
                    top: 0,
                    width: 4,
                    height: '100%',
                    backgroundColor: '#3b82f6',
                    shadowColor: '#3b82f6',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 4,
                  }}
                />
              </View>
            )}
          </View>

          {/* Timeline Trim Control - Video Altında */}
          <View style={{ marginBottom: 32 }}>
            <View style={{ position: 'relative', height: 100 }}>
              {/* Timeline track */}
              <View
                style={{
                  position: 'absolute',
                  top: 32,
                  left: 0,
                  right: 0,
                  height: 12,
                  backgroundColor: '#374151',
                  borderRadius: 6,
                }}
              />
              
              {/* Selected range highlight - 5 saniye */}
              <View
                style={{
                  position: 'absolute',
                  top: 32,
                  left: `${(startTime / videoDuration) * 100}%`,
                  width: `${(TRIM_DURATION / videoDuration) * 100}%`,
                  height: 12,
                  backgroundColor: '#3b82f6',
                  borderRadius: 6,
                }}
              />

              {/* Handle - sürükleme noktası */}
              <View
                style={{
                  position: 'absolute',
                  left: `${(startTime / videoDuration) * 100}%`,
                  top: 8,
                  width: 50,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: -25,
                  zIndex: 10,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: '#3b82f6',
                    borderRadius: 8,
                    borderWidth: 3,
                    borderColor: '#fff',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 6,
                    elevation: 8,
                  }}
                />
              </View>

              {/* Slider - invisible */}
              <Slider
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 100,
                }}
                minimumValue={0}
                maximumValue={Math.max(0, videoDuration - TRIM_DURATION)}
                value={startTime}
                onValueChange={handleStartTimeChange}
                step={0.1}
              />
            </View>

            {/* Time Info */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              marginTop: 16,
              paddingHorizontal: 4,
              alignItems: 'center'
            }}>
              <View>
                <Text className="text-sm font-bold text-blue-400">
                  {Math.floor(startTime)}s
                </Text>
                <Text className="text-xs text-gray-400">Start</Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <Text className="text-2xl font-bold text-white">
                  {TRIM_DURATION}s
                </Text>
                <Text className="text-xs text-gray-400">Duration</Text>
              </View>
              
              <View style={{ alignItems: 'flex-end' }}>
                <Text className="text-sm font-bold text-blue-400">
                  {Math.floor(videoDuration)}s
                </Text>
                <Text className="text-xs text-gray-400">Total</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <Pressable
            onPress={handleTrimVideo}
            disabled={trimming || videoDuration === 0}
            className={`rounded-2xl py-4 mb-3 ${
              trimming || videoDuration === 0 ? 'bg-gray-700' : 'bg-blue-600'
            }`}
          >
            <Text className="text-lg font-bold text-center text-white">
              {trimming ? '⏳ Trimming...' : '✂️ Trim Video'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setVideoUri(null);
              setStep(1);
              setStartTime(0);
              setEndTime(TRIM_DURATION);
              setCroppedUri(null);
              setVideoDuration(0);
            }}
            className="py-3 bg-gray-800 rounded-2xl"
          >
            <Text className="font-bold text-center text-white">← Back</Text>
          </Pressable>
        </RNView>
      )}

      {/* Step 3: Metadata */}
      {step === 3 && croppedUri && (
        <RNView className="flex-1 px-4 pt-6 pb-6">
          <Text className="mb-6 text-3xl font-bold text-white">Video Details</Text>

          <Video
            source={{ uri: croppedUri }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            shouldPlay
            isLooping
            style={{ 
              width: '100%', 
              height: 200, 
              borderRadius: 16,
              backgroundColor: '#000',
              marginBottom: 20
            }}
          />

          <View className="p-3 mb-6 bg-blue-900 border border-blue-600 bg-opacity-40 rounded-xl">
            <Text className="text-xs font-semibold text-blue-200">
              ✓ Trimmed: {Math.floor(startTime)}s - {Math.floor(endTime)}s ({Math.floor(endTime - startTime)}s)
            </Text>
          </View>

          <TextInput
            placeholder="Video Name *"
            value={name}
            onChangeText={setName}
            className="px-4 py-3 mb-4 text-white bg-gray-800 border border-gray-700 rounded-xl"
            placeholderTextColor="#666"
          />

          <TextInput
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            className="px-4 py-3 mb-6 text-white bg-gray-800 border border-gray-700 h-28 rounded-xl"
            multiline
            numberOfLines={4}
            placeholderTextColor="#666"
            textAlignVertical="top"
          />

          <Pressable
            onPress={cropAndSaveVideo}
            className="py-4 mb-3 bg-green-600 rounded-2xl"
          >
            <Text className="text-lg font-bold text-center text-white">
              ✓ Save Video
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setCroppedUri(null);
              setStep(2);
            }}
            className="py-3 bg-gray-800 rounded-2xl"
          >
            <Text className="font-bold text-center text-white">← Back</Text>
          </Pressable>
        </RNView>
      )}
    </View>
  );
}