import React from 'react';
import { AppRegistry, View, StyleSheet, Text } from 'react-native';

const app = () => (
  <View style={styles.container}>
    <Text testID="BundledAppMainScreen">BundledAppMainScreen</Text>
  </View>
);

AppRegistry.registerComponent('main', () => app);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    backgroundColor: '#4630eb',
    borderRadius: 4,
    padding: 12,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
