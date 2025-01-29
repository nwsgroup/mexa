import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { router } from 'expo-router';

export default function Welcome() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.welcomeText}>Welcome Andrea,</Text>

                <Text style={styles.descriptionText}>
                    I am a bridge between biology and psychology, I use the rhythm of your heart to calm your mind.
                </Text>

                <View style={styles.imageContainer}>
                    <View style={styles.imageBorder}>
                        <Image
                            source={require('../../assets/images/golden-waves.png')}
                            style={styles.waveImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                <Text style={styles.brandText}>ALETHEIA</Text>

                <View style={styles.bottomNav}>
                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={() => router.push('/heart/heartbeat')}
                    >
                        <Image
                            source={require('../../assets/images/heart-icon.png')}
                            style={styles.navIcon}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={() => router.push('/voice_note/voice_note')}
                    >
                        <Image
                            source={require('../../assets/images/mic-icon.png')}
                            style={styles.navIcon}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={() => router.push('/voice_note/list_notes')}
                        >
                        <Image
                            source={require('../../assets/images/stats-icon.png')}
                            style={styles.navIcon}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 2,
        marginTop: 100,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#F4B942',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
    },
    imageBorder: {
        width: 250,  // Tamaño fijo para el contenedor del borde
        height: 250, // Tamaño fijo para el contenedor del borde
        borderRadius: 150,
        borderWidth: 4,
        borderColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
    },
    waveImage: {
        width: '102%',
        height: '102%',
        padding: 0,
    },
    brandText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingBottom: 20,
    },
    navButton: {
        width: 60,
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    navIcon: {
        width: 24,
        height: 24,
    },
});