import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

const CustomGenericPicker = ({
  options = [],
  selectedValue,
  onValueChange,
  placeholder = 'Select Option',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const validOptions = options.filter(
    item => item?.label && item?.value
  );
 
  const selectedItem =
    validOptions.find(item => item.value === selectedValue) || null;

  const handleSelect = value => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View>
      {/* Button */}
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.pickerButtonText}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <Pressable onPress={e => e.stopPropagation()}>
              <View style={styles.modalContent}>
                
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{placeholder}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Option List */}
                <ScrollView style={styles.optionList}>
                  {validOptions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionItem,
                        selectedValue === item.value && styles.selectedOptionItem,
                        index === validOptions.length - 1 && styles.lastOptionItem,
                      ]}
                      onPress={() => handleSelect(item.value)}
                    >
                      <Text
                        style={[
                          styles.optionItemText,
                          selectedValue === item.value && styles.selectedOptionItemText,
                        ]}
                      >
                        {item.label}
                      </Text>

                      {selectedValue === item.value && (
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
  pickerButton: {
    backgroundColor: '#E7E7E7',
    borderRadius: 40,
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontFamily: 'Poppins-Regular',
    color: '#000',
    fontSize: 13,
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#000',
    marginRight: -5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  modalHeader: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '600',
    fontSize: 16,
    color: '#1E293B',
  },
  closeButton: {
    fontSize: 24,
    color: '#94A3B8',
    fontWeight: 'bold',
  },

  optionList: { maxHeight: 400 },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lastOptionItem: { borderBottomWidth: 0 },

  selectedOptionItem: { backgroundColor: '#F1F5F9' },

  optionItemText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#475569',
  },
  selectedOptionItemText: {
    color: '#1E293B',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: 'bold',
  },
});

export default CustomGenericPicker;
