import { StyleSheet, Image, Text, View, Dimensions } from 'react-native';


const TourPage1 = () => {
    return (
        <View style={styles.container}>
            <Image source={require('../assets/companylogo.png')} style={styles.companylogo} />
            <Image source={require('../assets/image-1-Mpm.png')} style={styles.img1} />
            <Text style={styles.txt1}>Welcome!</Text>
            <Text style={styles.txt2}>Everything is <Text style={{ color: '#8D5A25' }}>Straight</Text></Text>
            <Text style={styles.txt3}>to the point.</Text>
            <Text style={styles.txt4}>Revords App is an connection between customer and business owners,
                where customer can earn rewards from business owners for their loyalty.</Text>
        </View>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
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