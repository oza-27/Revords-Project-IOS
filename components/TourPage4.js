import { StyleSheet, Image, Text, View, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const TourPage4 = () => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#d9e7ed', '#bfdfed', '#d9e7ed']}
                style={[styles.gradient]}>
                <Image source={require('../assets/companylogo.png')} style={styles.companylogo} />
                <Image source={require('../assets/04TourImage.png')} style={styles.img1} />
                <Text style={styles.txt2}> Ready to
                    <Text style={{ color: '#8D5A25' }}> Explore?</Text>
                </Text>
            </LinearGradient>
        </View>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    gradient: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        alignItems: 'center',
        paddingHorizontal: width * 0.05, // Adjust based on your design
    },
    container: {
        flex: 1,
        backgroundColor: '#d9e7ed',
        alignItems: 'center',
        paddingHorizontal: width * 0.05
    },
    companylogo: {
        width: '55%',
        resizeMode: 'contain',
        aspectRatio: 1
    },
    img1: {
        width: width * 0.4,
        height: width * 0.4,
        borderRadius: width * 0.4,
    },
    txt1: {
        fontSize: 24,
        fontWeight: '700',
        color: '#140D05',
        borderRadius: width * 0.4
    },
    txt2: {
        fontSize: 24,
        fontWeight: '900',
        marginTop: height * 0.03,
        color: '#140D05',
    },
    txt5: {
        fontSize: 15,
        fontWeight: '500',
        marginTop: height * 0.03,
        color: '#8c9194',
        textAlign: 'center',
    },
});

export default TourPage4;