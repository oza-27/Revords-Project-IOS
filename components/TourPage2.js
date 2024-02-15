import { StyleSheet, Image, Text, View, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const TourPage1 = () => {


    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#d9e7ed', '#bfdfed', '#d9e7ed']}
                style={[styles.gradient]}>
                <Image source={require('../assets/companylogo.png')} style={styles.companylogo} />
                <Image source={require('../assets/03TourImage.png')} style={styles.img1} />
                <Text style={styles.txt1}> How does it <Text style={{color:'#964B00'}}>Work</Text>? </Text>
                <Text style={styles.txt4}>
                    Each time you visit the Revords business, you earn point(s).
                    Accumulated points can be redeemed for amazing rewards.
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
        height: '100%',
        width: '100%',
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
        marginTop: height * 0.02,
        color: '#140D05',
    },
    txt2: {
        fontSize: 24,
        fontWeight: '900',
        marginTop: height * 0.02,
        color: '#140D05',
    },
    txt3: {
        fontSize: 24,
        fontWeight: '900',
        color: '#140D05',
    },
    txt4: {
        fontSize: 15,
        fontWeight: '500',
        marginTop: height * 0.01,
        color: '#8C9194',
        textAlign: 'center',
    },
});

export default TourPage1;