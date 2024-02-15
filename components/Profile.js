import { StyleSheet, Image, Text, View, Alert, Platform, ScrollView, Pressable, Linking } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Link, useIsFocused } from "@react-navigation/native";
import Globals from './Globals';

const Profile = ({ route, navigation }) => {
    const focus = useIsFocused();
    const [name, setName] = useState('');
    const [emailId, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [memberProfilePic, setMemberProfilePic] = useState('');
    const [MemberData, setMemberData] = useState([{}]);
    const appVersion = require('../package.json').version;

    const createTwoButtonAlert = () =>
        Alert.alert('Log Out', 'Do you want to logout?', [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'Yes', onPress: async () => {
                    try {
                        fetch(`${Globals.API_URL}/MemberProfiles/PutDeviceTokenInMobileApp/${MemberData[0].memberId}/NULL`, {
                            method: 'PUT'
                        }).then(async (res) => {
                            await AsyncStorage.removeItem('token');
                            navigation.navigate('LandingScreen')
                        });
                    } catch (error) {
                        console.error('Error removing token:', error);
                    }
                }
            },
        ]);
    const onDeleteAccount = () =>
        Alert.alert('Delete', 'Do you want to Delete your Account?', [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'Yes', onPress: async () => {
                    try {
                        fetch(`${Globals.API_URL}/MemberProfiles/PutDeviceTokenInMobileApp/${MemberData[0].memberId}/NULL`, {
                            method: 'PUT'
                        }).then(async (res) => {
                            await AsyncStorage.removeItem('token');
                            console.log('Token removed successfully');
                            navigation.navigate('LandingScreen')
                        });
                    } catch (error) {
                        console.error('Error removing token:', error);
                    }
                }
            },
        ]);
    async function setMemData(value) {
        await setMemberData(value);
        setName(value[0].name);
        setEmail(value[0].emailId);
        let bDay = (value[0].birthDay == '' || value[0].birthDay == null || value[0].birthDay == undefined ||
            value[0].birthMonth == '' || value[0].birthMonth == null || value[0].birthMonth == undefined) ?
            null : value[0].birthDay + ' ' + value[0].birthMonth;
        setBirthDay(bDay);
        setMemberProfilePic(value[0].memberImageFile);
        let numP1 = String(value[0].phone).toString().substring(0, 3);
        let numP2 = String(value[0].phone).toString().substring(3, 6);
        let numP3 = String(value[0].phone).toString().substring(6,);
        setPhone('(' + numP1 + ') ' + numP2 + '-' + numP3);
    }
    useEffect(() => {
        AsyncStorage.getItem('token')
            .then(async (value) => {

                if (value !== null) {
                    await setMemData(JSON.parse(value));
                }
            })
            .catch(error => {
                console.error('Error retrieving dataa:', error);
            });
    }, [focus]);

    return (
        <>
            <View style={styles.container}>
                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', width: '95%', height: '15%', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={styles.welcomeText}>User Profile</Text>
                        <Pressable activeOpacity={.7} onPress={() => navigation.navigate('ProfileEdit', { MemberData: MemberData })}>
                            <Image source={require('../assets/editImg.png')} style={styles.setimg1} />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{
                        width: '95%', marginTop: 15, height: '90%', borderRadius: 23, backgroundColor: 'white',
                    }}>
                        <View style={{
                            width: '100%', height: '95%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white',
                            marginTop: 16, borderRadius: 23, paddingVertical: 15
                        }}>
                            {(memberProfilePic == null || memberProfilePic == '' || memberProfilePic == undefined) &&
                                <Image source={require('../assets/defaultUser1.png')} style={styles.img1} />}
                            {(memberProfilePic != null && memberProfilePic != '' && memberProfilePic != undefined) &&
                                <Image source={{ uri: memberProfilePic }} style={styles.img1} />}
                            <Text style={styles.welcomeText}>{name}</Text>

                            <View style={{ backgroundColor: '#f2f5f6', width: '95%', marginTop: 14, borderRadius: 23 }}>
                                <View style={{
                                    flexDirection: 'row', width: '90%', alignItems: 'left', justifyContent: 'left',
                                    marginTop: 16, marginLeft: 16
                                }}>
                                    <Image source={require('../assets/auto-group-m9hk.png')} style={styles.iconimg1} />
                                    <Text style={styles.innerDText}>{phone}</Text>

                                </View>
                                <View style={{
                                    flexDirection: 'row', width: '90%', alignItems: 'left', justifyContent: 'left',
                                    marginLeft: 16, paddingVertical: 10
                                }}>
                                    <Image source={require('../assets/auto-group-edy5.png')} style={styles.iconimg1} />
                                    {(emailId != null && emailId != '' && emailId != undefined) && <Text style={styles.innerDText}>{emailId}</Text>}
                                    {(emailId == null || emailId == '' || emailId == undefined) && <Text style={{
                                        color: '#676767',
                                        fontSize: 16,
                                        fontWeight: '700',
                                        marginTop: '2%',
                                        marginLeft: '5%',
                                        width: '80%',
                                    }}>Email</Text>}
                                </View>
                                <View style={{
                                    flexDirection: 'row', width: '90%', alignItems: 'left', justifyContent: 'left',
                                    marginLeft: 16, paddingBottom: 10
                                }}>
                                    <Image source={require('../assets/birthday.png')} style={styles.iconimg1} />
                                    {(birthDay != null && birthDay != '' && birthDay != undefined) && <Text style={styles.innerDText}>{birthDay}</Text>}
                                    {(birthDay == null || birthDay == '' || birthDay == undefined) && <Text style={{
                                        color: '#676767',
                                        fontSize: 16,
                                        fontWeight: '700',
                                        marginTop: '2%',
                                        marginLeft: '5%',
                                        width: '80%',
                                    }}>Birth Date</Text>}

                                </View>
                            </View>
                            <View style={{ backgroundColor: 'white', width: '100%', marginTop: 16, borderRadius: 23, left: '2%' }}>
                                <View style={{
                                    flexDirection: 'row', width: '95%', alignItems: 'left', justifyContent: 'left',
                                    marginTop: 16, marginLeft: 16
                                }}>
                                    <TouchableOpacity activeOpacity={.7}
                                        onPress={() => Linking.openURL('https://revords.com/t&c.html')}
                                        style={{
                                            flexDirection: 'row', alignItems: 'left', justifyContent: 'left'
                                        }}>
                                        <Image source={require('../assets/termsImg.png')} style={styles.iconimg1} />
                                        <Text style={styles.innerDText}>Terms & Conditions</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{
                                    flexDirection: 'row', width: '95%', alignItems: 'left', justifyContent: 'left',
                                    marginTop: 16, marginLeft: 16
                                }}>
                                    <TouchableOpacity activeOpacity={.7}
                                        onPress={() => Linking.openURL('https://revords.com/privacy.html')}
                                        style={{
                                            flexDirection: 'row', alignItems: 'left', justifyContent: 'left'
                                        }}>
                                        <Image source={require('../assets/privacyImg.png')} style={styles.iconimg1} />
                                        <Text style={styles.innerDText}>Privacy Policy</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{
                                    flexDirection: 'row', width: '95%', alignItems: 'left', justifyContent: 'left', marginLeft: 16,
                                    marginTop: 16
                                }}>
                                    <TouchableOpacity activeOpacity={.7}
                                        onPress={() => Linking.openURL('mailto:info@revords.com')}
                                        style={{
                                            flexDirection: 'row', alignItems: 'left', justifyContent: 'left'
                                        }}>
                                        <Image source={require('../assets/group-6.png')} style={styles.iconimg1} />
                                        <Text style={styles.innerDText}>Contact Us</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{
                                    flexDirection: 'row', width: '95%', alignItems: 'left', justifyContent: 'left',
                                    marginLeft: 16, paddingVertical: 16
                                }}>
                                    <TouchableOpacity activeOpacity={.7} onPress={createTwoButtonAlert} style={{
                                        flexDirection: 'row', alignItems: 'left', justifyContent: 'left',

                                    }}>
                                        <Image source={require('../assets/group-9.png')} style={styles.iconimg1} />
                                        <Text style={styles.innerDText}>Logout</Text>
                                    </TouchableOpacity>
                                </View>
                                {/* <View style={{
                                    flexDirection: 'row', width: '95%', alignItems: 'left', justifyContent: 'left',
                                    marginLeft: 16, paddingVertical: 9
                                }}>
                                    <TouchableOpacity activeOpacity={.7} onPress={onDeleteAccount} style={{
                                        flexDirection: 'row', alignItems: 'left', justifyContent: 'left',

                                    }}>
                                        <Image source={require('../assets/trash.png')} style={styles.iconimg1} />
                                        <Text style={styles.innerDText}>Delete Account</Text>
                                    </TouchableOpacity>
                                </View> */}
                            </View>
                            <Text style={{ fontWeight: '600', color: '#c2c3c5' }}>App Version: {appVersion}</Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center',
    },
    img1: {
        width: 100,
        height: 100,
        borderRadius: 50,
        // marginTop: -15,
    },
    setimg1: {
        width: 50,
        height: 50,
        marginTop: -16,
        position: 'absolute',
        alignSelf: 'flex-end',
        right: -30,
        borderRadius:10
    },
    iconimg1: {
        width: 35,
        height: 35,
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
    innerDText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '700',
        marginTop: '2%',
        marginLeft: '5%',
        width: '80%',
    },
    settingImg: {
        width: 50,
        height: 50,
    },
    editContainer: {
        width: 16,
        height: 16,
        backgroundColor: '#203139',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
    }
})

export default Profile;