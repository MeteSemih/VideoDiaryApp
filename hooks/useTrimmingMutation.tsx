import { useMutation } from '@tanstack/react-query';
import * as TrimVideo from 'expo-trim-video';

interface TrimVideoParams {
  uri: string;
  start: number;
  end: number;
}


export const useTrimmingMutation = () => {
  return useMutation({
    mutationFn: async (params: TrimVideoParams): Promise<string> => {
      try {
        const result = await (TrimVideo as any).trimVideo({
          uri: params.uri,
          start: params.start,
          end: params.end,
        });
        return result?.uri ?? result;
      } catch (error) {
        throw new Error(
          `Failed to trim video: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    },

    retry: 1,
    retryDelay: 1000,
  });
};