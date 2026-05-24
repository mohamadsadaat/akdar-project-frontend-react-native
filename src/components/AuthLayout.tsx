import React from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

interface AuthLayoutProps {
  children: React.ReactNode;
}

// Ensure the image exists in assets or use a web URL as placeholder. We'll use a solid color for the background overlay for now if image isn't available, but we will add the Image with the placeholder URL from the design.
const BACKGROUND_IMAGE_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAukq6AR4XovAvpjs6NrhnVzQpDorMzvI29RmvtNAGnK0eMqnBudHlKav_6wzqlF-vAF1yzKkziT3YVy_5K4YX7fdQGidc5-E3ZFfron0QaTIuhUKrBvidIv0CL7lACz0jbQ4IocW9Yx_mv3ER3Rsb6-Y2N2EvvZx9lsHPTOd8YZgM6fmbUX5oIMKRSvXWh6nQMJz6U7UQG7ynhB_wfGudekf__DHTcJQU_uW7jLKHpN6sZKcM9tSRhYyMMLMQt8uIrJG658Ka5nac6';

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.backgroundContainer}>
        <Image 
          source={{ uri: BACKGROUND_IMAGE_URL }} 
          style={styles.backgroundImage} 
          resizeMode="cover" 
        />
        <View style={styles.overlay} />
      </View>
      
      {/* Decorative blurred circles */}
      <View style={[styles.blurCircle, styles.topRightCircle]} />
      <View style={[styles.blurCircle, styles.bottomLeftCircle]} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardContainer}>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // Linear gradient simulation or solid fallback for React Native without expo-linear-gradient
    backgroundColor: 'rgba(0, 80, 60, 0.85)', // fallback to primary-ish with opacity
  },
  blurCircle: {
    position: 'absolute',
    borderRadius: 9999,
    zIndex: 0,
    opacity: 0.1, // Simulate blur by lowering opacity, or use standard View properties
    // Real blur requires specific packages, we'll use a soft background
  },
  topRightCircle: {
    top: '-10%',
    right: '-5%',
    width: 400,
    height: 400,
    backgroundColor: colors.secondaryContainer,
  },
  bottomLeftCircle: {
    bottom: '-10%',
    left: '-5%',
    width: 300,
    height: 300,
    backgroundColor: colors.primaryFixed,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 10,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: 'rgba(0,67,53,0.1)', // primary/10
    shadowColor: '#005c4a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
    marginTop: 48, // space for the floating icon
  },
});
