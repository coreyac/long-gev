import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ProgressViewIOS,
  TextInput
} from 'react-native';
import { Camera, Permissions, Video, FileSystem } from 'expo';
var Dimensions = require('Dimensions');
import { MonoText } from '../components/StyledText';
import * as firebase from 'firebase';
var {width, height} = Dimensions.get('window');
export default class RecordScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  state = {
   cacheURL: 'https://firebasestorage.googleapis.com/v0/b/longevity-4653f.appspot.com/o/videos%2FLongGev_Content_Ketogenic.mp4?alt=media&token=e667f343-618f-45a8-8460-227a210f6a4c',
   cacheURL: null,
   backgroundOpacity: new Animated.Value(0),
   hasCameraPermission: null,
   type: Camera.Constants.Type.back,
   uploadProgress: [],
   recording: false,
   progress: 0,
   text: 'Enter a title here'
 };

 async componentDidMount() {
   const { status } = await Permissions.askAsync(Permissions.CAMERA);
   this.setState({ hasCameraPermission: status === 'granted' });
 }

 processCaptured = (uri) => {
    if (!this.recording) {
      return;
    }
    this.recording = false;
    if (this.camera) {
      this._cameraRef.stopRecording();
    }

  };

  startCapture = async () => {
    this.setState({recording: true})
    this.recording = true;
    const captureStarted = new Date().getTime();
    await this._cameraRef.recordAsync({
      maxDuration: 10,
      //quality: Camera.Constants.VideoQuality['480p'],
    }).then(data => {
      this.setState({cacheURL: data.uri})
      console.log(data.uri)
    })
  }

  urlToBlob(url) {
  return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
              resolve(xhr.response);
          }
      };
      xhr.open('GET', url);
      xhr.responseType = 'blob'; // convert type
      xhr.send();
  })
}

  uploadVideo() {
    //console.warn("uploading: ",this.state.cacheURL)
    this.uploadAsFile(this.state.cacheURL,(progress) => {
        //console.log(progress)
        this.setState({ progress })
      })
  }

  uploadAsFile = async (uri,progressCallback) => {
  let fileInfo = await FileSystem.getInfoAsync(uri)
  //console.log("uploadAsFile", JSON.stringify(fileInfo))
  const blob = await this.urlToBlob(uri);
  //console.log(JSON.stringify(blob))
  var metadata = {
    contentType: 'video/quicktime',
  };

  let name = new Date().getTime() + "-media.mov"
  const ref = firebase
    .storage()
    .ref()
    .child('videos/' + name)

  const task = ref.put(blob, metadata);

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        progressCallback && progressCallback(snapshot.bytesTransferred / snapshot.totalBytes)

        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //console.log('Upload is ' + progress + '% done');
      },
      (error) => reject(error), /* this is where you would put an error callback! */
      () => {
        task.snapshot.ref.getDownloadURL()
          .then( downloadUrl => {
            console.log("_uploadAsByteArray ", downloadUrl)

            // save a reference to the image for listing purposes
            var ref = firebase.database().ref('/videos/');
            ref.push({
              'URL': downloadUrl,
              'name': name,
              'title': this.state.text,
              'hashtags': this.state.hashtags,
              'createdAt': new Date().getTime()
            }).then(r => resolve(r), e => reject(e))

          })
          .catch( error => {
            console.log(error);
            //catch error here
          });
      }
    );
  });
}

fadeInVideo = () => {
  setTimeout(() => {
    // animate spring :: https://facebook.github.io/react-native/docs/animated#spring
    Animated.spring(
      this.state.backgroundOpacity,
      {
        toValue: 1
      }
    ).start();
  }, 400);
}

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else if (this.state.cacheURL) {
      return (
        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
        <Animated.View>
        <Video
          isLooping
          isMuted={true}
          resizeMode="contain"
          source={{ uri: this.state.cacheURL }}
          shouldPlay
          style={{
            position: 'absolute',
            top: 0,
            height: 812,
            width: 460,
            alignSelf: 'center',
          }}
        />
        </Animated.View>

        {this.state.progress === 0 ?
        <View style={{flexDirection: 'column', justifyContent: 'space-around', height:height,}}>
          <TextInput multiline={true} blurOnSubmit={true} style={{fontSize: 36, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.5)', color: '#ccffff'}} onChangeText={(text) => this.setState({text: text})} value={this.state.text} />
          <TextInput multiline={true} blurOnSubmit={true} style={{fontSize: 36, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.5)', color: '#ccffff'}} onChangeText={(hashtags) => this.setState({hashtags: hashtags})} value={this.state.hashtags} />
          <TouchableOpacity style={{width: width*0.9, height: 50, backgroundColor: '#0099cc', borderRadius: 5,
          flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center' }} onPress={() => {this.uploadVideo()}}>
          <Text
            style={{ fontSize: 18,  color: '#fff' }}>
            {' '}Upload Video{' '}
          </Text>
          </TouchableOpacity>
        </View>
        : null }

        {this.state.progress === 0 ?
        <TouchableOpacity style={{width: width*0.9, marginTop: height*0.7, height: 50, backgroundColor: '#0099cc', borderRadius: 5,
        flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center' }} onPress={() => {this.uploadVideo()}}>
        <Text
          style={{ fontSize: 18,  color: '#fff' }}>
          {' '}Upload Video{' '}
        </Text>
        </TouchableOpacity> : null
        }

        {this.state.progress === 1 ?
        <TouchableOpacity style={{width: width*0.9, marginBottom: 140, height: 50, backgroundColor: '#0099cc', borderRadius: 5,
        flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center' }} onPress={() => {this.setState({cacheURL: null, progress: 0})}}>
        <Text
          style={{ fontSize: 18,  color: '#fff' }}>
          {' '}Record New Video{' '}
        </Text>
        </TouchableOpacity> : null
        }

        {this.state.progress === 1 || this.state.progress === 0 ? null :
          <View style={{ height: 60, marginBottom: 200, alignItems: 'center', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.5)',}}>
          <Text style={{ fontSize: 18, height: 22, marginTop: 10, width: 100, color: '#ccffff'}}>Please Wait</Text>
          <ProgressViewIOS
            progress={this.state.progress}
            progressViewStyle="bar"
            progressTintColor="#ff6600"
            style={{
              padding: 20,
              height: 10,
              width: width,
              marginBottom: 140,
            }} />
            </View>
        }
        </View>
      )} else {
      return (
        <View style={{ flex: 1, }}>
          <Camera style={{ flex: 1 }} type={this.state.type} ref={ref => { this._cameraRef = ref; }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                //justifyContent: 'center'
              }}>
              <TouchableOpacity
                style={{
                  flex: 0.5,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={() => {
                  this.setState({
                    type: this.state.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back,
                  });
                }}>
                <Text
                  style={{ fontSize: 18, justifyContent: 'center', marginBottom: 90, color: 'white' }}>
                  {' '}Flip{' '}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPressIn={this.startCapture}
                onPressOut={this.processCaptured}>
                <View
                  style={
                    this.recording
                      ? styles.storyCapturing
                      : styles.captureButtonWrap
                  }>
                  {this.recording && (
                    <View style={styles.captureButton} />
                  )}
                  {!this.recording && (
                    <View style={styles.captureButton} />
                  )}
                </View>
          </TouchableOpacity>



            </View>
          </Camera>
        </View>
      );
    }
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use useful development
          tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  captureButtonWrap: {
      width: 70,
      height: 70,
      padding: 3,
      borderColor: '#2C66CE',
      borderWidth: 2,
      borderRadius: 35,
      position: 'absolute',
      bottom: 70,
      //left: '50%',
      //marginLeft: -35,
      alignSelf: 'center',
      backgroundColor: 'rgba(100, 100, 255, 0.69)',
    },
    captureButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.69)',
    },
    storyCapturing: {
      width: 70,
      height: 70,
      padding: 3,
      borderColor: '#2C66CE',
      borderWidth: 2,
      borderRadius: 35,
      position: 'absolute',
      bottom: 70,
      //left: '50%',
      //marginLeft: -35,
      alignSelf: 'center',
      backgroundColor: 'red',
   },
   backgroundViewWrapper: {
     ...StyleSheet.absoluteFillObject,
   },

});
