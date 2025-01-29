import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface AudioNote {
  id: string;
  date: string;
  transcription: string;
  uri: string;
}

export default function AudioNotesListScreen() {
  const [notes, setNotes] = useState<AudioNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<AudioNote | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('audioEntries');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const deleteAllNotes = () => {
    Alert.alert(
      "Eliminar todas las notas",
      "¿Estás seguro que deseas eliminar todas las notas? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('audioNotes');
              setNotes([]);
            } catch (error) {
              console.error('Error deleting notes:', error);
            }
          }
        }
      ]
    );
  };

  const handleNotePress = (note: AudioNote) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const playAudio = async (uri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          await newSound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderNoteItem = ({ item }: { item: AudioNote }) => (
    <TouchableOpacity 
      style={styles.noteItem} 
      onPress={() => handleNotePress(item)}
    >
      <Text style={styles.noteDate}>{formatDate(item.date)}</Text>
      <Text style={styles.notePreview} numberOfLines={2}>
        {item.transcription}
      </Text>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tell me how you feel right now</Text>
        <Text style={styles.subtitle}>I'm here to listen to you</Text>
      </View>

      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No hay notas de voz guardadas</Text>
        )}
        ListFooterComponent={() => notes.length > 0 ? (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={deleteAllNotes}
          >
            <Ionicons name="trash-outline" size={24} color="white" />
            <Text style={styles.deleteButtonText}>Eliminar todo</Text>
          </TouchableOpacity>
        ) : null}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          stopAudio();
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  stopAudio();
                  setModalVisible(false);
                }}
              >
                <Ionicons name="close" size={24} color="#FFB347" />
              </TouchableOpacity>
            </View>

            {selectedNote && (
              <>
                <Text style={styles.modalDate}>
                  {formatDate(selectedNote.date)}
                </Text>
                
                <View style={styles.transcriptionContainer}>
                  <Text style={styles.transcriptionText}>
                    {selectedNote.transcription}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => {
                    if (isPlaying) {
                      stopAudio();
                    } else {
                      playAudio(selectedNote.uri);
                    }
                  }}
                >
                  <Ionicons 
                    name={isPlaying ? "pause-circle" : "play-circle"} 
                    size={50} 
                    color="#FFB347"
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFB347',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 100, // Espacio para el botón de eliminar
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10,
  },
  noteDate: {
    flex: 2,
    fontSize: 14,
    color: '#666',
  },
  notePreview: {
    flex: 3,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  separator: {
    height: 10,
    backgroundColor: 'transparent',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  modalDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  transcriptionContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    maxHeight: '60%',
  },
  transcriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  playButton: {
    alignSelf: 'center',
    padding: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 30,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  }
});