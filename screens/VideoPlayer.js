import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated
} from 'react-native';
import { WebBrowser, Video } from 'expo';
var Dimensions = require('Dimensions');
import { MonoText } from '../components/StyledText';
var {width, height} = Dimensions.get('window');

export default class VideoPlayer extends React.Component {

  constructor(props) {
    super(props);
    // set initial state
    this.state = {
      backgroundOpacity: new Animated.Value(0),
      loaded: false,
      videoHeight: Dimensions.get('window').height,
      videoWidth: Dimensions.get('window').width,
      url: null,
      title: null,
    };
  }
  async componentWillMount() {
   // wait for video to download
   //console.warn(this.state.videoHeight,this.state.videoWidth)
   // once loaded, update state
   this.setState({
     loaded: true
   });
   //console.log(this.props.path.URL)
   this.setState({url: this.props.path.URL, title: this.props.path.title})
 }

 // this is called from the video::onLoad()
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
    return (
      <View style={styles.container}>
        <View style={styles.background}>
          <Animated.View style={[styles.backgroundViewWrapper, {opacity: this.state.backgroundOpacity}]}>
            <Video
              isLooping
              isMuted={true}
              onLoad={() => this.fadeInVideo()}
              resizeMode="cover"
              shouldPlay
              source={{ uri: this.state.url }}
              style={{
                height: 812,
                width: 460,
                flexDirection: 'column'
              }}
            />
          </Animated.View>
        </View>
        <View>
       <Animated.View style={{opacity: this.state.backgroundOpacity}}>
          <Text style={styles.title}>
            {this.state.title}
          </Text>
          </Animated.View>
          </View>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',

  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  backgroundViewWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    fontSize: 30,
    color: '#0099cc',
    textAlign: 'left',
    marginTop: height*0.85,

    backgroundColor: '#333',
    padding: 10,
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
    paddingVertical: 0,
  },
  navigationFilename: {
    marginTop: 5,
  },
});
