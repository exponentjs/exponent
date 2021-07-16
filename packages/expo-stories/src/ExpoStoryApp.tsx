import { lightTheme, shadows, spacing } from '@expo/styleguide-native';
import * as React from 'react';
import {
  View,
  SafeAreaView,
  Pressable,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { ExpoStoryLoader } from './ExpoStoryLoader';
import { Stack, StackContainer } from './async-stack';

export default function App() {
  return (
    <StackContainer>
      <ExpoStoryApp />
    </StackContainer>
  );
}

function ExpoStoryApp() {
  const [stories, setStories] = React.useState([]);

  const [loading, setLoading] = React.useState(false);
  const [lastFetchedAt, setLastFetchedAt] = React.useState(new Date().toISOString());

  React.useEffect(() => {
    setLoading(true);

    fetch(`http://localhost:7001/stories`)
      .then(res => res.json())
      .then(json => {
        setLoading(false);
        setStories(json.data);
      })
      .catch(error => {
        setLoading(false);
        console.log('Server not running?');
        console.log({ error });
      });
  }, [lastFetchedAt]);

  return (
    <SafeAreaView style={styles.flexContainer}>
      <View style={styles.flexContainer}>
        <Text style={styles.storyTitle}>Expo Story Loader</Text>

        <ScrollView style={styles.storyButtonsContainer}>
          {stories.map((story: any) => {
            return (
              <StoryButton
                key={story.id}
                title={story.title}
                onPress={() => {
                  Stack.push({
                    element: <StoriesScreen story={story} />,
                    headerProps: { title: story.title },
                  });
                }}
              />
            );
          })}
        </ScrollView>

        {/* <View style={styles.refreshButton}>
          <StoryButton
            title="Refresh"
            color={lightTheme.button.tertiary.background}
            onPress={() => setLastFetchedAt(new Date().toISOString())}
          />

          <ActivityIndicator
            style={styles.refreshLoader}
            color={lightTheme.button.tertiary.foreground}
            animating={loading}
          />
        </View> */}

        <View style={styles.loadingContainer} pointerEvents="none">
          <ActivityIndicator animating={loading} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function StoriesScreen({ story }) {
  return (
    <SafeAreaView style={styles.flexContainer}>
      <ScrollView style={styles.flexContainer}>
        <View style={styles.storyButtonsContainer}>
          {story.stories.map(story => {
            return (
              <StoryButton
                key={story.id}
                title={story.name}
                onPress={() => {
                  Stack.push({
                    element: <ExpoStoryLoader selectedStoryId={story.id} />,
                    headerProps: { title: story.name },
                  });
                }}
              />
            );
          })}

          {story.stories.length > 1 && (
            <StoryButton
              title="See All"
              color={lightTheme.button.tertiary.background}
              onPress={() => {
                Stack.push({
                  element: <ExpoStoryLoader selectedStoryId={story.id} displayStoryTitle />,
                  headerProps: { title: `${story.title} Stories` },
                });
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StoryButton({ title, color = lightTheme.button.primary.background, onPress }) {
  return (
    // @ts-ignore
    <Pressable style={[styles.storyButton, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.storyButtonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: lightTheme.background.default,
    padding: spacing[3],
  },
  storyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  storyButtonsContainer: {
    padding: spacing[4],
    backgroundColor: lightTheme.background.default,
  },
  storyButton: {
    borderRadius: 4,
    paddingVertical: spacing[4],
    marginVertical: spacing[2],
    backgroundColor: lightTheme.button.primary.background,
    ...shadows.button,
  },
  storyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: lightTheme.button.primary.foreground,
    textAlign: 'center',
  },
  refreshButton: {
    position: 'absolute',
    padding: spacing[3],
    bottom: spacing[6],
    left: 0,
    right: 0,
  },
  refreshLoader: {
    position: 'absolute',
    right: spacing[4],
    bottom: 0,
    top: 0,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
