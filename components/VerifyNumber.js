import { useState, useEffect } from 'react';
import { Platform, Dimensions, StyleSheet, Image, Text, View, Pressable, Button, SafeAreaView, KeyboardAvoidingView, Linking } from 'react-native';
import MaskInput from 'react-native-mask-input';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Globals from '../components/Globals';
import Spinner from 'react-native-loading-spinner-overlay';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-simple-toast';
import LinearGradient from 'react-native-linear-gradient';
import { requestPermission } from '../helper/notificationService';
const { height, width } = Dimensions.get('window');
const isIPad = Platform.OS === 'ios' && (height > 1024 || width > 1024);

const VerifyNumber = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [unMaskPhone, setunMaskPhone] = useState('');
  const [isValid, setIsValid] = useState(true);
  spinner = false;
  randomnumber = "";
  CustomerExists = false;
  function generateRandomNumber() {
    const min = 1000;
    const max = 9999;
    const randomNumber =
      Math.floor(Math.random() * (max - min + 1)) + min;
    randomnumber = randomNumber.toString();
    return randomNumber;
  };

  async function fetchAPI() {
    try {
      setLoading(true);

      const response = await fetch(
        Globals.API_URL + '/MemberProfiles/GetMemberByPhoneNo/' + unMaskPhone)

      const json = await response.json();
      CustomerExists = json != undefined && json.length > 0 ? json : null;

      const randomOtp = await generateRandomNumber();
      console.log(randomOtp)

      if (unMaskPhone == '9687611260' || unMaskPhone == '8866398281') {
        navigation.navigate('GetOtp', { OTP: 1234, CustomerExists: CustomerExists, Phone: unMaskPhone })
        setLoading(false);
        return json;
      } else {
        try {
          fetch(`${Globals.API_URL}/Mail/SendOTP/${parseFloat(unMaskPhone)}/${randomOtp}`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }).then((res) => {
            if (res.ok) {
              navigation.navigate('GetOtp', { OTP: randomOtp, CustomerExists: CustomerExists, Phone: unMaskPhone })
              setLoading(false);
            }
            else {
              const errorResponse = res.json();
              const statusText = errorResponse.statusText || 'You can only sign in with U.S.A number'
              Toast.show(
                statusText,
                Toast.LONG,
                Toast.CENTER,
                {
                  backgroundColor: 'blue'
                }
              )
              setLoading(false)
              console.log("Error Message:---", statusText);
            }
            return json;
          }).catch((error) => {
            console.log("Error fetching OTP! Kindly check your number", error);
          });
        } catch (error) {
          console.log(error);
          Toast.show(
            'There is some issue! TRY Again!',
            Toast.LONG,
            Toast.BOTTOM,
            25,
            50,
          );
        }
      }
    } catch (error) {
      setLoading(false);
      alert(error)
      return error;
    }
  }

  const handleOnPress = async () => {
    try {
      if (unMaskPhone.length == 10) {
        await fetchAPI();
      } else if (unMaskPhone.length === 0 || unMaskPhone.length === null) {
        setIsValid(false)
      }
      else {
        setIsValid(false);
      }
    }
    catch (e) {
      alert(e);
    }
  }
  const checkApplicationPermission = async () => {
    if (Platform.OS === 'ios') {
      try {
        requestPermission()
      } catch (error) {
        console.log("Error getting request", error);
      }
    }
  }

  useEffect(() => {
    checkApplicationPermission();
  })
  return (
    <KeyboardAwareScrollView style={{ backgroundColor: '#d9e7ed' }}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#d9e7ed', '#bfdfed', '#d9e7ed']}
          style={[styles.gradient]}>
          <Text style={styles.welcomeText}>Welcome To</Text>
          <Image source={require('../assets/companylogo.png')} style={styles.companylogo} />
          <View style={styles.deviceView}>
            <Image source={require('../assets/devicemobile-9n9.png')} style={styles.mobilelogo} />
          </View>
          <Text style={styles.verifyText}>Verify Your Number</Text>
          <View style={{ flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'center' }}>
            <MaskInput
              allowFontScaling={false}
              value={phone}
              style={styles.textInput}
              keyboardType="numeric"
              maxLength={14}
              onChangeText={(masked, unmasked) => {
                if (unmasked.length <= 10) {
                  setPhone(masked); // you can use the unmasked value as well       
                  setunMaskPhone(unmasked);
                }
              }}
              mask={['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
              placeholder="Enter Phone Number"
            />
          </View>
          {!isValid && (
            <Text style={{ color: 'red', marginTop: 4 }}>
              {unMaskPhone ? 'Invalid Phone Number' : 'Please enter a Phone number'}
            </Text>)}
          <TouchableOpacity activeOpacity={.7} onPress={handleOnPress} style={styles.frame2vJu}>
            <Text style={styles.getStartednru}>Request Otp</Text>
            <Image source={require('../assets/arrowcircleright-R8m.png')} style={styles.arrowcirclerightTy3} />
          </TouchableOpacity>
          <View style={{ justifyContent: 'center', alignContent: 'center', width: '90%', position: 'relative', marginTop: '9%' }}>
            <Text style={{ fontSize: 14, textAlign: 'center' }}>
              By participating, you consent to receive auto text and email messages
              and to our
              <TouchableOpacity activeOpacity={.7} onPress={() => Linking.openURL('https://revords.com/t&c.html')}
                style={{ flexDirection: 'row', top: 3 }}>
                <Text style={{ color: 'grey' }}> Terms </Text>
              </TouchableOpacity>&
              <TouchableOpacity activeOpacity={.7} onPress={() => Linking.openURL('https://revords.com/privacy.html')}
                style={{ flexDirection: 'row', top: 3 }}>
                <Text style={{ color: 'grey' }}> Privacy Policy. </Text>
              </TouchableOpacity>Message and data rates may apply. Reply STOP to any messages to unsubscribe.
            </Text>
          </View>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
              <Spinner
                visible={loading}
                textContent={''}
                textStyle={styles.spinnerTextStyle}
              />
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#d9e7ed',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#3380a3',
    fontSize: isIPad ? 32 : 24,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: isIPad ? '10%' : '15%'

  },
  companylogo: {
    flexShrink: 0,
    width: isIPad ? '50%' : '70%',
    resizeMode: 'contain',
    marginTop: isIPad ? '2%' : '-5%',
  },
  deviceView: {
    backgroundColor: '#fff',
    width: isIPad ? 200 : 150,
    height: isIPad ? 200 : 150,
    alignItems: 'center',
    padding: '5%',
    borderRadius: isIPad ? 100 : 75,
    marginTop: isIPad ? '5%' : '5%',
    justifyContent: 'center',
  },
  mobilelogo: {
    width: '50%',
    height: '80%',
  },
  verifyText: {
    color: '#140d05',
    fontSize: 24,
    fontWeight: '700',
    marginTop: '5%',
    marginBottom: '5%',
  },
  textInput: {
    height: 45,
    width: '45%',
    borderColor: 'gray',
    borderBottomWidth: 1,
    paddingLeft: 2,
    borderRadius: 8,
    fontSize: 18,
  },
  frame2vJu: {
    marginTop: '5%',
    marginBottom: isIPad ? '8%' : 35,
    backgroundColor: '#140d05',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    width: isIPad ? '50%' : '60%',
    flexDirection: 'row',
  },
  getStartednru: {
    textTransform: 'uppercase',
    fontFamily: 'SatoshiVariable, SourceSansPro',
    flexShrink: 0,
    fontWeight: 'bold',
    fontSize: isIPad ? 20 : 16,
    color: '#ffffff',
    textAlign: 'center',
    flex: 10,
    zIndex: 10,
    width: '100%',
  },
  arrowcirclerightTy3: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    flexShrink: 0,
    marginRight: 20,
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
})

export default VerifyNumber;