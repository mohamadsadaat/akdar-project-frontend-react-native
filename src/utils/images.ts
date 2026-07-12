import { ImageSourcePropType } from 'react-native';

const fallbackAvatar = require('../../assets/images/icon.png');

export function avatarSource(url?: string | null): ImageSourcePropType {
  return url ? { uri: url } : fallbackAvatar;
}
