import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  processColor,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LineChart} from 'react-native-charts-wrapper';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

// Mock data for Grid Interaction
const mockData = {
  Today: {
    stats: {
      import: 43.3,
      export: 9.0,
      yesterday: 67.2,
    },
    voltages: {
      p1: 235,
      p2: 241,
      p3: 233,
    },
    chartData: {
      dataSets: [
        {
          values: [
            {x: 6, y: 2.1},
            {x: 7, y: 1.8},
            {x: 8, y: 4.5},
            {x: 9, y: 6.2},
            {x: 10, y: 8.5},
            {x: 11, y: 7.1},
            {x: 12, y: 5.3},
            {x: 13, y: 3.8},
            {x: 14, y: 2.5},
            {x: 15, y: 4.2},
            {x: 16, y: 3.1},
            {x: 17, y: 2.8},
            {x: 18, y: 1.9},
          ],
          label: 'Import',
          config: {
            lineWidth: 3,
            color: processColor('#EF4444'),
            circleColor: processColor('#EF4444'),
            circleRadius: 4,
            drawCircles: true,
            drawValues: false,
            mode: 'CUBIC_BEZIER',
            fillColor: processColor('#EF4444'),
            fillAlpha: 30,
            drawFilled: true,
          },
        },
        {
          values: [
            {x: 6, y: 15},
            {x: 7, y: 14},
            {x: 8, y: 2.2},
            {x: 9, y: 9.8},
            {x: 10, y: 13.5},
            {x: 11, y: 14.2},
            {x: 12, y: 22.1},
            {x: 13, y: 12.5},
            {x: 14, y: 6},
            {x: 15, y: 7.8},
            {x: 16, y: 8.2},
            {x: 17, y: 13.3},
            {x: 18, y: 16},
          ],
          label: 'Export',
          config: {
            lineWidth: 3,
            color: processColor('#10B981'),
            circleColor: processColor('#10B981'),
            circleRadius: 4,
            drawCircles: true,
            drawValues: false,
            mode: 'CUBIC_BEZIER',
            fillColor: processColor('#10B981'),
            fillAlpha: 30,
            drawFilled: true,
          },
        },
      ],
    },
    yesterdayData: {
      values: [
        {x: 6, y: 1.8},
        {x: 7, y: 1.2},
        {x: 8, y: 2.1},
        {x: 9, y: 3.8},
        {x: 10, y: 15.9},
        {x: 11, y: 7.5},
        {x: 12, y: 14.8},
        {x: 13, y: 23.2},
        {x: 14, y: 8.1},
        {x: 15, y: 10.9},
        {x: 16, y: 15.8},
        {x: 17, y: 22.5},
        {x: 18, y: 18.7},
      ],
      label: 'Yesterday Import',
      config: {
        lineWidth: 2,
        color: processColor('#1E293B'),
        circleColor: processColor('#1E293B'),
        circleRadius: 3,
        drawCircles: true,
        drawValues: false,
        mode: 'CUBIC_BEZIER',
        fillColor: processColor('#1E293B'),
        fillAlpha: 20,
        drawFilled: false,
        strokeDashArray: [5, 5],
      },
    },
    yesterdayExportData: {
      values: [
        {x: 6, y: 0},
        {x: 7, y: 0},
        {x: 8, y: 0.1},
        {x: 9, y: 1.5},
        {x: 10, y: 2.8},
        {x: 11, y: 3.6},
        {x: 12, y: 1.8},
        {x: 13, y: 0.3},
        {x: 14, y: 0},
        {x: 15, y: 0.6},
        {x: 16, y: 0.9},
        {x: 17, y: 0.2},
        {x: 18, y: 0},
      ],
      label: 'Yesterday Export',
      config: {
        lineWidth: 2,
        color: processColor('#1E293B'),
        circleColor: processColor('#1E293B'),
        circleRadius: 3,
        drawCircles: true,
        drawValues: false,
        mode: 'CUBIC_BEZIER',
        fillColor: processColor('#1E293B'),
        fillAlpha: 20,
        drawFilled: false,
        strokeDashArray: [5, 5],
      },
    },
    xLabels: [
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
      '24',
    ],
  },
  'This Month': {
    stats: {
      import: 1245.8,
      export: 287.5,
      yesterday: 1398.2,
    },
    voltages: {
      p1: 238,
      p2: 239,
      p3: 236,
    },
    chartData: {
      dataSets: [
        {
          values: [
            {x: 1, y: 8.5},
            {x: 3, y: 22.1},
            {x: 5, y: 19.8},
            {x: 7, y: 25.3},
            {x: 9, y: 21.7},
            {x: 11, y: 28.2},
            {x: 13, y: 24.6},
            {x: 15, y: 26.9},
            {x: 17, y: 23.4},
            {x: 19, y: 20.8},
            {x: 21, y: 27.1},
            {x: 23, y: 24.3},
            {x: 25, y: 22.7},
            {x: 27, y: 25.8},
            {x: 30, y: 21.9},
          ],
          label: 'Import',
          config: {
            lineWidth: 3,
            color: processColor('#EF4444'),
            circleColor: processColor('#EF4444'),
            circleRadius: 4,
            drawCircles: true,
            drawValues: false,
            mode: 'CUBIC_BEZIER',
            fillColor: processColor('#EF4444'),
            fillAlpha: 30,
            drawFilled: true,
          },
        },
        {
          values: [
            {x: 1, y: 2.1},
            {x: 3, y: 4.8},
            {x: 5, y: 3.5},
            {x: 7, y: 6.2},
            {x: 9, y: 5.1},
            {x: 11, y: 7.8},
            {x: 13, y: 6.4},
            {x: 15, y: 8.1},
            {x: 17, y: 5.9},
            {x: 19, y: 4.2},
            {x: 21, y: 7.3},
            {x: 23, y: 6.7},
            {x: 25, y: 5.4},
            {x: 27, y: 8.9},
            {x: 30, y: 6.1},
          ],
          label: 'Export',
          config: {
            lineWidth: 3,
            color: processColor('#10B981'),
            circleColor: processColor('#10B981'),
            circleRadius: 4,
            drawCircles: true,
            drawValues: false,
            mode: 'CUBIC_BEZIER',
            fillColor: processColor('#10B981'),
            fillAlpha: 30,
            drawFilled: true,
          },
        },
      ],
    },
    yesterdayData: {
      values: [
        {x: 1, y: 17.2},
        {x: 3, y: 20.8},
        {x: 5, y: 18.5},
        {x: 7, y: 23.9},
        {x: 9, y: 20.1},
        {x: 11, y: 26.4},
        {x: 13, y: 23.2},
        {x: 15, y: 25.1},
        {x: 17, y: 22.6},
        {x: 19, y: 19.3},
        {x: 21, y: 25.8},
        {x: 23, y: 22.9},
        {x: 25, y: 21.4},
        {x: 27, y: 24.2},
        {x: 30, y: 20.7},
      ],
      label: 'Previous Import',
      config: {
        lineWidth: 2,
        color: processColor('#1E293B'),
        circleColor: processColor('#1E293B'),
        circleRadius: 3,
        drawCircles: true,
        drawValues: false,
        mode: 'CUBIC_BEZIER',
        fillColor: processColor('#1E293B'),
        fillAlpha: 20,
        drawFilled: false,
        strokeDashArray: [5, 5],
      },
    },
    yesterdayExportData: {
      values: [
        {x: 1, y: 1.8},
        {x: 3, y: 4.2},
        {x: 5, y: 3.1},
        {x: 7, y: 5.7},
        {x: 9, y: 4.6},
        {x: 11, y: 7.1},
        {x: 13, y: 5.9},
        {x: 15, y: 7.4},
        {x: 17, y: 5.2},
        {x: 19, y: 3.8},
        {x: 21, y: 6.7},
        {x: 23, y: 6.1},
        {x: 25, y: 4.9},
        {x: 27, y: 8.2},
        {x: 30, y: 5.6},
      ],
      label: 'Previous Export',
      config: {
        lineWidth: 2,
        color: processColor('#1E293B'),
        circleColor: processColor('#1E293B'),
        circleRadius: 3,
        drawCircles: true,
        drawValues: false,
        mode: 'CUBIC_BEZIER',
        fillColor: processColor('#1E293B'),
        fillAlpha: 20,
        drawFilled: false,
        strokeDashArray: [5, 5],
      },
    },
    xLabels: [
      '1',
      '3',
      '1',
      '7',
      '2',
      '11',
      '3',
      '15',
      '4',
      '19',
      '5',
      '23',
      '6',
      '27',
      '7',
      '30',
    ],
  },
};

function GridInteraction() {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [showYesterday, setShowYesterday] = useState(true);

  const isTablet = screenWidth >= 768;
  const currentData = mockData[selectedPeriod];
  const periods = ['Today', 'This Month'];

  const getUnit = () => {
    return selectedPeriod === 'Today' ? 'kWh' : 'kWh';
  };

  const getChartData = () => {
    // Always show both Import and Export lines
    let dataSets = [...currentData.chartData.dataSets];

    // Add yesterday's data if toggle is enabled
    if (showYesterday) {
      dataSets.push(currentData.yesterdayData);
      if (currentData.yesterdayExportData) {
        dataSets.push(currentData.yesterdayExportData);
      }
    }

    return {dataSets};
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Grid{'\n'}Exchange</Text>
    </View>
  );

  const renderPeriodTabs = () => (
    <View style={styles.tabContainer}>
      <View style={styles.tabsWrapper}>
        {periods.map(period => (
          <TouchableOpacity
            key={period}
            style={[styles.tab, selectedPeriod === period && styles.activeTab]}
            onPress={() => setSelectedPeriod(period)}>
            <Text
              style={[
                styles.tabText,
                selectedPeriod === period && styles.activeTabText,
              ]}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.cardsContainer}>
      <View style={[styles.statsCard, styles.importCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.indicator, {backgroundColor: '#EF4444'}]} />
          <Text style={styles.cardLabel}>
            {selectedPeriod === 'Today'
              ? "Today's Import"
              : "This Month's Import"}
          </Text>
        </View>
        <Text style={styles.cardValue}>{currentData.stats.import}</Text>
        <Text style={styles.cardUnit}>{getUnit()}</Text>
      </View>

      <View style={[styles.statsCard, styles.exportCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.indicator, {backgroundColor: '#10B981'}]} />
          <Text style={styles.cardLabel}>
            {selectedPeriod === 'Today'
              ? "Today's Export"
              : "This Month's Export"}
          </Text>
        </View>
        <Text style={styles.cardValue}>{currentData.stats.export}</Text>
        <Text style={styles.cardUnit}>{getUnit()}</Text>
      </View>

      <View style={[styles.statsCard, styles.yesterdayCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.indicator, {backgroundColor: '#06B6D4'}]} />
          <Text style={styles.cardLabel}>
            {selectedPeriod === 'Today'
              ? "Yesterday's Total"
              : "Last Month's Total"}
          </Text>
        </View>
        <Text style={styles.cardValue}>{currentData.stats.yesterday}</Text>
        <Text style={styles.cardUnit}>{getUnit()}</Text>
      </View>
    </View>
  );

  const renderChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Grid Power Graphs</Text>

      <View style={styles.chartWrapper}>
        <LineChart
          style={styles.chart}
          data={getChartData()}
          chartDescription={{text: ''}}
          legend={{
            enabled: true,
            textSize: 12,
            textColor: '#64748B',
            position: 'BELOW_CHART_CENTER',
            form: 'CIRCLE',
            formSize: 8,
          }}
          xAxis={{
            enabled: true,
            textSize: 10,
            textColor: '#64748B',
            axisLineColor: '#E5E7EB',
            gridColor: '#F3F4F6',
            position: 'BOTTOM',
            drawAxisLine: true,
            drawGridLines: true,
            granularity: 1,
            labelCount: currentData.xLabels.length,
            valueFormatter: currentData.xLabels,
          }}
          yAxis={{
            left: {
              enabled: true,
              textSize: 10,
              textColor: '#64748B',
              axisLineColor: '#E5E7EB',
              gridColor: '#F3F4F6',
              drawAxisLine: false,
              drawGridLines: true,
              position: 'OUTSIDE_CHART',
              spaceTop: 15,
              axisMinimum: 0,
              axisMaximum: 30,
            },
            right: {
              enabled: false,
            },
          }}
          animation={{
            durationX: 1000,
            durationY: 1000,
            easingX: 'EaseInOutQuart',
            easingY: 'EaseInOutQuart',
          }}
          drawGridBackground={false}
          drawBorders={false}
          touchEnabled={true}
          dragEnabled={true}
          scaleEnabled={true}
          scaleXEnabled={true}
          scaleYEnabled={false}
          pinchZoom={true}
          autoScaleMinMaxEnabled={false}
          highlightPerTapEnabled={true}
          highlightPerDragEnabled={false}
        />
      </View>
    </View>
  );

  const renderToggleSwitch = (isActive, onPress, label) => (
    <TouchableOpacity style={styles.toggleOption} onPress={onPress}>
      <View style={[styles.toggle, isActive && styles.toggleActive]}>
        <View
          style={[styles.toggleThumb, isActive && styles.toggleThumbActive]}
        />
      </View>
      <Text style={styles.toggleLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderControls = () => (
    <View style={styles.controlsContainer}>
      {renderToggleSwitch(
        showYesterday,
        () => setShowYesterday(!showYesterday),
        "Yesterday's Data",
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {renderHeader()}
        {renderPeriodTabs()}
        {renderStatsCards()}
        {renderChart()}
        {renderControls()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: screenWidth < 768 ? 28 : 32,
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
    lineHeight: screenWidth < 768 ? 32 : 38,
  },
  phaseIndicators: {
    flexDirection: 'row',
    gap: 8,
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  phaseText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 25,
    padding: 4,
    flex: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1E293B',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  activeTabText: {
    color: 'white',
  },
  cardsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  importCard: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  exportCard: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  yesterdayCard: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#06B6D4',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  indicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  cardLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    flex: 1,
  },
  cardValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
  },
  cardUnit: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
    marginBottom: 20,
  },
  chartWrapper: {
    height: screenWidth < 768 ? 280 : 320,
    borderRadius: 8,
    marginBottom: 10,
  },
  chart: {
    flex: 1,
  },
  controlsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#1E293B',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    flex: 1,
  },
  voltagesContainer: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  voltagesTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
    marginBottom: 15,
  },
  voltagesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  voltageCard: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  voltageLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#16A34A',
    marginBottom: 4,
  },
  voltageValue: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#15803D',
  },
});

export default GridInteraction;
