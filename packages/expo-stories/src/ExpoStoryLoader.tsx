import { lightTheme, spacing } from '@expo/styleguide-native';
import * as React from 'react';
import { View, SafeAreaView, StyleSheet, ScrollView, Text } from 'react-native';

// this is resolved via customization (extraNodeModules) in metro-config / webpack-config
const stories = require('generated-expo-stories');

function ExpoStoryLoader({ selectedStoryId, displayStoryTitle = false }) {
  const selectedStories = [];

  if (selectedStoryId !== '') {
    Object.keys(stories).forEach(key => {
      if (key.startsWith(selectedStoryId)) {
        // @ts-ignore
        selectedStories.push(stories[key]);
      }
    });
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <SafeAreaView style={styles.flexContainer}>
        <ScrollView style={styles.flexContainer}>
          {Object.entries(selectedStories).map(([key, story]: [string, any]) => {
            return (
              <View key={`${key}`} style={styles.storyRow}>
                {displayStoryTitle && <Text style={styles.storyTitle}>{story?.name || ''}</Text>}
                {React.createElement(story)}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: lightTheme.background.default,
    padding: spacing[2],
  },
  storyRow: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderColor: lightTheme.border.default,
  },
  storyTitle: {
    marginBottom: spacing[2],
    fontSize: 20,
    fontWeight: '500',
  },
});

export { ExpoStoryLoader };
