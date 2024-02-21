import { TouchableOpacity, StyleSheet, Image, Text, View, ScrollView, PermissionsAndroid, Modal, TouchableWithoutFeedback, Pressable, Alert, Platform } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native";
import Globals from '../components/Globals';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useIsFocused } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import moment from 'moment';
import Toast from 'react-native-simple-toast';

const ProfileEdit = ({ navigation, route }) => {
    const focus = useIsFocused();
    const [MemberData, setMemberData] = useState([{}]);
    const [name, setName] = useState('');
    const [emailId, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [formatPhone, setFormatPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const [isValidName, setIsValidName] = useState(true);

    const [memberProfilePic, setMemberProfilePic] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageRes, setImageRes] = useState(null);
    const [optionModalVisible, setOptionModalVisible] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [daysInMonth, setDaysInMonth] = useState([]);

    const months = [
        { label: 'January', value: '01' },
        { label: 'February', value: '02' },
        { label: 'March', value: '03' },
        { label: 'April', value: '04' },
        { label: 'May', value: '05' },
        { label: 'June', value: '06' },
        { label: 'July', value: '07' },
        { label: 'August', value: '08' },
        { label: 'September', value: '09' },
        { label: 'October', value: '10' },
        { label: 'November', value: '11' },
        { label: 'December', value: '12' },
    ];

    const validateEmail = (email) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    async function setMemData(value) {
        await setMemberData(value);
        setName(value[0].name);
        setEmail(value[0].emailId);
        let bDay = (value[0].birthDay == '' || value[0].birthDay == null || value[0].birthDay == undefined ||
            value[0].birthMonth == '' || value[0].birthMonth == null || value[0].birthMonth == undefined) ?
            null : value[0].birthDay + ' ' + value[0].birthMonth;
        setBirthDate(bDay);
        setMemberProfilePic(value[0].memberImageFile);
        let numP1 = String(value[0].phone).toString().substring(0, 3);
        let numP2 = String(value[0].phone).toString().substring(3, 6);
        let numP3 = String(value[0].phone).toString().substring(6,);
        setFormatPhone('(' + numP1 + ') ' + numP2 + '-' + numP3);
        setPhone(String(value[0].phone));
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

    const putData = () => {
        if (name == '' || name == null || name == undefined) {
            setIsValidName(false);
        } else {
            setIsValidName(true);
            setLoading(true);
            const apiUrl = Globals.API_URL + '/MemberProfiles/PutMemberInMobileApp';
            let currentDate = (new Date()).toISOString();

            let currentYear = new Date().getFullYear();
            let bDate;
            if (!MemberData[0].isBirthDateChange) {
                bDate = (selectedMonth == '' || selectedDay == '' || selectedMonth == null || selectedDay == null ||
                    selectedMonth == undefined || selectedDay == undefined) ? null
                    : `${currentYear}-${selectedMonth}-${selectedDay}`;
            } else {
                bDate = null;
            }

            const requestBody = {
                id: MemberData[0].memberId,
                memberName: name,
                emailID: emailId,
                lastModifiedBy: MemberData[0].memberId,
                lastModifiedDate: currentDate,
                birthDate: bDate
            };

            axios.put(apiUrl, requestBody)
                .then(async (response) => {
                    if (selectedImage) {
                        await uploadImage(imageRes);
                    }
                    await getMemberData();
                    setLoading(false);
                    Toast.show(
                        `Updated Successfully`,
                        Toast.LONG,
                        Toast.BOTTOM,
                    )
                    navigation.navigate('Profiles');
                })
                .catch(error => console.error(error));
        }
    }
    const Save = () => {
        if (emailId !== null && emailId !== undefined && emailId !== '') {
            const isValidEmail = validateEmail(emailId);
            setIsValid(isValidEmail);
            if (isValidEmail) {
                putData();
            }
        } else {
            putData();
        }
    }

    const getMemberData = async () => {
        const response = await fetch(
            Globals.API_URL + '/MemberProfiles/GetMemberByPhoneNo/' + phone)
        const json = await response.json();
        AsyncStorage.setItem('token', JSON.stringify(json))
            .then(() => {
                console.log('Data saved successfully!');
            })
            .catch(error => {
                console.error('Error saving data:', error);
            });
    }
    const openGallery = async () => {
        const launchCallback = async (response) => {
            if (response.didCancel) {
                console.log("User cancelled image picker");
            } else if (response.error) {
                console.log("Image Picker error", response.error);
            } else {
                let imageUri = response.uri || response.assets?.[0]?.uri;
                setMemberProfilePic(null);
                setSelectedImage(imageUri);
                setImageRes(response);
            }
        };
        const resultGallery = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0
        }, launchCallback);
        setOptionModalVisible(false)
        console.log(resultGallery);
    }

    const openCamera = async () => {
        const launchCallback = (response) => {
            if (response.didCancel) {
                console.log("User cancelled image picker");
            } else if (response.error) {
                console.log("Image Picker error", response.error);
            } else {
                let imageUri = response.uri || response.assets?.[0]?.uri;
                setMemberProfilePic(null);
                setSelectedImage(imageUri);
                setImageRes(response);
            }
        };
        const resultCamera = await launchCamera({
            mediaType: 'photo',
            quality: 0,
            cameraType: 'front',
            saveToPhotos: true
        }, launchCallback);
        setOptionModalVisible(false);
        console.log(resultCamera);
    }

    const uploadImage = async (response) => {
        const formData = new FormData();
        formData.append('file', {
            uri: response.uri || response.assets?.[0]?.uri,
            type: response.type || response.assets?.[0]?.type,
            name: response.fileName || response.assets?.[0]?.fileName,
        });
        try {
            const response = await axios.post(Globals.API_URL + `/MemberProfiles/UpdateMemberImageInMobileApp/${MemberData[0].memberId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error('Image upload failed', error);
        }
    };
    const alertForBirthDate = () => {
        Alert.alert(
            null,
            'Your birthdate has been updated once before. If you need further assistance, please contact our Revords support team.',
            [
                {
                    text: 'OK'
                },
            ],
            { cancelable: false }
        );
    }

    const selectMonthFn = (value) => {
        setSelectedMonth(value)
        if (selectedMonth) {
            const daysArray = [];
            const daysInSelectedMonth = moment(`2024-${selectedMonth}`, 'YYYY-MM').daysInMonth();

            for (let i = 1; i <= daysInSelectedMonth; i++) {
                const formattedDay = i < 10 ? `0${i}` : `${i}`;
                daysArray.push({ label: formattedDay, value: formattedDay });
            }
            setDaysInMonth(daysArray);
            setSelectedDay('');
        }
    }
    return (
        <>
            <View style={styles.container}>
                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <View style={{ flexDirection: 'row', width: '95%', height: '10%', alignItems: 'center', justifyContent: 'center' }}>
                        <Pressable activeOpacity={.7} onPress={() => navigation.navigate('Profiles')}>
                            <Image source={require('../assets/more-button-ved.png')} style={styles.setimg1} />
                        </Pressable>
                        <Text style={styles.welcomeText}>Edit Profile</Text>
                        <Pressable activeOpacity={.7} onPress={() => navigation.navigate('NotificationTray')}>
                            <Image source={require('../assets/notification-swo.png')} style={styles.setimg1} />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{
                        flex: 1, width: '95%', marginTop: 30, height: '90%', borderRadius: 23, backgroundColor: 'white',
                    }}>
                        <View style={{ width: '100%', height: '95%', alignItems: 'center', justifyContent: 'center', borderRadius: 23 }}>
                            <View style={{
                                width: '95%', height: '95%', alignItems: 'center',
                                marginTop: 16, borderRadius: 23, paddingVertical: 25,
                            }}>
                                <View>
                                    {(!memberProfilePic && !selectedImage) && <Image source={require('../assets/defaultUser1.png')} style={styles.img1} />}
                                    {memberProfilePic && <Image source={{ uri: memberProfilePic }} style={styles.img1} />}
                                    {selectedImage && <Image source={{ uri: selectedImage }} style={styles.img1} />}

                                    <View style={styles.pencilView}>
                                        <TouchableOpacity onPress={() => setOptionModalVisible(true)}>
                                            <Image source={require('../assets/pencilsimple.png')} style={styles.pencilImg} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={{ width: '95%', marginTop: 16, borderRadius: 23, padding: 10, alignItems: 'center' }}>
                                    <View style={{ marginTop: 5, borderRadius: 23, padding: 5, width: '100%' }}>
                                        <Text style={{ fontSize: 18, fontWeight: '700', paddingLeft: 5 }}>Name</Text>
                                        <TextInput
                                            style={{
                                                height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10,
                                                marginTop: 5, fontSize: 16, borderRadius: 10, backgroundColor: '#e6edf1', fontWeight: '600'
                                            }}
                                            onChangeText={(inputText) => { setName(inputText) }}
                                            value={name}
                                        />
                                        {!isValidName && <Text style={{ color: 'red' }}> Name shouldn't be empty </Text>}
                                    </View>
                                    <View style={{ borderRadius: 23, padding: 5, width: '100%' }}>
                                        <Text style={{ fontSize: 18, fontWeight: '700', paddingLeft: 5 }}>Email</Text>
                                        <TextInput
                                            style={{
                                                height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10,
                                                marginTop: 5, fontSize: 16, borderRadius: 10, backgroundColor: '#e6edf1', fontWeight: '600'
                                            }}
                                            onChangeText={(inputText) => { setEmail(inputText) }}
                                            value={emailId}
                                        />
                                        {!isValid && <Text style={{ color: 'red' }}>Invalid Email Address</Text>}
                                    </View>
                                    <View style={{ borderRadius: 23, padding: 5, width: '100%' }}>
                                        <Text style={{ fontSize: 18, fontWeight: '700', paddingLeft: 5 }}>Phone Number</Text>
                                        <TextInput
                                            style={{
                                                height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10,
                                                marginTop: 5, fontSize: 16, borderRadius: 10, backgroundColor: '#e1e5e8', fontWeight: '600'
                                            }}
                                            value={formatPhone}
                                            editable={false}
                                        />
                                    </View>
                                    <View style={{ borderRadius: 23, padding: 5, width: '100%' }}>
                                        <Text style={{ fontSize: 18, fontWeight: '700', paddingLeft: 5 }}>Birth Date</Text>
                                        {MemberData[0].isBirthDateChange &&
                                            <TouchableOpacity activeOpacity={.7} onPress={alertForBirthDate}>
                                                <TextInput
                                                    style={{
                                                        height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10,
                                                        marginTop: 5, fontSize: 16, borderRadius: 10, backgroundColor: '#e1e5e8', fontWeight: '600',
                                                    }}
                                                    value={(birthDate == '' || birthDate == null || birthDate == undefined) ? 'No BirthDate Given' : birthDate}
                                                    editable={false}
                                                />
                                            </TouchableOpacity>}

                                        {!MemberData[0].isBirthDateChange &&
                                            <>
                                                <View style={styles.pickerContainer}>
                                                    <RNPickerSelect
                                                        placeholder={{ label: 'Select Birth Month', value: null }}
                                                        items={months}
                                                        onValueChange={(value) => selectMonthFn(value)}
                                                        style={pickerSelectStyles}
                                                        value={selectedMonth}
                                                        useNativeAndroidPickerStyle={false}
                                                    />
                                                </View>
                                                <View style={styles.pickerContainer}>
                                                    <RNPickerSelect
                                                        placeholder={{ label: 'Select Birth Day', value: null }}
                                                        items={daysInMonth}
                                                        onValueChange={(value) => setSelectedDay(value)}
                                                        style={pickerSelectStyles}
                                                        value={selectedDay}
                                                        useNativeAndroidPickerStyle={false}
                                                    />
                                                </View>
                                            </>
                                        }
                                    </View>

                                    <TouchableOpacity activeOpacity={.7} onPress={Save} style={styles.frame2vJu}>
                                        <Text style={styles.getStartednru}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={optionModalVisible}
                        onRequestClose={() => setOptionModalVisible(false)}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableWithoutFeedback onPress={() => setOptionModalVisible(false)}>
                                <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
                            </TouchableWithoutFeedback>
                            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: 300 }}>
                                <TouchableWithoutFeedback style={{ flex: 1 }}>
                                    <Pressable style={{ zIndex: 1000 }} onPress={openGallery}>
                                        <Text style={{ fontSize: 18, marginBottom: 10 }}>Choose from Library</Text>
                                    </Pressable>
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback>
                                    <Pressable onPress={openCamera}>
                                        <Text style={{ fontSize: 18 }}>Take Photo</Text>
                                    </Pressable>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                    </Modal>

                </View >
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.container}>
                        <Spinner
                            visible={loading}
                            textContent={''}
                            textStyle={styles.spinnerTextStyle}
                        />
                    </View>
                </SafeAreaView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    pickerContainer: {
        width: '100%',
        borderColor: 'white',
        marginBottom: 5,
    },
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center',
    },
    img1: {
        width: 100,
        height: 100,
        borderRadius: 83,
        marginTop: -15,
    },
    setimg1: {
        width: 50,
        height: 50,
        marginTop: 'auto',
        position: 'absolute',
        alignSelf: 'flex-end',
        right: -25
    },
    iconimg1: {
        width: 35,
        height: 35
    },
    welcomeText: {
        color: 'black',
        fontSize: 18,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginTop: '15%',
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
    pencilView: {
        height: 40,
        width: 40,
        backgroundColor: '#73a5bc',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 500,
        position: 'absolute',
        right: -5,
        top: '60%'
    },
    pencilImg: {
        height: 22,
        width: 22
    },
    frame2vJu: {
        backgroundColor: '#140d05',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 25,
        width: '40%',
        height: 50
    },
    getStartednru: {
        lineHeight: 22.5,
        textTransform: 'uppercase',
        fontFamily: 'SatoshiVariable, SourceSansPro',
        flexShrink: 0,
        fontWeight: 'bold',
        fontSize: 18,
        color: '#ffffff',
        flex: 10,
        zIndex: 10,
        textAlign: 'center',
    },
})

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderColor: 'white',
        borderRadius: 15,
        color: 'black',
        paddingRight: 30,
        marginTop: 5,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: '#f9f9f9',
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderColor: 'white',
        borderRadius: 15,
        color: 'black',
        paddingRight: 30,
        marginTop: 5,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: '#f9f9f9',
    },
    inputIOSContainer: {
        borderColor: 'white',  // Border color when open
        borderBottomWidth: 2, // Border width when open
        borderWidth: 2,
        borderColor: '#000',
    },
    inputAndroidContainer: {
        borderColor: 'white', // Border color when open
        borderBottomWidth: 2, // Border width when open
        borderWidth: 2,
        borderColor: '#000',
    },
});
export default ProfileEdit;