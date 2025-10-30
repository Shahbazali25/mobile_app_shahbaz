import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

const CustomZonePicker = ({zones, selectedOption, handleZoneChange}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedZone = zones.find(zone => zone.id === selectedOption);

  const handleSelectZone = zoneId => {
    handleZoneChange(zoneId);
    setModalVisible(false);
  };
  //

  return (
    <View>
      {/* Picker Button */}
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.pickerButtonText}>
          {selectedZone ? selectedZone.name : 'Select Zone'}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      {/* Custom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <Pressable onPress={e => e.stopPropagation()}>
              <View style={styles.modalContent}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Zone</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Zone List */}
                <ScrollView style={styles.zoneList}>
                  {zones &&
                    zones.map((zone, index) => (
                      <TouchableOpacity
                        key={zone.id}
                        style={[
                          styles.zoneItem,
                          selectedOption === zone.id && styles.selectedZoneItem,
                          index === zones.length - 1 && styles.lastZoneItem,
                        ]}
                        onPress={() => handleSelectZone(zone.id)}>
                        <Text
                          style={[
                            styles.zoneItemText,
                            selectedOption === zone.id &&
                              styles.selectedZoneItemText,
                          ]}>
                          {zone.name}
                        </Text>
                        {selectedOption === zone.id && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Picker Button Styles
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#e3e8eeff',
  },
  pickerButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#1E293B',
    marginRight: -10,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '70%',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },

  // Modal Header
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
  },
  modalTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748B',
    fontWeight: 'bold',
  },

  // Zone List
  zoneList: {
    maxHeight: 400,
  },
  zoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastZoneItem: {
    borderBottomWidth: 0,
  },
  selectedZoneItem: {
    backgroundColor: '#F1F5F9',
  },
  zoneItemText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#475569',
  },
  selectedZoneItemText: {
    color: '#1E293B',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: 'bold',
  },
});

export default CustomZonePicker;
