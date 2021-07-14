import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
// import * as Progress from 'expo-progress';
import React from 'react';
import { Alert, ScrollView, Text, Platform } from 'react-native';

import HeadingText from '../components/HeadingText';
import ListButton from '../components/ListButton';
import SimpleActionDemo from '../components/SimpleActionDemo';

const { StorageAccessFramework } = FileSystem;

interface State {
  downloadProgress: number;
  permittedURI: string | null;
  createdFileURI: string | null;
}

// See: https://github.com/expo/expo/pull/10229#discussion_r490961694
// eslint-disable-next-line @typescript-eslint/ban-types
export default class FileSystemScreen extends React.Component<{}, State> {
  static navigationOptions = {
    title: 'FileSystem',
  };

  readonly state: State = {
    downloadProgress: 0,
    permittedURI: null,
    createdFileURI: null,
  };

  download?: FileSystem.DownloadResumable;

  _download = async () => {
    const url = 'http://ipv4.download.thinkbroadband.com/256KB.zip';
    await FileSystem.downloadAsync(url, FileSystem.documentDirectory + '256KB.zip');
    alert('Download complete!');
  };

  _startDownloading = async () => {
    const url = 'http://ipv4.download.thinkbroadband.com/5MB.zip';
    const fileUri = FileSystem.documentDirectory + '5MB.zip';
    const callback: FileSystem.DownloadProgressCallback = downloadProgress => {
      const progress =
        downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      this.setState({
        downloadProgress: progress,
      });
    };
    const options = { md5: true };
    this.download = FileSystem.createDownloadResumable(url, fileUri, options, callback);

    try {
      const result = await this.download.downloadAsync();
      if (result) {
        this._downloadComplete();
      }
    } catch (e) {
      console.log(e);
    }
  };

  _pause = async () => {
    if (!this.download) {
      alert('Initiate a download first!');
      return;
    }
    try {
      const downloadSnapshot = await this.download.pauseAsync();
      await AsyncStorage.setItem('pausedDownload', JSON.stringify(downloadSnapshot));
      alert('Download paused...');
    } catch (e) {
      console.log(e);
    }
  };

  _resume = async () => {
    try {
      if (this.download) {
        const result = await this.download.resumeAsync();
        if (result) {
          this._downloadComplete();
        }
      } else {
        this._fetchDownload();
      }
    } catch (e) {
      console.log(e);
    }
  };

  _cancel = async () => {
    if (!this.download) {
      alert('Initiate a download first!');
      return;
    }

    try {
      await this.download.cancelAsync();
      delete this.download;
      await AsyncStorage.removeItem('pausedDownload');
      this.setState({
        downloadProgress: 0,
      });
    } catch (e) {
      console.log(e);
    }
  };

  _downloadComplete = () => {
    if (this.state.downloadProgress !== 1) {
      this.setState({
        downloadProgress: 1,
      });
    }
    alert('Download complete!');
  };

  _fetchDownload = async () => {
    try {
      const downloadJson = await AsyncStorage.getItem('pausedDownload');
      if (downloadJson !== null) {
        const downloadFromStore = JSON.parse(downloadJson);
        const callback: FileSystem.DownloadProgressCallback = downloadProgress => {
          const progress =
            downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          this.setState({
            downloadProgress: progress,
          });
        };
        this.download = new FileSystem.DownloadResumable(
          downloadFromStore.url,
          downloadFromStore.fileUri,
          downloadFromStore.options,
          callback,
          downloadFromStore.resumeData
        );
        await this.download.resumeAsync();
        if (this.state.downloadProgress === 1) {
          alert('Download complete!');
        }
      } else {
        alert('Initiate a download first!');
        return;
      }
    } catch (e) {
      console.log(e);
    }
  };

  _getInfo = async () => {
    if (!this.download) {
      alert('Initiate a download first!');
      return;
    }
    try {
      const info = await FileSystem.getInfoAsync(this.download.fileUri);
      Alert.alert('File Info:', JSON.stringify(info), [{ text: 'OK', onPress: () => {} }]);
    } catch (e) {
      console.log(e);
    }
  };

  _readAsset = async () => {
    const asset = Asset.fromModule(require('../../assets/index.html'));
    await asset.downloadAsync();
    try {
      const result = await FileSystem.readAsStringAsync(asset.localUri!);
      Alert.alert('Result', result);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  _getInfoAsset = async () => {
    const asset = Asset.fromModule(require('../../assets/index.html'));
    await asset.downloadAsync();
    try {
      const result = await FileSystem.getInfoAsync(asset.localUri!);
      Alert.alert('Result', JSON.stringify(result, null, 2));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  _copyAndReadAsset = async () => {
    const asset = Asset.fromModule(require('../../assets/index.html'));
    await asset.downloadAsync();
    const tmpFile = FileSystem.cacheDirectory + 'test.html';
    try {
      await FileSystem.copyAsync({ from: asset.localUri!, to: tmpFile });
      const result = await FileSystem.readAsStringAsync(tmpFile);
      Alert.alert('Result', result);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  _alertFreeSpace = async () => {
    const freeBytes = await FileSystem.getFreeDiskStorageAsync();
    alert(`${Math.round(freeBytes / 1024 / 1024)} MB available`);
  };

  _askForDirPermissions = async () => {
    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (permissions.granted) {
      const uri = permissions.directoryUri;
      this.setState({
        permittedURI: uri,
      });
      alert(`You selected: ${uri}`);
    }
  };

  _readSAFDirAsync = async () => {
    return await StorageAccessFramework.readDirectoryAsync(this.state.permittedURI!);
  };

  _creatSAFFileAsync = async () => {
    const createdFile = await StorageAccessFramework.createFileAsync(
      // eslint-disable-next-line react/no-access-state-in-setstate
      this.state.permittedURI!,
      'test',
      'text/plain'
    );

    this.setState({
      createdFileURI: createdFile,
    });

    return createdFile;
  };

  _writeToSAFFileAsync = async () => {
    await StorageAccessFramework.writeAsStringAsync(
      this.state.createdFileURI!,
      'Expo is awesome 🚀🚀🚀'
    );

    return 'Done 👍';
  };

  _readSAFFileAsync = async () => {
    return await StorageAccessFramework.readAsStringAsync(this.state.createdFileURI!);
  };

  _deleteSAFFileAsync = async () => {
    await StorageAccessFramework.deleteAsync(this.state.createdFileURI!);

    this.setState({
      createdFileURI: null,
    });
  };

  _copySAFFileToInternalStorageAsync = async () => {
    const outputDir = FileSystem.cacheDirectory! + '/SAFTest';
    await StorageAccessFramework.copyAsync({
      from: this.state.createdFileURI!,
      to: outputDir,
    });

    return await FileSystem.readDirectoryAsync(outputDir);
  };

  _moveSAFFileToInternalStorageAsync = async () => {
    await StorageAccessFramework.moveAsync({
      from: this.state.createdFileURI!,
      to: FileSystem.cacheDirectory!,
    });

    this.setState({
      createdFileURI: null,
    });
  };

  render() {
    return (
      <ScrollView style={{ padding: 10 }}>
        <ListButton onPress={this._download} title="Download file (512KB)" />
        <ListButton onPress={this._startDownloading} title="Start Downloading file (5MB)" />
        {this.state.downloadProgress ? (
          <Text style={{ paddingVertical: 15 }}>
            Download progress: {this.state.downloadProgress * 100}%
          </Text>
        ) : null}
        {/* Add back progress bar once deprecation warnings from reanimated 2 are resolved */}
        {/* <Progress.Bar style={styles.progress} isAnimated progress={this.state.downloadProgress} /> */}
        <ListButton onPress={this._pause} title="Pause Download" />
        <ListButton onPress={this._resume} title="Resume Download" />
        <ListButton onPress={this._cancel} title="Cancel Download" />
        <ListButton onPress={this._getInfo} title="Get Info" />
        <ListButton onPress={this._readAsset} title="Read Asset" />
        <ListButton onPress={this._getInfoAsset} title="Get Info Asset" />
        <ListButton onPress={this._copyAndReadAsset} title="Copy and Read Asset" />
        <ListButton onPress={this._alertFreeSpace} title="Alert free space" />
        {Platform.OS === 'android' && (
          <>
            <HeadingText>Storage Access Framework</HeadingText>
            <ListButton
              onPress={this._askForDirPermissions}
              title="Ask for directory permissions"
            />
            {this.state.permittedURI && (
              <>
                <SimpleActionDemo title="Read directory" action={this._readSAFDirAsync} />
                <SimpleActionDemo title="Create a file" action={this._creatSAFFileAsync} />

                {this.state.createdFileURI && (
                  <>
                    <SimpleActionDemo
                      title="Write to created file"
                      action={this._writeToSAFFileAsync}
                    />
                    <SimpleActionDemo
                      title="Read from created file"
                      action={this._readSAFFileAsync}
                    />
                    <ListButton title="Delete created file" onPress={this._deleteSAFFileAsync} />
                    <SimpleActionDemo
                      title="Copy file to internal storage"
                      action={this._copySAFFileToInternalStorageAsync}
                    />
                    <ListButton
                      title="Move file to internal storage"
                      onPress={this._moveSAFFileToInternalStorageAsync}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    );
  }
}
