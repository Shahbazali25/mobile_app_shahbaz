import React, {useRef, useEffect, useMemo} from 'react';
import {View, Text, StyleSheet, Image, Dimensions} from 'react-native';
import AnimatedLottieView from 'lottie-react-native';
import {labelMap, labelMapKnox} from '../../components/utils/constants';
import {useWebSocketData} from '../../components/services/webSocketData';

const {width: screenWidth} = Dimensions.get('window');

function KnoxSolarData() {
  const dynamicWidth = screenWidth * 0.5;
  console.log(screenWidth);
  const animation = useRef(null);
  const animationLoadLine = useRef(null);
  const animationGridLine = useRef(null);
  const animationBatteryLine = useRef(null);
  const animationSolarLine = useRef(null);
  const solarData = useWebSocketData('knox');
  console.log(solarData);

  const statuses = useMemo(() => {
    if (!solarData)
      return {
        gridStatus: {text: 'Idle', color: '#746d69', bg: '#e6e6e6'},
        solarStatus: {text: 'Idle', color: '#746d69', bg: '#e6e6e6'},
        batteryStatus: {text: 'Idle', color: '#746d69', bg: '#e6e6e6'},
        loadStatus: {text: 'Idle', color: '#746d69', bg: '#e6e6e6'},
        gridDirection: null,
        batteryDirection: null,
      };

    // Grid Status
    const gridPower = parseFloat(
      solarData['knox/inverter_1/ac_input_total_active_power'] || 0,
    );
    const gridStatus =
      gridPower < 0
        ? {text: 'Exporting', color: '#008631', bg: '#d7ffd9'}
        : gridPower > 0
        ? {text: 'Importing', color: '#c30010', bg: '#ffcbd1'}
        : {text: 'Idle', color: '#746d69', bg: '#e6e6e6'};
    const gridDirection =
      gridPower < 0 ? 'right' : gridPower > 0 ? 'left' : null;

    const solar_power_1 = parseFloat(
      solarData['knox/inverter_1/solar_input_power_1'] || 0,
    );

    const solar_power_2 = parseFloat(
      solarData['knox/inverter_1/solar_input_power_2'] || 0,
    );

    // Solar Status
    const solarPower = solar_power_1 + solar_power_2;
    const solarStatus =
      solarPower > 0
        ? {text: 'Producing', color: '#E57A45', bg: '#fff3cd'}
        : {text: 'Idle', color: '#746d69', bg: '#e6e6e6'};

    const battery_voltage = parseFloat(
      solarData['knox/inverter_1/battery_voltage'] || 0,
    );

    const battery_current = parseFloat(
      solarData['knox/inverter_1/battery_current'] || 0,
    );

    // Battery Status
    const batteryPower = battery_voltage * battery_current;
    const batteryStatus =
      batteryPower < 0
        ? {text: 'Discharging', color: '#c30010', bg: '#ffcbd1'}
        : batteryPower > 0
        ? {text: 'Charging', color: '#008631', bg: '#d7ffd9'}
        : {text: 'Idle', color: '#746d69', bg: '#e6e6e6'};
    const batteryDirection =
      batteryPower < 0 ? 'up' : batteryPower > 0 ? 'down' : null;

    const loadPower = parseFloat(
      solarData['knox/inverter_1/ac_output_total_active_power'] || 0,
    );
    const loadStatus =
      loadPower > 0
        ? {text: 'Consuming', color: '#e09100', bg: '#fff3cd'}
        : {text: 'Idle', color: '#746d69', bg: '#e6e6e6'};

    const loadDirection = loadPower > 0 ? 'left' : null;

    return {
      gridStatus,
      solarStatus,
      batteryStatus,
      loadStatus,
      gridDirection,
      batteryDirection,
    };
  }, [solarData]);

  useEffect(() => {
    animation.current?.play();
    animationLoadLine.current?.play();
    animationGridLine.current?.play();
    animationBatteryLine.current?.play();
    animationSolarLine.current?.play();
  }, []);

  if (!solarData) {
    return (
      <View style={styles.container}>
        <AnimatedLottieView
          ref={animation}
          source={require('../../assets/animations/solar-animation.json')}
          style={styles.animation}
          autoPlay={true}
          loop
        />
      </View>
    );
  }

  return (
    <View style={{display: 'flex', flexDirection: 'column'}}>
      <View
        style={{
          height: 380,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <View
          style={{
            paddingHorizontal: 20,
            position: 'relative',
            height:
              screenWidth < 804
                ? 400
                : 600,
            top: 0,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: 'lightgray',
            width:
              screenWidth < 804
                ? screenWidth * 0.8
                : screenWidth * 0.5,
          }}>
          <Image
            source={require('../../assets/imgs/solar-inverter.png')}
            style={{
              width:
                screenWidth < 804
                  ? 50
                  : 80,
              height:
                screenWidth < 804
                  ? 50
                  : 80,
              zIndex: 999999,
              position: 'absolute',
              left: '47%',
              top: '40%',
            }}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/imgs/icons/bulbicon.png')}
            style={{
              position: 'absolute',
              left: '5%',
              top:
                screenWidth < 804
                  ? '41%'
                  : '40%',
              width:
                screenWidth < 804
                  ? 40
                  : 70,
              height:
                screenWidth < 804
                  ? 40
                  : 70,
              zIndex: 9999,
            }}
            resizeMode="contain"
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              left:
                screenWidth < 804
                  ? '3%'
                  : '5%',
              top: '52%',
            }}>
            <Text
              style={{
                color: 'orange',
                fontFamily: 'Poppins-Bold',
                fontSize: 9,
              }}>{`${
              `${parseFloat(
                solarData['knox/inverter_1/ac_output_total_active_power'],
              )} W` || '0 W'
            }`}</Text>

            <Text
              style={{
                color: statuses.loadStatus.color,
                fontFamily: 'Poppins-Regular',
                fontSize: 9,
              }}>
              {statuses.loadStatus.text}
            </Text>
          </View>
          {statuses.loadStatus.text === 'Idle' ? (
            ''
          ) : (
            <AnimatedLottieView
              ref={animationLoadLine}
              source={require('../../assets/animations/load-line.json')}
              style={[
                styles.animation,
                {
                  position: 'absolute',
                  left:
                    screenWidth === 402 ||
                    (screenWidth > 402 && screenWidth < 804)
                      ? '19%'
                      : '16%',
                  top:
                    screenWidth === 402 ||
                    (screenWidth > 402 && screenWidth < 804)
                      ? '44%'
                      : '45%',
                  width: '32%',
                  height: 20,
                  transform: [
                    {
                      rotate:
                        statuses.loadDirection &&
                        statuses.loadDirection === 'left'
                          ? '180deg'
                          : '-180deg',
                    },
                  ],
                  zIndex: -99999,
                },
              ]}
              autoPlay={true}
              loop
            />
          )}
          <Image
            source={require('../../assets/imgs/icons/gridicon2.png')}
            style={{
              position: 'absolute',
              right: '5%',
              top:
                screenWidth < 804
                  ? '41%'
                  : '40%',
              width:
                screenWidth < 804
                  ? 40
                  : 70,
              height:
                screenWidth < 804
                  ? 40
                  : 70,
              zIndex: 9999,
            }}
            resizeMode="contain"
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              right:
              screenWidth < 804
                ? '4%'
                : '5%',
              top: '52%',
            }}>
            <Text
              style={{
                color: '#6158F1',
                fontFamily: 'Poppins-Bold',
                fontSize: 9,
                alignSelf: 'center',
              }}>
              {`${Math.abs(
                parseFloat(
                  solarData['knox/inverter_1/ac_input_total_active_power'],
                ),
              )} W` ?? '0 W'}
            </Text>
            <Text
              style={{
                color: statuses.gridStatus.color,
                fontFamily: 'Poppins-Regular',
                fontSize: 9,
              }}>
              {statuses.gridStatus.text}
            </Text>
          </View>
          {statuses.gridStatus.text === 'Idle' ? (
            ''
          ) : (
            <AnimatedLottieView
              ref={animationGridLine}
              source={require('../../assets/animations/grid-line.json')}
              style={[
                styles.animation,
                {
                  position: 'absolute',
                  right: screenWidth < 804 ? '19%' : '16%',
                  top: screenWidth < 804 ? '44%' : '45%',
                  width: '32%',
                  height: 20,
                  transform: [
                    {
                      rotate:
                        statuses.gridDirection &&
                        statuses.gridDirection === 'left'
                          ? '180deg'
                          : '360deg',
                    },
                  ],
                  zIndex: -99999,
                },
              ]}
              autoPlay={true}
              loop
            />
          )}
          <Image
            source={require('../../assets/imgs/icons/brightnessIcon.png')}
            style={{
              position: 'absolute',
              top: '11%',
              left: '49%',
              width: screenWidth < 804 ? 40 : 70,
              height: screenWidth < 804 ? 40 : 70,
              zIndex: 9999,
            }}
            resizeMode="contain"
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              left: '52%',
              top: '3%',
            }}>
            <Text
              style={{
                color: '#E57A45',
                fontFamily: 'Poppins-Bold',
                fontSize: 9,
                alignSelf: 'center',
              }}>
              {`${
                `${
                  (parseFloat(
                    solarData['knox/inverter_1/solar_input_power_1'],
                  ) || 0) +
                  (parseFloat(
                    solarData['knox/inverter_1/solar_input_power_2'],
                  ) || 0)
                } W` || '0 W'
              }`}
            </Text>
            <Text
              style={{
                color: statuses.solarStatus.color,
                fontFamily: 'Poppins-Regular',
                fontSize: 9,
              }}>
              {statuses.solarStatus.text}
            </Text>
          </View>
          {statuses.solarStatus.text === 'Idle' ? (
            ''
          ) : (
            <AnimatedLottieView
              ref={animationSolarLine}
              source={require('../../assets/animations/load-line.json')}
              style={[
                styles.animation,
                {
                  position: 'absolute',
                  top: '22%',
                  left: '37%',
                  width: '32%',
                  height: 100,
                  transform: [{rotate: '90deg'}],
                },
              ]}
              autoPlay={true}
              loop
            />
          )}

          <Image
            source={require('../../assets/imgs/icons/batteryicon2.png')}
            style={{
              position: 'absolute',
              bottom: '15%',
              left: '49%',
              width: screenWidth < 804 ? 40 : 70,
              height: screenWidth < 804 ? 40 : 70,
              zIndex: 9999,
            }}
            resizeMode="contain"
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              left: screenWidth < 804 ? '46.75%' : '48.775%',
              bottom: '6%',
            }}>
            <Text
              style={{color: 'green', fontFamily: 'Poppins-Bold', fontSize: 9}}>
              {`${
                `${(
                  (parseFloat(solarData['knox/inverter_1/battery_voltage']) ||
                    0) *
                  (parseFloat(solarData['knox/inverter_1/battery_current']) ||
                    0)
                ).toFixed(1)} W` || '0 W'
              }`}
              (
              {`${(
                solarData['knox/inverter_1/battery_capacity'] ?? '0%'
              ).replace(/\s+/g, '')}`}
              )
            </Text>
            <Text
              style={{
                color: statuses.batteryStatus.color,
                fontFamily: 'Poppins-Regular',
                fontSize: 9,
              }}>
              {statuses.batteryStatus.text}
            </Text>
          </View>
          {statuses.batteryStatus.text === 'Idle' ? (
            ''
          ) : (
            <AnimatedLottieView
              ref={animationBatteryLine}
              source={require('../../assets/animations/battery-line.json')}
              style={[
                styles.animation,
                {
                  position: 'absolute',
                  bottom: '24%',
                  left: '40%',
                  width: '32%',
                  height: 100,
                  transform: [
                    {
                      rotate:
                        statuses.batteryDirection &&
                        statuses.batteryDirection === 'up'
                          ? '-90deg'
                          : '90deg',
                    },
                  ],
                },
              ]}
              autoPlay={true}
              loop
            />
          )}
        </View>
      </View>

     <View
       style={{
         display: 'flex',
         flexDirection: 'column',
         marginTop: screenWidth < 804 ? 35 : 50,
         marginBottom: 20,
         paddingHorizontal: 15,
         width: '100%',
       }}>
       <View
         style={{
           display: 'flex',
           flexDirection: 'row',
           alignItems: 'center',
           justifyContent: 'space-between',
           flexWrap: screenWidth < 600 ? 'wrap' : 'nowrap',
           gap: 8,
         }}>
         
         {/* Grid Card */}
         <View
           style={{
             flex: screenWidth < 600 ? 0 : 1,
             width: screenWidth < 600 ? '48%' : 'auto',
             minWidth: screenWidth < 600 ? 160 : 120,
             padding: screenWidth < 804 ? 12 : 15,
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             backgroundColor: 'white',
             borderWidth: 1,
             borderColor: '#e2e8f0',
             borderRadius: 12,
              //height: screenWidth < 804 ? 120 : 180,
           }}>
           <View style={{
             display: 'flex',
             flexDirection: 'row',
             alignItems: 'center',
             marginBottom: 8,
           }}>
             <Image
               source={require('../../assets/imgs/icons/gridicon2.png')}
               style={{
                 width: screenWidth < 804 ? 24 : 28,
                 height: screenWidth < 804 ? 24 : 28,
                 marginRight: 6,
               }}
             />
             <Text
               style={{
                 fontFamily: 'Poppins-Medium',
                 fontSize: screenWidth < 804 ? 12 : 14,
                 color: '#64748b',
               }}>
               Grid
             </Text>
           </View>
           <Text
             style={{
               fontSize: screenWidth < 804 ? 13 : 22,
               fontFamily: 'Poppins-Bold',
               color: '#1B3C55',
               marginBottom: 2,
             }}>
             {`${Math.abs(
               parseFloat(
                 solarData['knox/inverter_1/ac_input_total_active_power'],
               ),
             )} W` ?? '0 W'}
           </Text>
           <View
             style={{
               backgroundColor: statuses.gridStatus.bg,
               borderRadius: 12,
               paddingHorizontal: 10,
               paddingVertical: 4,
             }}>
             <Text
               style={{
                 color: statuses.gridStatus.color,
                 fontSize: screenWidth < 804 ? 9 : 10,
                 fontFamily: 'Poppins-SemiBold',
               }}>
               {statuses.gridStatus.text}
             </Text>
           </View>
         </View>
     
         {/* Solar Card */}
         <View
           style={{
             flex: screenWidth < 600 ? 0 : 1,
             width: screenWidth < 600 ? '48%' : 'auto',
             minWidth: screenWidth < 600 ? 160 : 120,
             padding: screenWidth < 804 ? 12 : 15,
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             backgroundColor: 'white',
             borderWidth: 1,
             borderColor: '#e2e8f0',
             borderRadius: 12,
              //height: screenWidth < 804 ? 120 : 180,
           }}>
           <View style={{
             display: 'flex',
             flexDirection: 'row',
             alignItems: 'center',
             marginBottom: 8,
           }}>
             <Image
               source={require('../../assets/imgs/icons/brightnessIcon.png')}
               style={{
                 width: screenWidth < 804 ? 24 : 28,
                 height: screenWidth < 804 ? 24 : 28,
                 marginRight: 6,
               }}
             />
             <Text
               style={{
                 fontFamily: 'Poppins-Medium',
                 fontSize: screenWidth < 804 ? 12 : 14,
                 color: '#64748b',
               }}>
               Solar
             </Text>
           </View>
           <Text
             style={{
               fontSize: screenWidth < 804 ? 13 : 22,
               fontFamily: 'Poppins-Bold',
               color: '#1B3C55',
               marginBottom: 2,
             }}>
             {`${
               (parseFloat(
                 solarData['knox/inverter_1/solar_input_power_1'],
               ) || 0) +
               (parseFloat(
                 solarData['knox/inverter_1/solar_input_power_2'],
               ) || 0)
             } W` || '0 W'}
           </Text>
           <View
             style={{
               backgroundColor: statuses.solarStatus.bg,
               borderRadius: 12,
               paddingHorizontal: 10,
               paddingVertical: 4,
             }}>
             <Text
               style={{
                 color: statuses.solarStatus.color,
                 fontSize: screenWidth < 804 ? 9 : 10,
                 fontFamily: 'Poppins-SemiBold',
               }}>
               {statuses.solarStatus.text}
             </Text>
           </View>
         </View>
     
         {/* Battery Card */}
         <View
           style={{
             flex: screenWidth < 600 ? 0 : 1,
             width: screenWidth < 600 ? '48%' : 'auto',
             minWidth: screenWidth < 600 ? 160 : 120,
             padding: screenWidth < 804 ? 12 : 15,
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             backgroundColor: 'white',
             borderWidth: 1,
             borderColor: '#e2e8f0',
             borderRadius: 12,
              //height: screenWidth < 804 ? 120 : 180,
           }}>
           <View style={{
             display: 'flex',
             flexDirection: 'row',
             alignItems: 'center',
             marginBottom: 8,
           }}>
             <Image
               source={require('../../assets/imgs/icons/batteryicon2.png')}
               style={{
                 width: screenWidth < 804 ? 24 : 28,
                 height: screenWidth < 804 ? 24 : 28,
                 marginRight: 6,
               }}
             />
             <Text
               style={{
                 fontFamily: 'Poppins-Medium',
                 fontSize: screenWidth < 804 ? 12 : 14,
                 color: '#64748b',
               }}>
               Battery ({`${(solarData['knox/inverter_1/battery_capacity'] ?? '0%').replace(/\s+/g, '')}`})
             </Text>
           </View>
           <Text
             style={{
               fontSize: screenWidth < 804 ? 13 : 22,
               fontFamily: 'Poppins-Bold',
               color: '#1B3C55',
               marginBottom: 2,
             }}>
             {`${(
               (parseFloat(solarData['knox/inverter_1/battery_voltage']) || 0) *
               (parseFloat(solarData['knox/inverter_1/battery_current']) || 0)
             ).toFixed(1)} W` || '0 W'}
           </Text>

           <View
             style={{
               backgroundColor: statuses.batteryStatus.bg,
               borderRadius: 12,
               paddingHorizontal: 10,
               paddingVertical: 4,
             }}>
             <Text
               style={{
                 color: statuses.batteryStatus.color,
                 fontSize: screenWidth < 804 ? 9 : 10,
                 fontFamily: 'Poppins-SemiBold',
               }}>
               {statuses.batteryStatus.text}
             </Text>
           </View>
         </View>
     
         {/* Load Card */}
         <View
           style={{
             flex: screenWidth < 600 ? 0 : 1,
             width: screenWidth < 600 ? '48%' : 'auto',
             minWidth: screenWidth < 600 ? 160 : 120,
             padding: screenWidth < 804 ? 12 : 15,
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             backgroundColor: 'white',
             borderWidth: 1,
             borderColor: '#e2e8f0',
             borderRadius: 12,
             //height: screenWidth < 804 ? 120 : 180,
           }}>
           <View style={{
             display: 'flex',
             flexDirection: 'row',
             alignItems: 'center',
             marginBottom: 8,
           }}>
             <Image
               source={require('../../assets/imgs/icons/bulbicon.png')}
               style={{
                 width: screenWidth < 804 ? 24 : 28,
                 height: screenWidth < 804 ? 24 : 28,
                 marginRight: 6,
               }}
             />
             <Text
               style={{
                 fontFamily: 'Poppins-Medium',
                 fontSize: screenWidth < 804 ? 12 : 14,
                 color: '#64748b',
               }}>
               Load
             </Text>
           </View>
           <Text
             style={{
               fontSize: screenWidth < 804 ? 13 : 22,
               fontFamily: 'Poppins-Bold',
               color: '#1B3C55',
               marginBottom: 2,
             }}>
             {`${parseFloat(
               solarData['knox/inverter_1/ac_output_total_active_power'],
             )} W` || '0 W'}
           </Text>
           <View
             style={{
               backgroundColor: statuses.loadStatus.bg,
               borderRadius: 12,
               paddingHorizontal: 10,
               paddingVertical: 4,
             }}>
             <Text
               style={{
                 color: statuses.loadStatus.color,
                 fontSize: screenWidth < 804 ? 9 : 10,
                 fontFamily: 'Poppins-SemiBold',
               }}>
               {statuses.loadStatus.text}
             </Text>
           </View>
         </View>
       </View>
     </View>
    </View>
  );
}

const styles = StyleSheet.create({
  animation: {
    width: 250,
    height: 250,
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRow: {
    backgroundColor: 'white',
  },
  labelText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  valueText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'right',
    fontFamily: 'Poppins-Medium',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default KnoxSolarData;
