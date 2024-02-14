import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, Text, View, Modal, Platform, Pressable, TouchableWithoutFeedback } from 'react-native';
import { TouchableOpacity } from 'react-native';
import Globals from '../components/Globals';
import { Card } from 'react-native-paper';
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment/moment';
import Toast from 'react-native-simple-toast';
import * as Animatable from 'react-native-animatable';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import LinearGradient from 'react-native-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)
const Favourite = ({ navigation }) => {
    lang = 0;
    lat = 0;
    const wishListUrl = `${Globals.API_URL}/MembersWishLists/GetMemberWishListByMemberID`;
    const [announcementClaimData, setAnnouncementClaimData] = useState([]);
    const [wishList, setWishList] = useState([]);
    const [promotionClaimData, setPromotionClaimData] = useState([]);
    const [autoPilotClaimData, setAutoPilotClaimData] = useState([]);
    const [businessClaimData, setbusinessClaimData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [earnerRewards, setEarnedRevards] = useState([]);
    const isFocused = useIsFocused();
    const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
    const [isAutoPilotModalVisible, setIsAutoPilotModalVisible] = useState(false);
    const [isAnnouncementModalVisible, setIsAnnouncementModalVisible] = useState(false);

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
    async function setLangandLat(latitude, longitude) {
        lang = longitude;
        lat = latitude;
    }

    memberID = 0;
    async function setEarnedRevardsData(value) {
        setEarnedRevards(value);
    }

    async function setWishListData(value) {
        setWishList(value);
    }

    const setIsPromoModalVisibleData = async (promotion, businessdata) => {
        setIsPromoModalVisible(true);
        setPromotionClaimData(promotion);
        setbusinessClaimData(businessdata);
    }
    const setIsAPModalVisibleData = async (autopilot, businessdata) => {
        setIsAutoPilotModalVisible(true);
        setAutoPilotClaimData(autopilot);
        setbusinessClaimData(businessdata);
    }
    const setIsAnnouncementModalVisibleData = async (announcement, businessdata) => {
        setIsAnnouncementModalVisible(true);
        setAnnouncementClaimData(announcement);
        setbusinessClaimData(businessdata);
    }
    const openPromoModal = async (promotion, item) => {
        setLoading(true)
        await setIsPromoModalVisibleData(promotion, item);
        setLoading(false)
    }
    const openAPModal = async (autopilot, item) => {
        setLoading(true)
        await setIsAPModalVisibleData(autopilot, item);
        setLoading(false)
    }
    const openAnnouncementModal = async (announcement, item) => {
        setLoading(true)
        await setIsAnnouncementModalVisibleData(announcement, item);
        setLoading(false)
    }
    const closePromoModal = () => {
        setLoading(true);
        setIsPromoModalVisible(false);
        setLoading(false);
    }
    const closeAPModal = () => {
        setLoading(true);
        setIsAutoPilotModalVisible(false);
        setLoading(false);
    }
    const closeAnnouncementModal = () => {
        setLoading(true);
        setIsAnnouncementModalVisible(false);
        setLoading(false);
    }

    const closePromoRedeemModal = async (type, ID) => {
        setLoading(true)
        await axios({
            method: 'GET',
            url: `${Globals.API_URL}/Promotions/GetRewardsByActivityTypeAndIDInMobile/${type}/${ID}`
        }).then(async (response) => {
            setIsPromoModalVisible(false);
            if (Platform.OS === 'ios') {
                Toast.show(
                    `Claimed Successfully!`,
                    Toast.LONG,
                    Toast.CENTER,
                    {
                        backgroundColor: 'blue'
                    }
                )
            }
            await getRefreshData();
        }).catch(error => {
            console.error('Error retrieving dataa:', error);
            setLoading(false);
        });
    }
    const closeAutoPilotRedeemModal = async (type, ID) => {
        setLoading(true)
        await axios({
            method: 'GET',
            url: `${Globals.API_URL}/Promotions/GetRewardsByActivityTypeAndIDInMobile/${type}/${ID}`
        }).then(async (response) => {
            if (Platform.OS === 'ios') {
                Toast.show(
                    `Claimed Successfully!`,
                    Toast.LONG,
                    Toast.CENTER,
                    {
                        backgroundColor: 'blue'
                    }
                )
            }
            await getRefreshData();

            setIsAutoPilotModalVisible(false);
        }).catch(error => {
            console.error('Error retrieving dataa:', error);
            setLoading(false);
        });
    }

    const getRefreshData = () => {
        AsyncStorage.getItem('token')
            .then(async (value) => {
                if (value !== null) {
                    await axios({
                        method: 'GET',
                        url: `${wishListUrl}/${(JSON.parse(value))[0].memberId}`
                    }).then(async (response) => {
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

                                response.data = response.data.sort((a, b) => { return a.distance - b.distance });
                                await setWishListData(response.data);
                                setLoading(false)
                            },
                            error => {
                                console.error('Error getting current location: ', error);
                            },
                            { enableHighAccuracy: false, timeout: 5000 }
                        );
                    });
                }
            }).catch(error => {
                console.error('Error retrieving dataa:', error);
                setLoading(false);
            });
    }

    const ToastForClaimed = () => {
        if (Platform.OS === 'ios') {
            Toast.show(
                `You've already Claimed!`,
                Toast.SHORT,
                Toast.CENTER,
                {
                    backgroundColor: 'blue'
                }
            )
        }
    }
    useEffect(() => {
        getRefreshData()
    }, [isFocused]);

    const likeProfile = (business) => {
        setLoading(true);
        AsyncStorage.getItem('token')
            .then(async (value) => {
                if (value !== null) {
                    await wishList.map((data1, index) => {
                        if (business.businessId == data1.businessId) {
                            data1.isLiked = true;
                        }
                    })
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
                            "memberId": (JSON.parse(value))[0].memberId,
                            "notes": null,
                            "badgeId": 1,
                            "tagId": null,
                            "businessGroupId": business.businessGroupId,
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
                            "createdBy": (JSON.parse(value))[0].memberId,
                            "createdDate": currentDate,
                            "lastModifiedBy": (JSON.parse(value))[0].memberId,
                            "lastModifiedDate": currentDate,
                            "businessLocationID": business.businessId,
                            "baseLocationID": business.businessId
                        }),
                    }).then(async (res) => {
                        Toast.show(
                            'Liked!',
                            Toast.LONG,
                            Toast.BOTTOM,
                            25,
                            50,
                        );
                        await getRefreshData();
                    }).catch(async (error) => {
                        await wishList.map((data1, index) => {
                            if (business.businessId == data1.businessId) {
                                data1.isLiked = true;
                            }
                        })
                        setLoading(false)
                    });
                    ;
                } else {
                    console.error('Error retrieving dataa:', error);
                    setLoading(false);
                }
            })
            .catch(error => {
                console.error('Error retrieving dataa:', error);
                setLoading(false);
            });
    }

    return (
        <View style={styles.container} >
            <View style={{ flexDirection: 'row', width: '97%', height: '17%', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <Text style={styles.welcomeText}>Favorite</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('NotificationTray')}>
                    <Image source={require('../assets/notification-swo.png')} style={styles.setimg1} />
                </TouchableOpacity>
            </View>
            <SafeAreaView style={styles.scrollContainer}>
                {(wishList.length == 0 && !loading) &&
                    <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Image style={{ width: '70%', height: '40%', opacity: 0.8, borderRadius: 15 }} source={require('../assets/NodataImg.png')} />
                    </View>
                }
                <ScrollView style={{ flex: 1, height: '100%', width: '100%', borderRadius: 50 }} showsVerticalScrollIndicator={false}>
                    {loading ?
                        <>
                            <LinearGradient
                                colors={['#b0bec5', '#e1e1e1', '#b0bec5']}
                                style={[styles.gradient, , { marginTop: 10 }]}>
                                <View style={{ width: '40%', height: 70, marginTop: 10 }}>
                                    <ShimmerPlaceholder
                                        style={styles.shimmer}
                                        shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                    >
                                    </ShimmerPlaceholder>
                                </View>
                                <View style={{ width: '75%', height: 25, marginTop: 10 }}>
                                    <ShimmerPlaceholder
                                        style={styles.shimmer}
                                        shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                    >
                                    </ShimmerPlaceholder>
                                </View>
                                <View style={{ width: '65%', height: 15, marginTop: 5 }}>
                                    <ShimmerPlaceholder
                                        style={styles.shimmer}
                                        shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                    >
                                    </ShimmerPlaceholder>
                                </View>
                                <View style={{ width: '50%', height: 15, marginTop: 15 }}>
                                    <ShimmerPlaceholder
                                        style={styles.shimmer}
                                        shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                    >
                                    </ShimmerPlaceholder>
                                </View>

                                <View style={{ width: '100%', flexDirection: 'row' }}>
                                    <View style={{ width: '40%', height: 125, marginTop: 15 }}>
                                        <ShimmerPlaceholder
                                            style={styles.shimmer}
                                            shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                        >
                                        </ShimmerPlaceholder>
                                    </View>
                                    <View style={{ width: '40%', height: 125, marginTop: 15, marginLeft: 10 }}>
                                        <ShimmerPlaceholder
                                            style={styles.shimmer}
                                            shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                        >
                                        </ShimmerPlaceholder>
                                    </View>
                                </View>
                            </LinearGradient>

                            <LinearGradient
                                colors={['#b0bec5', '#e1e1e1', '#b0bec5']}
                                style={[styles.gradient, { marginTop: 10 }]}>
                                <View style={{ width: '40%', height: 70, marginTop: 10 }}>
                                    <ShimmerPlaceholder
                                        style={styles.shimmer}
                                        shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                    >
                                    </ShimmerPlaceholder>
                                </View>
                                <View style={{ width: '75%', height: 25, marginTop: 10 }}>
                                    <ShimmerPlaceholder
                                        style={styles.shimmer}
                                        shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                    >
                                    </ShimmerPlaceholder>
                                </View>
                                <View style={{ width: '65%', height: 15, marginTop: 5 }}>
                                    <ShimmerPlaceholder
                                        style={styles.shimmer}
                                        shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                    >
                                    </ShimmerPlaceholder>
                                </View>
                                <View style={{ width: '50%', height: 15, marginTop: 15 }}>
                                    <ShimmerPlaceholder
                                        style={styles.shimmer}
                                        shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                    >
                                    </ShimmerPlaceholder>
                                </View>

                                <View style={{ width: '100%', flexDirection: 'row' }}>
                                    <View style={{ width: '40%', height: 125, marginTop: 15 }}>
                                        <ShimmerPlaceholder
                                            style={styles.shimmer}
                                            shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                        >
                                        </ShimmerPlaceholder>
                                    </View>
                                    <View style={{ width: '40%', height: 125, marginTop: 15, marginLeft: 10 }}>
                                        <ShimmerPlaceholder
                                            style={styles.shimmer}
                                            shimmerColors={['#f3f3f3', '#e1e1e1', '#f3f3f3']}
                                        >
                                        </ShimmerPlaceholder>
                                    </View>
                                </View>
                            </LinearGradient>
                        </> :
                        <View style={styles.wishlistView}>
                            {wishList && wishList.map((item, index) => (
                                <View key={index} style={[styles.listView, isPromoModalVisible ? { opacity: 0.4 } : '', isAutoPilotModalVisible ? { opacity: 0.4 } : '',
                                isAnnouncementModalVisible ? { opacity: 0.4 } : '']}>
                                    <Image source={{ uri: Globals.Root_URL + item.logoPath }} style={styles.logoBusiness} />
                                    <View style={{ position: 'absolute', right: '1%', flexDirection: 'row' }}>
                                        {item.isLiked && <Image style={styles.likeFillHeart} source={require('../assets/likeFill.png')} />}
                                        {!item.isLiked &&
                                            <TouchableOpacity activeOpacity={.7} onPress={() => likeProfile(item)}>
                                                <Animatable.Image
                                                    animation={pulse}
                                                    easing="ease-in-out"
                                                    iterationCount="infinite" style={styles.likeHeart} source={require('../assets/likeOutline.png')} />
                                            </TouchableOpacity>
                                        }
                                        <Text style={styles.totalLikes}> {item.likeCount} Likes </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity activeOpacity={.7} onPress={() => navigation.navigate('BusinessDetailView', { id: item.businessId })}>
                                            <Text style={styles.businessName}>{item.businessName}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={styles.industry}>{item.industry} | </Text>
                                        <Text style={{ color: '#73a5bc', fontWeight: '600', fontSize: 15 }}> {item.distance} mi </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', width: '100%', marginTop: 10 }}>
                                        <Text style={styles.memberDetails}>
                                            Member Since - {moment(item.createdDate).format("MM/DD/YYYY")}
                                        </Text>
                                        <View style={{
                                            flexDirection: 'row', alignItems: 'center', right: 0, position: 'absolute',
                                            borderColor: '#d9e7ed', borderWidth: 2, justifyContent: 'center', padding: 6, borderRadius: 25, marginTop: '-3%'
                                        }}>
                                            <View style={{ justifyContent: 'center', paddingHorizontal: 8 }}>
                                                {(item.badgeName).toString().toLowerCase() == 'bronze' && <Image source={require('../assets/Bronze.png')} style={[styles.trophyImg]} />}
                                                {(item.badgeName).toString().toLowerCase() == 'silver' && <Image source={require('../assets/Silver.png')} style={[styles.trophyImg]} />}
                                                {(item.badgeName).toString().toLowerCase() == 'gold' && <Image source={require('../assets/Gold.png')} style={[styles.trophyImg]} />}
                                                {(item.badgeName).toString().toLowerCase() == 'platinum' && <Image source={require('../assets/platinum.png')} style={[styles.trophyImg]} />}
                                            </View>
                                            <View>
                                                <Text style={styles.badge}> {item.badgeName} </Text>
                                                <Text style={styles.memberPoints}> {item.currentPoints} pt </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.cardView}>
                                            {item.promotionData.map((promotion, earnReward) => (
                                                <Card key={earnReward} style={[{ width: 180, borderRadius: 20, paddingHorizontal: 2, height: 150, marginRight: 10, marginBottom: 5, backgroundColor: '#f4f5f5' }, isPromoModalVisible ? { opacity: 0.4 } : '',
                                                isAutoPilotModalVisible ? { opacity: 0.4 } : '', isAnnouncementModalVisible ? { opacity: 0.4 } : '']}>
                                                    <Text style={styles.achievableName}>{promotion.promotionalMessage}</Text>
                                                    {promotion.expiryDays > 1 && <Text style={styles.achievalbeValue}>Expires in - {promotion.expiryDays} days</Text>}
                                                    {promotion.expiryDays == 1 && <Text style={styles.achievalbeValue}>Expiring Today</Text>}
                                                    <TouchableOpacity activeOpacity={.7} onPress={() => openPromoModal(promotion, item)} style={[promotion.isClaimed == false ? styles.frame2vJuClaim : styles.frame2vJuClaimed]}>
                                                        {promotion.isClaimed == false && <Text style={styles.getStartednru}>Claim</Text>}
                                                        {promotion.isClaimed == true && <Text style={styles.getStartednru}>Claimed</Text>}
                                                    </TouchableOpacity>
                                                </Card>
                                            ))}

                                            {item.autopilotData.map((autopilot, earnReward) => (
                                                <Card key={earnReward} style={[{ width: 150, borderRadius: 20, paddingHorizontal: 2, height: 150, marginRight: 10, marginBottom: 5, backgroundColor: '#f4f5f5' }, isPromoModalVisible ? { opacity: 0.4 } : '',
                                                isAutoPilotModalVisible ? { opacity: 0.4 } : '', isAnnouncementModalVisible ? { opacity: 0.4 } : '']}>
                                                    <Text style={styles.achievableName}>{autopilot.rewardName}</Text>
                                                    {autopilot.expiryDays > 1 && <Text style={styles.achievalbeValue}>Expires in - {autopilot.expiryDays} days</Text>}
                                                    {autopilot.expiryDays == 1 && <Text style={styles.achievalbeValue}>Expiring Today</Text>}
                                                    {/* {autopilot.expiryDays == 0 &&<Text style={styles.achievalbeValue}>Expiring Today</Text>} */}
                                                    <TouchableOpacity activeOpacity={.7} onPress={() => openAPModal(autopilot, item)} style={[autopilot.isClaimed == false ? styles.frame2vJuClaim : styles.frame2vJuClaimed]}>
                                                        {autopilot.isClaimed == false && <Text style={styles.getStartednru}>Claim</Text>}
                                                        {autopilot.isClaimed == true && <Text style={styles.getStartednru}>Claimed</Text>}
                                                    </TouchableOpacity>
                                                </Card>
                                            ))}

                                            {item.announcementData.map((announcement, earnReward) => (
                                                <Card key={earnReward} style={[{ width: 150, borderRadius: 20, paddingHorizontal: 2, height: 150, marginRight: 10, marginBottom: 5, backgroundColor: '#f4f5f5' }, isPromoModalVisible ? { opacity: 0.4 } : '',
                                                isAutoPilotModalVisible ? { opacity: 0.4 } : '', isAnnouncementModalVisible ? { opacity: 0.4 } : '']}>
                                                    <Text style={styles.achievableName}>{announcement.subject}</Text>
                                                    <TouchableOpacity activeOpacity={.7} onPress={() => openAnnouncementModal(announcement, item)} style={styles.ViewAnnouncement}>
                                                        <Text style={styles.getStartednru}>View</Text>
                                                    </TouchableOpacity>
                                                </Card>
                                            ))}

                                            {item.rewardData.map((reward, earnReward) => (
                                                <Card key={earnReward} style={[{ width: 150, borderRadius: 20, height: 150, paddingHorizontal: 2, marginRight: 10, marginBottom: 5, backgroundColor: '#f4f5f5' }, isPromoModalVisible ? { opacity: 0.4 } : '',
                                                isAutoPilotModalVisible ? { opacity: 0.4 } : '', isAnnouncementModalVisible ? { opacity: 0.4 } : '']}>
                                                    <Text style={styles.achievableName}>{reward.rewardName}</Text>
                                                    <Text style={styles.achievalbeValue}>{reward.achivableTargetValue} pts</Text>
                                                    <View>
                                                        <Progress.Bar
                                                            style={styles.progressBar}
                                                            progress={1 - ((reward.pendingToAchiveValue) / reward.achivableTargetValue)}
                                                            width={110}
                                                            color='#2ac95d' />
                                                    </View>
                                                    {(reward.pendingToAchiveValue > 0) && <Text style={styles.pendingpoints}>{reward.pendingToAchiveValue} left</Text>}
                                                    {(reward.pendingToAchiveValue <= 0) && <Text style={styles.pendingpoints}>0 left</Text>}
                                                </Card>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            ))
                            }
                        </View >
                    }
                </ScrollView >
            </SafeAreaView >


            <Modal
                animationType={'slide'}
                transparent={true}
                visible={isPromoModalVisible}
                onRequestClose={() => {
                    console.log('Modal has been closed.');
                }}>
                <View style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={styles.modal}>
                        <View style={{ flexDirection: 'row', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={{ uri: Globals.Root_URL + businessClaimData.logoPath }} style={styles.logoBusinessInModal} />

                            <TouchableOpacity activeOpacity={.7} onPress={closePromoModal} style={styles.cancelImgContainer}>
                                <Image source={require('../assets/cancelImg.png')} style={styles.cancelImg} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalbusinessName}>{businessClaimData.businessName}</Text>
                        <Text style={styles.modalPromoMsg}>DEAL : {promotionClaimData.promotionalMessage}</Text>
                        <Text style={styles.modaltext}><Text style={{ fontWeight: '700' }}>Offer Start Date </Text>- {moment(promotionClaimData.offerStartDate).format("MM/DD/YYYY")}</Text>
                        <Text style={styles.modaltext}><Text style={{ fontWeight: '700' }}>Offer End Date </Text>- {moment(promotionClaimData.offerEndDate).format("MM/DD/YYYY")}</Text>
                        {promotionClaimData.expiryDays > 1 && <Text style={styles.modaltext}><Text style={{ fontWeight: '700' }}>Expires in </Text>- {promotionClaimData.expiryDays} days</Text>}
                        {promotionClaimData.expiryDays == 1 && <Text style={styles.modaltext}><Text style={{ fontWeight: '700' }}>Expiring Today </Text></Text>}
                        {promotionClaimData.isSpinWheel && <Text style={styles.modaltext}>Spin the wheel and get rewards at store</Text>}
                        {(promotionClaimData.filePath != '' && promotionClaimData.filePath != null) && <Image style={styles.avatarImg} source={{ uri: Globals.Root_URL + promotionClaimData.filePath }} ></Image>}
                        <Text style={styles.modaltext}>Redeemable at -<Text style={{ fontWeight: '700' }}> {promotionClaimData.redeemableAt}</Text></Text>
                        {promotionClaimData.isClaimed == false && <TouchableOpacity activeOpacity={.7} onPress={() => closePromoRedeemModal('promo', promotionClaimData.id)} style={styles.frame2vJu1ModalClaim}>
                            <Text style={styles.getStartednru1}>Claim</Text>
                        </TouchableOpacity>}
                        {promotionClaimData.isClaimed == true &&
                            <TouchableOpacity activeOpacity={.7} style={styles.frame2vJu1ModalBack} onPress={ToastForClaimed}>
                                <Text style={styles.getStartednru1}>Claimed</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </Modal>

            <Modal
                animationType={'slide'}
                transparent={true}
                visible={isAutoPilotModalVisible}
                onRequestClose={() => {
                    console.log('Modal has been closed.');
                }}>
                <View style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={styles.modal}>
                        <View style={{ flexDirection: 'row', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={{ uri: Globals.Root_URL + businessClaimData.logoPath }} style={styles.logoBusinessInModal} />
                            <TouchableOpacity activeOpacity={.7} onPress={closeAPModal} style={styles.cancelImgContainer}>
                                <Image source={require('../assets/cancelImg.png')} style={styles.cancelImg} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalbusinessName}>{businessClaimData.businessName}</Text>
                        <Text style={styles.modalPromoMsg}>{autoPilotClaimData.rewardName}</Text>
                        {autoPilotClaimData.expiryDays > 1 && <Text style={styles.modaltext}><Text style={{ fontWeight: '700' }}>Expires in </Text>- {autoPilotClaimData.expiryDays} days</Text>}
                        {autoPilotClaimData.expiryDays == 1 && <Text style={styles.modaltext}><Text style={{ fontWeight: '700' }}>Expiring Today</Text></Text>}
                        {(autoPilotClaimData.filePath != '' && autoPilotClaimData.filePath != null) && <Image style={styles.avatarImg} source={{ uri: Globals.Root_URL + autoPilotClaimData.filePath }} ></Image>}
                        <Text style={styles.modaltext}>Redeemable at -<Text style={{ fontWeight: '700' }}> Any Locations</Text></Text>
                        {autoPilotClaimData.isClaimed == false && <TouchableOpacity activeOpacity={.7} onPress={() => closeAutoPilotRedeemModal('ap', autoPilotClaimData.historyId)} style={styles.frame2vJu1ModalClaim}>
                            <Text style={styles.getStartednru1}>Claim</Text>
                        </TouchableOpacity>}
                        {autoPilotClaimData.isClaimed == true &&
                            <TouchableOpacity activeOpacity={.7} style={styles.frame2vJu1ModalBack} onPress={ToastForClaimed}>
                                <Text style={styles.getStartednru1}>Claimed</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </Modal>

            <Modal
                animationType={'slide'}
                transparent={true}
                visible={isAnnouncementModalVisible}
                onRequestClose={() => {
                    console.log('Modal has been closed.');
                }}>
                <View style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={styles.modal}>
                        <View style={{ flexDirection: 'row', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={{ uri: Globals.Root_URL + businessClaimData.logoPath }} style={styles.logoBusinessInModal} />
                            <TouchableOpacity activeOpacity={.7} onPress={closeAnnouncementModal} style={styles.cancelImgContainer}>
                                <Image source={require('../assets/cancelImg.png')} style={styles.cancelImg} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalbusinessName}>{businessClaimData.businessName}</Text>
                        <Text style={styles.modalPromoMsg}>{announcementClaimData.subject}</Text>
                        {announcementClaimData.validDate && <Text style={[styles.modaltext, { textAlign: 'center' }]}><Text style={{ fontWeight: '700' }}>Expiry Date: </Text>{moment(announcementClaimData.validDate).format("MM/DD/YYYY")}</Text>}
                        {(announcementClaimData.fileName != '' && announcementClaimData.fileName != null) && <Image style={styles.avatarImg} source={{ uri: Globals.Root_URL + announcementClaimData.fileName }} ></Image>}
                    </View>
                </View>
            </Modal>
        </View >
    );
};

const styles = StyleSheet.create({
    ViewAnnouncement: {
        backgroundColor: '#6b6868',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        height: 35,
        position: 'absolute',
        top: 105,
        alignSelf: 'center',
        marginTop: 5
    },
    gradient: {
        width: '100%',
        height: 350,
        borderRadius: 10,
        marginLeft: 7,
        paddingLeft: 10
    },
    shimmer: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    cancelImgContainer: {
        alignSelf: 'flex-end',
        position: 'absolute',
        right: 0,
        height: 50,
        justifyContent: 'flex-start'
    },
    cancelImg: {
        width: 25,
        height: 25,
        marginTop: 5,
        marginEnd: 5
    },
    scrollContainer: {
        height: '100%',
        width: '100%',
        alignItems: 'center',
        borderRadius: 50,
        marginTop: '-15%',
    },
    modalcontainer: {
        flex: 1,
        backgroundColor: '#fff',
        width: '100%',
        height: '100%',
        backgroundColor: '#000'
    },
    avatarImg: {
        height: 150,
        width: 150,
        marginVertical: 7,
        alignSelf: 'center',
        borderRadius: 15
    },
    suncontainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modcontainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute'
    },
    modal: {
        alignSelf: 'center',
        backgroundColor: '#fff',
        width: '85%',
        position: 'relative',
        borderRadius: 15,
        padding: 5
    },
    modaltext: {
        color: '#3f2949',
        marginTop: 5,
        paddingHorizontal: 10
    },
    cardView: {
        width: 150,
        height: 150,
        marginRight: 9,
        marginTop: 50
    },
    frame2vJuClaim: {
        backgroundColor: '#7d5513',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        height: 35,
        position: 'absolute',
        top: 105,
        alignSelf: 'center',
        marginTop: 5
    },
    frame2vJuClaimed: {
        backgroundColor: '#6b6868',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        height: 35,
        position: 'absolute',
        top: 105,
        alignSelf: 'center',
        marginTop: 5
    },
    frame2vJu1ModalClaim: {
        backgroundColor: '#7d5513',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        height: 35,
        marginVertical: 15,
        alignSelf: 'center'
    },
    frame2vJu1ModalBack: {
        backgroundColor: '#969696',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        height: 35,
        marginVertical: 15,
        alignSelf: 'center'
    },
    getStartednru: {
        lineHeight: 22.5,
        fontFamily: 'SatoshiVariable, SourceSansPro',
        flexShrink: 0,
        fontWeight: 'bold',
        fontSize: 14,
        color: '#ffffff',
        flex: 10,
        zIndex: 10,
        textAlign: 'center',
        textAlignVertical: 'center',
        top: '15%'
    },
    ViewBtnImg: {
        height: 15,
        width: 15
    },
    getStartednru1: {
        lineHeight: 22.5,
        fontFamily: 'SatoshiVariable, SourceSansPro',
        flexShrink: 0,
        fontWeight: 'bold',
        fontSize: 14,
        color: '#ffffff',
        flex: 10,
        zIndex: 10,
        textAlign: 'center',
        textAlignVertical: 'center',
        top: '15%'
    },
    pendingpoints: {
        color: '#73a5bc',
        fontWeight: '800',
        top: 50,
        // left: 40,
        alignSelf: 'center',
        bottom: 12,
        fontSize: 13
    },
    progressBar: {
        top: 40,
        left: 15
    },
    achievalbeValue: {
        color: '#717679',
        fontWeight: '700',
        fontSize: 15,
        top: '80%',
        alignSelf: 'center',
        padding: '2%',
        position: 'absolute',
        // marginTop:'-10%'
    },
    achievableName: {
        fontWeight: '700',
        color: '#000000',
        fontSize: 15,
        width: 160,
        height: 70,
        paddingHorizontal: 5,
        paddingVertical: 7,
        textAlign: 'center',
        right: 5
    },
    scrollviewContainer: {
        flex: 1,
        height: '100%',
        width: '97%',
        borderRadius: 50
    },
    badge: {
        color: '#000000',
        fontWeight: '700',
        // alignSelf: 'center',
        // top: '20%',
        fontSize: 12
    },
    memberPoints: {
        color: '#73a5bc',
        fontWeight: '800',
        // top: 40,
        // left: 57,
        // bottom: 20,
        fontSize: 12
    },
    trophyImg: {
        width: 20,
        height: 15,
        // alignSelf: 'center',
        // top: '30%'
    },
    cardView: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30
    },
    memberDetails: {
        color: '#203139',
        fontWeight: '700',
        fontSize: 14
    },
    industry: {
        color: '#717679',
        fontWeight: '700',
        fontSize: 15,
    },
    totalLikes: {
        alignSelf: 'flex-end',
        bottom: '6%',
        right: '-4%',
        fontWeight: '700',
        fontSize: 14,
        color: '#717679'
    },
    likeHeart: {
        width: 24,
        height: 21,
        alignSelf: 'flex-end',
        top: 25,
        marginRight: 5
    },
    likeFillHeart: {
        width: 24,
        height: 21,
        alignSelf: 'flex-end',
        right: '21%',
        marginBottom: '5%'
    },
    businessName: {
        fontWeight: '800',
        fontSize: 18,
        color: '#000000',
    },
    logoBusiness: {
        height: 50,
        width: 100,
        borderRadius: 10
    },
    logoBusinessInModal: {
        height: 50,
        width: 100,
        marginTop: 10,
        marginLeft: 10,
        alignSelf: 'center'
    },
    listView: {
        padding: '5%',
        backgroundColor: 'white',
        borderRadius: 15,
        width: '100%',
        marginBottom: '3%'
    },
    wishlistView: {
        padding: 10,
        height: '100%',
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    notificationImg: {
        width: 49,
        height: 49,
        resizeMode: 'contain',
        flex: 1,
        position: 'absolute',
        top: '1%',
    },
    welcomeText: {
        color: 'black',
        fontSize: 24,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginTop: '5%',
        textAlign: 'center',
        width: '80%'
    },
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
    },
    setimg1: {
        width: 50,
        height: 50,
        marginTop: -16,
        position: 'absolute',
        alignSelf: 'flex-end',
        right: -30,
    },
    modalbusinessName: {
        fontWeight: '800',
        fontSize: 18,
        color: '#325b6f',
        textAlign: 'center',
        marginTop: 7,
        borderBottomColor: 'black',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'black',
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingVertical: 5,
    },
    modalPromoMsg: {
        fontWeight: '600',
        fontSize: 15,
        color: '#ad466b',
        paddingHorizontal: 10,
        marginTop: 20,
        textAlign: 'center',
        marginBottom: 10
    }
})

export default Favourite;