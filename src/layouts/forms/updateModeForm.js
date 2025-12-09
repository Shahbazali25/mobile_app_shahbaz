import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useRef, useEffect, useCallback} from 'react';
import AnimatedLottieView from 'lottie-react-native';
import {getAllCameras} from '../../components/apis/cameras/getAllCameras';
import errorMessage from '../../components/utils/errorMessage';
import {getAllModes} from '../../components/apis/modes/getAllModes';
import {getAllSensors} from '../../components/apis/sensors/getAllSensors';
import {addComponentInMode} from '../../components/apis/modes/addComponentInMode';
import {removeComponentFromMode} from '../../components/apis/modes/removeComponentInMode';
import {checkUserRole} from '../../components/utils/checkRole';

export default function UpdateModeForm({modeId}) {
  const animation = useRef();
  const [isLoading, setLoading] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [linkedCamerasInMode, setLinkedCamerasInMode] = useState([]);
  const [linkedSensorsInMode, setLinkedSensorsInMode] = useState([]);
  const [showAllCameras, setShowAllCameras] = useState(false);
  const [showAllSensors, setShowAllSensors] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const allModes = await getAllModes();
      const role = await checkUserRole();
      setUserRole(role);

      if (role === 0 || role === 3 || role === 4 || role === 5) {
        const fetchedCameras = await getAllCameras();
        console.log('Fetched Cameras', fetchedCameras);
        setCameras(fetchedCameras);
      } else {
        setCameras([]);
      }
      if (role === 0 || role === 1 || role === 2 || role === 5) {
        const fetchedSensors = await getAllSensors();

        console.log('Fetched Sensors', fetchedSensors);
        setSensors(fetchedSensors);
      }

      const currentMode = allModes.find(mode => mode.id === modeId);
      if (currentMode) {
        console.log('Current Mode:', currentMode);
        if (role === 0 || role === 5) {
          setLinkedCamerasInMode(currentMode.linkedCameras || []);
          setLinkedSensorsInMode(currentMode.linkedSensors || []);
        } else if (role === 1 || role === 2) {
          setLinkedCamerasInMode([]);
          setLinkedSensorsInMode(currentMode.linkedSensors || []);
        } else {
          setLinkedCamerasInMode(currentMode.linkedCameras || []);
          setLinkedSensorsInMode([]);
        }
      } else {
        console.log(`Mode with ID ${modeId} not found.`);
        setLinkedCamerasInMode([]);
        setLinkedSensorsInMode([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      errorMessage('Data Error', String(error));
    } finally {
      setLoading(false);
    }
  }, [modeId]);

  useEffect(() => {
    animation.current?.play();
    fetchData();
  }, [fetchData]);

  const handleCameraToggle = async cameraId => {
    const isCurrentlyLinked = linkedCamerasInMode.includes(cameraId.toString());
    try {
      let response;
      if (isCurrentlyLinked) {
        response = await removeComponentFromMode(modeId, 'camera', cameraId);
      } else {
        response = await addComponentInMode(modeId, 'camera', cameraId);
      }

      if (response.data.status === 200) {
        if (isCurrentlyLinked) {
          setLinkedCamerasInMode(prev =>
            prev.filter(id => id !== cameraId.toString()),
          );
        } else {
          setLinkedCamerasInMode(prev => [...prev, cameraId.toString()]);
        }
        console.log(
          `Camera with ID ${cameraId} toggled. Status: ${
            isCurrentlyLinked ? 'Unlinked' : 'Linked'
          }`,
        );
      } else {
        console.error('Failed to toggle camera:', response);
        errorMessage('Toggle Error', 'Failed to update camera status.');
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
      errorMessage('Toggle Error', 'Error communicating with the server.');
    }
  };
  const handleDetectionToggle = async cameraId => {
    const isCurrentlyLinked = linkedCamerasInMode.includes(cameraId.toString());
        console.log(
          `Camera with ID ********** ${cameraId} toggled. Status: ${
            isCurrentlyLinked ? 'Unlinked' : 'Linked'
          }`  );
    
  };

  const isCameraLinked = cameraId => {
    return linkedCamerasInMode.includes(cameraId.toString());
  };


  const isDetectionEnabled = camera => {
    let flag = false;
    if (camera === null) {
      console.log(' im in ifffff ', flag);
      return flag;
    } else {
      camera?.detectionEnabled !== false ? (flag = true) : false;
      console.log(' im in elseeee ', flag);
    }
    console.log(' im in at last ', flag);
    // NOw based on flag value how to update the camera.detectionEnabled value in main parent object from where the cameras are getting? 

    return flag;
  };

  const handleSensorToggle = async sensorId => {
    const isCurrentlyLinked = linkedSensorsInMode.includes(sensorId.toString());
    try {
      let response;
      if (isCurrentlyLinked) {
        response = await removeComponentFromMode(modeId, 'sensor', sensorId);
      } else {
        response = await addComponentInMode(modeId, 'sensor', sensorId);
      }

      if (response.data.status === 200) {
        if (isCurrentlyLinked) {
          setLinkedSensorsInMode(prev =>
            prev.filter(id => id !== sensorId.toString()),
          );
        } else {
          setLinkedSensorsInMode(prev => [...prev, sensorId.toString()]);
        }
        console.log(
          `Sensor with ID ${sensorId} toggled. Status: ${
            isCurrentlyLinked ? 'Unlinked' : 'Linked'
          }`,
        );
      } else {
        console.error('Failed to toggle sensor:', response.status);
        errorMessage('Toggle Error', 'Failed to update sensor status.');
      }
    } catch (error) {
      console.error('Error toggling sensor:', error);
      errorMessage('Toggle Error', 'Error communicating with the server.');
    }
  };

  const isSensorLinked = sensorId => {
    return linkedSensorsInMode.includes(sensorId.toString());
  };

  const visibleCameras =
    userRole === 0 || userRole === 3 || userRole === 4 || userRole === 5
      ? showAllCameras
        ? cameras
        : cameras.slice(0, 3)
      : [];
  const visibleSensors =
    userRole === 0 || userRole === 1 || userRole === 2 || userRole === 5
      ? showAllSensors
        ? sensors
        : sensors.slice(0, 3)
      : [];

  if (isLoading && !userRole) {
    return (
      <View style={styles.loadingContainer}>
        <AnimatedLottieView
          ref={animation}
          source={require('../../assets/animations/loading.json')}
          style={styles.animation}
          autoPlay={true}
          loop
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.form}>
      <View style={{paddingBottom: 100}}>
        {(userRole === 0 ||
          userRole === 3 ||
          userRole === 4 ||
          userRole === 5) && (
          <Text
            aria-label="Label for Cameras"
            nativeID="labelCameras"
            style={[styles.sectionLabel, {marginTop: 4}]}>
            Cameras
          </Text>
        )}
        {(userRole === 0 ||
          userRole === 3 ||
          userRole === 4 ||
          userRole === 5) &&
          visibleCameras.map(camera => (
            <>
            <View style={{backgroundColor: "#f5f7faff", marginBottom: 6, paddingHorizontal: 10, borderRadius: 10}} >

              <View key={camera.id} style={styles.inputFields}>
                <Text
                  aria-label={`Label for Camera ${camera.name}`}
                  nativeID={`labelCamera_${camera.id}`}
                  style={styles.formLabel}>
                  {camera.name}
                </Text>
                <View style={styles.toggleContainer}>
                  <Switch
                    trackColor={{false: '#767577', true: '#3cb043'}}
                    thumbColor="#f4f3f4"
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => handleCameraToggle(camera.network_id)}
                    value={isCameraLinked(camera.network_id)}
                  />
                </View>
              </View>
              {isCameraLinked(camera.network_id) && (
                <View key={camera.id} style={styles.inputFields2}>
                  <Text
                    aria-label={`Label for Camera ${camera.name}`}
                    nativeID={`labelCamera_${camera.id}`}
                    style={styles.formLabel}>
                    Enable Detection
                  </Text>

                  <View style={styles.toggleContainer2}>
                    <Switch
                      trackColor={{false: '#767577', true: '#548fe7ff'}}
                      thumbColor="#f4f3f4"
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() =>
                        handleDetectionToggle(camera.network_id)
                      }
                      value={isDetectionEnabled(
                        camera?.detectionEnabled
                          ? camera
                          : null,
                      )}
                    />
                  </View>
                </View>
              )}
            </View>
            </>
          ))}
        {(userRole === 0 ||
          userRole === 3 ||
          userRole === 4 ||
          userRole === 5) &&
          cameras.length > 3 &&
          !showAllCameras && (
            <TouchableOpacity
              onPress={() => setShowAllCameras(true)}
              style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>See More Cameras</Text>
            </TouchableOpacity>
          )}
        {(userRole === 0 ||
          userRole === 3 ||
          userRole === 4 ||
          userRole === 5) &&
          cameras.length > 3 &&
          showAllCameras && (
            <TouchableOpacity
              onPress={() => setShowAllCameras(false)}
              style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>See Less Cameras</Text>
            </TouchableOpacity>
          )}

        {(userRole === 0 ||
          userRole === 1 ||
          userRole === 2 ||
          userRole === 5) && (
          <Text
            aria-label="Label for Sensors"
            nativeID="labelSensors"
            style={[styles.sectionLabel, {marginTop: 16}]}>
            Sensors
          </Text>
        )}
        {(userRole === 0 ||
          userRole === 1 ||
          userRole === 2 ||
          userRole === 5) &&
          visibleSensors.map(sensor => (
            <View key={sensor.id} style={styles.inputFields}>
              <Text
                aria-label={`Label for Sensor ${sensor.name}`}
                nativeID={`labelSensor_${sensor.id}`}
                style={styles.formLabel}>
                {sensor.name}
              </Text>
              <View style={styles.toggleContainer}>
                <Switch
                  trackColor={{false: '#767577', true: '#3cb043'}}
                  thumbColor="#f4f3f4"
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => handleSensorToggle(sensor.id)}
                  value={isSensorLinked(sensor.id)}
                />
              </View>
            </View>
          ))}
        {(userRole === 0 ||
          userRole === 1 ||
          userRole === 2 ||
          userRole === 5) &&
          sensors.length > 3 &&
          !showAllSensors && (
            <TouchableOpacity
              onPress={() => setShowAllSensors(true)}
              style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>See More Sensors</Text>
            </TouchableOpacity>
          )}
        {(userRole === 0 ||
          userRole === 1 ||
          userRole === 2 ||
          userRole === 5) &&
          sensors.length > 3 &&
          showAllSensors && (
            <TouchableOpacity
              onPress={() => setShowAllSensors(false)}
              style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>See Less Sensors</Text>
            </TouchableOpacity>
          )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    paddingVertical: 8,
  },
  toggleContainer2: {
    paddingVertical: 0,
  },
  form: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    paddingHorizontal: 40,
    backgroundColor: 'white',
    // borderTopLeftRadius: 30,
    // borderTopRightRadius: 30,
    flexGrow: 1,
  },
  formLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
  },
  inputFields: {
    marginTop: 6,
    marginBottom: 0,

    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  inputFields2: {
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
  seeMoreButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  seeMoreText: {
    color: '#1E293B',
    fontFamily: 'Poppins-Light',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
