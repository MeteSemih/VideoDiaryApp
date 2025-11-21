import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate, Extrapolate } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useEffect } from 'react';

export const useModalSlideUp = (isVisible: boolean) => {
  const translateY = useSharedValue(500);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, {
        damping: 10,
        mass: 1,
        stiffness: 100,
        overshootClamping: false,
      });
    } else {
      translateY.value = withTiming(500, {
        duration: 300,
      });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
};

export const useFadeInOut = (isVisible: boolean, duration: number = 300) => {
  const opacity = useSharedValue(isVisible ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(isVisible ? 1 : 0, {
      duration,
    });
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
};

export const useScaleBounce = (isPressed: boolean) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isPressed) {
      scale.value = withSpring(0.95, {
        damping: 10,
        mass: 1,
        stiffness: 100,
      });
    } else {
      scale.value = withSpring(1, {
        damping: 10,
        mass: 1,
        stiffness: 100,
      });
    }
  }, [isPressed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
};

export const useSlideInFromLeft = (delay: number = 0) => {
  const translateX = useSharedValue(-400);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(0, {
      duration: 600,
    });
    opacity.value = withTiming(1, {
      duration: 600,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return animatedStyle;
};

export const useRotation = (isRotating: boolean) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isRotating) {
      rotation.value = withTiming(360, {
        duration: 1000,
      }, () => {
        rotation.value = 0;
        if (isRotating) {
          rotation.value = withTiming(360, {
            duration: 1000,
          });
        }
      });
    }
  }, [isRotating]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return animatedStyle;
};

export const useParallax = (scrollOffset: SharedValue<number>) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [0, 200],
          [0, 50],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  return animatedStyle;
};

/**
 * Shake Animasyonu
 * Hata durumunda sallantı
 */
export const useShake = (shouldShake: boolean) => {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (shouldShake) {
      translateX.value = withTiming(-10, { duration: 50 }, () => {
        translateX.value = withTiming(10, { duration: 50 }, () => {
          translateX.value = withTiming(-10, { duration: 50 }, () => {
            translateX.value = withTiming(0, { duration: 50 });
          });
        });
      });
    }
  }, [shouldShake]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return animatedStyle;
};