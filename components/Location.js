import { TextInput, TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Card, Title } from 'react-native-paper';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Globals from './Globals';
import Geolocation from '@react-native-community/geolocation';
import { useIsFocused } from '@react-navigation/native';
import { isLocationEnabled } from 'react-native-android-location-enabler';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-simple-toast';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';


const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);
const Location = ({ navigation }) => {
    const [search, setSearch] = useState('');
    const [filteredData, setFilteredData] = useState('');
    const focus = useIsFocused();
    lang = 0;
    lat = 0;
    const [loadingData, setLoadingData] = useState(true);
    const [userData, setUserData] = useState('');
    const baseUrl = Globals.API_URL + "/BusinessProfiles/GetBusinessProfilesForMobile";
    const pulse = {
        0: {
            scale: 1,
        },
        0.5: {
            scale: 1.3
        },
        1: {
            scale: 1
        }
    }
    async function handleCheckPressed() {
        if (Platform.OS === 'android') {
            const checkEnabled = await isLocationEnabled();

            if (!checkEnabled) {
                await handleEnabledPressed();
            }
            else {
                await getData();
            }
        }
        else if (Platform.OS === 'ios') {

            await getData();

        }
    }

    async function handleEnabledPressed() {
        if (Platform.OS === 'android') {
            try {
                await promptForEnableLocationIfNeeded();
                await getData();
            } catch (error) {
                if (error instanceof Error) {
                    console.error(error.message);
                }
            }
        }
    }

    async function setLangandLat(latitude, longitude) {
        lang = longitude,
            lat = latitude
    }

    NavigateToBusinessDetails = (item) => {
        navigation.navigate("BusinessDetailView", { id: item })

    }

    const getData = async () => {
        AsyncStorage.getItem('token')
            .then(async (value) => {
                if (value != null) {
                    await axios({
                        method: 'GET',
                        url: `${baseUrl}/${(JSON.parse(value))[0].memberId}`
                    }).then(async response => {
                        await Geolocation.getCurrentPosition(
                            async position => {
                                const { latitude, longitude } = position.coords;
                                await setLangandLat(latitude, longitude);
                                await response.data.map((data1, index) => {
                                    const toRadian = n => (n * Math.PI) / 180
                                    let lat2 = data1.latitude
                                    let lon2 = data1.longitude
                                    let lat1 = lat
                                    let lon1 = lang

                                    let R = 6371  // km
                                    let x1 = lat2 - lat1
                                    let dLat = toRadian(x1)
                                    let x2 = lon2 - lon1
                                    let dLon = toRadian(x2)
                                    let a =
                                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                        Math.cos(toRadian(lat1)) * Math.cos(toRadian(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
                                    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                                    let d = R * c
                                    data1.distance = parseInt(d * 0.621371);
                                })
                                // Sort the data based on distance
                                response.data.sort((a, b) => { return a.distance - b.distance })
                                await setUserData(response.data);
                                await setFilteredData(response.data);
                                console.log(response.data)
                                setLoadingData(false)
                            },
                            error => {
                                console.error('Error getting current location: ', error);
                                setLoadingData(false)
                            },
                            { enableHighAccuracy: false, timeout: 5000 }
                        );

                    }).catch((error) => {
                        console.error("Error fetching data", error)
                    });
                }
            })
            .catch((error) => {
                console.log("Error retreiving data", error);
            });
    }

    useEffect(() => {
        handleCheckPressed();
    }, [focus]);

    const handleInputChange = (text) => {
        if (text === '') {
            setFilteredData(userData);
        } else {
            let data = userData.filter(item => {
                if (item.metaData !== null && item.metaData !== undefined && item.metaData !== '') {
                    return item.metaData.toLowerCase().includes(text.toLowerCase());
                }
            });
            setFilteredData(data);
        }
    }

    const likeProfile = (business) => {
        AsyncStorage.getItem('token')
            .then(async (value) => {
                if (value !== null) {
                    memberID = (JSON.parse(value))[0].memberId;
                    let currentDate = (new Date()).toISOString();
                    await fetch(Globals.API_URL + '/MembersWishLists/PostMemberWishlistInMobile', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "uniqueId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                            "id": 0,
                            "memberId": memberID,
                            "notes": null,
                            "badgeId": 1,
                            "tagId": null,
                            "businessGroupId": business.businessGroupID,
                            "lastVisitDate": null,
                            "lifeTimePoints": 0,
                            "lifeTimeVisits": 0,
                            "smsoptIn": false,
                            "emailOptIn": ((JSON.parse(value))[0].emailId == '' || (JSON.parse(value))[0].emailId == null ||
                                (JSON.parse(value))[0].emailId == undefined) ? false : true,
                            "notificationOptIn": true,
                            "isHighroller": false,
                            "currentPoints": 0,
                            "sourceId": 14,
                            "stateId": 3,
                            "isActive": true,
                            "createdBy": memberID,
                            "createdDate": currentDate,
                            "lastModifiedBy": memberID,
                            "lastModifiedDate": currentDate,
                            "businessLocationID": business.id,
                            "baseLocationID": business.id
                        }),
                    }).then(async (res) => {
                        Toast.show(
                            'Liked!',
                            Toast.LONG,
                            Toast.BOTTOM,
                        );
                        await handleCheckPressed();
                    }).catch((error) => {
                        console.log("Error fetching data:/", error)
                        setLoading(false);
                    });
                    ;
                } else {
                    console.log('not available')
                }
            })
            .catch(error => {
                console.error('Error retrieving dataa:', error);
                setLoading(false);
            });
    }
    return (
        <>
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', width: '97%', height: '15%', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={styles.welcomeText}>Where to go?</Text>
                    <TouchableOpacity activeOpacity={.7} onPress={() => navigation.navigate('NotificationTray')}>
                        <Image source={require('../assets/notification-oRK.png')} style={styles.setimg1} />
                    </TouchableOpacity>
                </View>

                <View style={{ width: '97%', height: '93%', marginTop: '-5%' }}>
                    <View style={styles.searchBoxMain}>
                        <TextInput style={styles.searchInput} placeholder='Search..' onChangeText={text => handleInputChange(text)} />
                        <Image style={styles.magnifyingGlass} source={require('../assets/magnifyingglass-qQV.png')} />
                        <TouchableOpacity style={{ width: '16%', marginRight: '2%', }} activeOpacity={.7} onPress={() => navigation.navigate("MapViewing")}>
                            <View style={styles.mainMapImage}>
                                <Image style={styles.mapImage} source={require('../assets/mapImg.png')} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.store}>
                        {loadingData ?
                            <>
                                <SafeAreaView style={styles.scrollContainer}>
                                    <ScrollView style={{ flex: 1, height: '100%', width: '100%', borderRadius: 50 }} showsVerticalScrollIndicator={false}>
                                        <LinearGradient
                                            colors={['#b0bec5', '#e1e1e1', '#b0bec5']}
                                            style={[styles.gradient, { marginTop: 10 }]}>
                                            <View style={{ width: '100%', height: 220, }}>
                                                <ShimmerPlaceHolder
                                                    style={styles.shimmer}
                                                    shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                                >
                                                </ShimmerPlaceHolder>
                                            </View>

                                            <View style={{ width: '100%', height: 80, flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={{ width: '40%', height: '90%', marginLeft: 2 }}>
                                                    <ShimmerPlaceHolder
                                                        style={styles.shimmer}
                                                        shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                                    >
                                                    </ShimmerPlaceHolder>
                                                </View>
                                                <View style={{ width: '55%', height: '90%', marginLeft: 10, justifyContent: 'center' }}>
                                                    <View style={{ width: '85%', height: '35%' }}>
                                                        <ShimmerPlaceHolder
                                                            style={styles.shimmer}
                                                            shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                                        >
                                                        </ShimmerPlaceHolder>
                                                    </View>
                                                    <View style={{ width: '60%', height: '25%', marginTop: 10 }}>
                                                        <ShimmerPlaceHolder
                                                            style={styles.shimmer}
                                                            shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                                        >
                                                        </ShimmerPlaceHolder>
                                                    </View>
                                                </View>
                                            </View>
                                        </LinearGradient>

                                        <LinearGradient
                                            colors={['#b0bec5', '#e1e1e1', '#b0bec5']}
                                            style={[styles.gradient, { marginTop: 10 }]}>
                                            <View style={{ width: '100%', height: 220 }}>
                                                <ShimmerPlaceHolder
                                                    style={styles.shimmer}
                                                    shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                                >
                                                </ShimmerPlaceHolder>
                                            </View>

                                            <View style={{ width: '100%', height: 80, flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={{ width: '40%', height: '90%', marginLeft: 2 }}>
                                                    <ShimmerPlaceHolder
                                                        style={styles.shimmer}
                                                        shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                                    >
                                                    </ShimmerPlaceHolder>
                                                </View>
                                                <View style={{ width: '55%', height: '90%', marginLeft: 10, justifyContent: 'center' }}>
                                                    <View style={{ width: '85%', height: '35%' }}>
                                                        <ShimmerPlaceHolder
                                                            style={styles.shimmer}
                                                            shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                                        >
                                                        </ShimmerPlaceHolder>
                                                    </View>
                                                    <View style={{ width: '60%', height: '25%', marginTop: 10 }}>
                                                        <ShimmerPlaceHolder
                                                            style={styles.shimmer}
                                                            shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                                        >
                                                        </ShimmerPlaceHolder>
                                                    </View>
                                                </View>
                                            </View>
                                        </LinearGradient>
                                    </ScrollView>
                                </SafeAreaView>
                            </> :
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={filteredData}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => {
                                    return (
                                        <Card style={styles.card} onPress={() => this.NavigateToBusinessDetails(item.id)}>
                                            <Card.Cover source={{ uri: Globals.Root_URL + item.imagePath }} style={styles.cardCover} />
                                            <Card.Content style={styles.cardContent}>
                                                <View style={{ width: '30%', height: '90%', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Image style={styles.avatarImg} source={{ uri: Globals.Root_URL + item.logoPath }}></Image>
                                                </View>
                                                <View style={{ width: '70%', height: '100%' }}>
                                                    {(item.businessName).toString().length < 20 && <Title style={{ fontSize: 16, fontWeight: '800', color: '#3b3939' }}> {item.businessName}</Title>}
                                                    {(item.businessName).toString().length >= 20 && <Title style={{ fontSize: 16, fontWeight: '800', color: '#3b3939' }}> {(item.businessName).toString().substring(0, 20)}...</Title>}
                                                    <Text style={{ color: '#717679', fontWeight: '500' }}> {item.industry} </Text>
                                                    <View style={{ flexDirection: 'row', width: '85%', justifyContent: 'space-between' }}>
                                                        <Text style={styles.milesText}> {item.distance} mi </Text>
                                                        {(item.isLiked == false) && <TouchableOpacity activeOpacity={.7} onPress={() => likeProfile(item)}>
                                                            <Animatable.Image animation={pulse} easing="ease-in-out" iterationCount="infinite"
                                                                style={{ width: 25, height: 25, left: '41%', position: 'absolute' }} source={require('../assets/likeOutline.png')} />
                                                        </TouchableOpacity>}
                                                        {(item.isLiked == true) && <TouchableOpacity activeOpacity={.7}>
                                                            <Image source={require('../assets/likeFill.png')} style={{ width: 25, height: 25, left: '41%', position: 'absolute' }}></Image>
                                                        </TouchableOpacity>}
                                                    </View>
                                                </View>
                                            </Card.Content>
                                        </Card>
                                    );
                                }}
                            />
                        }
                    </View>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        paddingTop: '5%',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        borderRadius: 50
    },
    gradient: {
        width: '100%',
        height: 300,
        borderRadius: 10
    },
    shimmer: {
        width: '100%',
        height: '100%',
        borderRadius: 10
    },

    cardContent: {
        marginHorizontal: '2%',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    avatarImg: {
        height: 50,
        width: 110,
        marginTop: '-55%',
        marginRight: '20%',
        borderRadius: 10
    },
    cardCover: {
        height: 190,
        width: '100%'
    },
    card: {
        marginBottom: 10,
        height: 300,
        width: '100%',
    },
    store: {
        width: '97%',
        flexShrink: 0,
        marginTop: '2%',
        alignSelf: 'center',
        marginBottom: '27%'
    },
    mapImage: {
        width: 26,
        height: 24,
        objectFit: 'contain',
    },
    mainMapImage: {
        padding: 14,
        paddingHorizontal: 20,
        paddingBottom: 12,
        paddingLeft: '40%',
        height: '100%',
        backgroundColor: '#3380a3',
        borderRadius: 8,
        flexShrink: 0,
        marginRight: '-15%'
    },
    magnifyingGlass: {
        height: 26.028,
        resizeMode: 'contain',
        backgroundColor: 'transparent',
        marginLeft: '52%',
        position: 'absolute'
    },
    searchInput: {
        width: '50%',
        height: 50,
        padding: 13.97,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        flex: 1,
        marginRight: '2%'
    },
    searchBoxMain: {
        marginLeft: '2%',
        flexDirection: 'row',
        alignItems: 'center',
        display: 'flex',
        flexShrink: 0,
        height: 50,
        marginTop: 10
    },
    notificationLbl: {
        width: 48,
        height: 48,
        resizeMode: 'contain',
        flex: 0,
        marginTop: '1%',
        left: '190%'
    },
    textWhere: {
        marginLeft: '2%',
        fontSize: 23,
        fontWeight: '900',
        color: '#000000',
        fontFamily: 'Satoshi-Variable, "Source Sans Pro"',
    },
    header: {
        margin: '2%',
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: '15%'
    },
    grpSearch: {
        padding: '0rem 0.8rem 1.6rem 0.7rem',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 0,
        flexDirection: 'row'
    },
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center',
    },
    setimg1: {
        width: 50,
        height: 50,
        marginTop: -16,
        position: 'absolute',
        alignSelf: 'flex-end',
        right: -30
    },
    milesText: {
        color: '#73a5bc',
        fontSize: 14,
        fontWeight: '700'
    },
    welcomeText: {
        color: 'black',
        fontSize: 18,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginTop: '5%',
        textAlign: 'center',
        width: '80%'
    },
})

export default Location;