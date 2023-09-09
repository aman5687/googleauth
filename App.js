import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as webBrowser from "expo-web-browser";
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';



webBrowser.maybeCompleteAuthSession();

export default function App() {
  const [userInfo, setuserInfo] = React.useState(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "521869696927-p47cllioejugs8ept3g45q23su6k3q3s.apps.googleusercontent.com", 
    androidClientId: "521869696927-fasrltosf8m54lb1bpvino5613h6br76.apps.googleusercontent.com"
  });

  React.useEffect(()=>{
    handleSignInWithGoogle();
  }, [response])

  async function handleSignInWithGoogle(){
    const user = await AsyncStorage.getItem("@user");
    if(!user){
      if(response?.type === "success"){
        await getUserInfo(response.authentication.accessToken)
      }
    }else{
      setuserInfo(JSON.parse(user));
    }
  }

  const getUserInfo = async(token)=>{
    if(!token) return;
    try {
      const response = await fetch("https://www.googleapis.com/userinfo/v2/me",
      {
        headers: {Authorization: `Bearer ${token}`},
      }
      );

      const user = await response.json();
      var userId = user.id;
      var userName = user.name;
      var userEmail = user.email;
      insertUserDataIntoMongoDB(userId, userName, userEmail);

      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setuserInfo(user);
    } catch (error) {
    }
  }

  const insertUserDataIntoMongoDB = async (userId, userName, userEmail) => {
    try {
      const response = await fetch('http://localhost:3000/api/insertdata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userName, userEmail }),
      });
  
      if (response.ok) {
        const insertedUser = await response.json();
        console.log('User data inserted into MongoDB:', insertedUser);
      } else {
        console.error('Error inserting user data into MongoDB:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text>{JSON.stringify(userInfo, null, 2)}</Text>
      <Text>Done</Text>
      <Button title="Sign in" onPress={promptAsync} />
      <Button title="Delete local storage" onPress={()=> AsyncStorage.removeItem("@user")} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
