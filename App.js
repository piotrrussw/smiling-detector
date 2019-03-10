import * as React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, CameraRoll } from 'react-native';
import { Camera, Permissions, FaceDetector } from 'expo';
import { FontAwesome } from '@expo/vector-icons';

export default class App extends React.Component {
    state = {
        hasCameraPermission: false,
        type: Camera.Constants.Type.back,
        faces: [],
        photoTaken: false
    };

    async componentDidMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    }

    handleFacesDetected = ({ faces }) => this.setState({ faces });

    renderFaces = () => {
        const condition = this.state.faces.some(item => item.smilingProbability > 0.7);

        if(condition) {
            this.takePhoto();
        }

        return (
            <View style={styles.facesContainer} pointerEvents="none">
            {this.state.faces.map(this.renderFace)}
            </View>
        )
    };

    takePhoto = async () => {
        if(this.camera && !this.state.photoTaken) {

            await this.camera.takePictureAsync({
                onPictureSaved: (data) => {
                    CameraRoll.saveToCameraRoll(data.uri, 'photo');
                    this.setState({ photoTaken: true });
                    // disable taking next photo for 1s
                    setTimeout(() => this.setState({
                        photoTaken: false
                    }), 1000)
                }
            });

        }
    };

    flipCamera = () => {
        return this.setState({
            type: this.state.type === Camera.Constants.Type.back
                          ? Camera.Constants.Type.front
                          : Camera.Constants.Type.back
        });
    };

    renderFace = ({ bounds, faceID, rollAngle, yawAngle, smilingProbability }) => {
        return (
            <View key={ faceID }
                transform={[
                    { perspective: 600 },
                    { rotateZ: `${rollAngle.toFixed(0)}deg` },
                    { rotateY: `${yawAngle.toFixed(0)}deg` },
                ]}
                style={[styles.face,
                    { ...bounds.size, left: bounds.origin.x, top: bounds.origin.y, }]}>
                <Text style={styles.faceText}>
                      😃 {(smilingProbability * 100).toFixed(0)}%
                </Text>
            </View>
        );
    };

    render() {
        const { hasCameraPermission } = this.state;

        if (hasCameraPermission === null) {
            return <View />;
        } else if (hasCameraPermission === false) {
            return <Text>No access to camera</Text>;
        } else {
            return (
                <View style={{ flex: 1 }}>
                    <Camera
                        ref={ ref => { this.camera = ref }}
                        style={{ flex: 1 }}
                        type={this.state.type}
                        onFacesDetected={ this.handleFacesDetected }
                        faceDetectorSettings={{
                            mode: FaceDetector.Constants.Mode.fast,
                            detectLandmarks: FaceDetector.Constants.Landmarks.none,
                            runClassifications: FaceDetector.Constants.Classifications.all,
                        }}>

                            {this.renderFaces()}

                        <View style={styles.cameraView}>
                            <TouchableOpacity style={styles.flipContainer} onPress={ this.flipCamera}>
                                <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                                    <FontAwesome name="undo" size={25} style={{ color: '#ccc' }} />
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.photoContainer} onPress={() => this.takePhoto()}>
                                <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                                    <FontAwesome name="camera" size={25} style={{ color: '#ccc' }} />
                                </Text>
                            </TouchableOpacity>
                        </View>

                </Camera>
            </View>
        );
        }
    }
}

const styles = StyleSheet.create({
    cameraView: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    flipContainer : {
        flex: 0.1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    photoContainer : {
        flex: '0.1',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    facesContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        top: 0,
    },
    face: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 50,
        position: 'absolute',
        borderColor: '#FFD700',
        justifyContent: 'center',
    },
    faceText: {
        color: '#FFD700',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 10,
        backgroundColor: 'transparent',
    },
});
