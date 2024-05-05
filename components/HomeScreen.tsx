import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

interface UserProfile {
  username: string;
}

interface NoteLookupDto {
  id: string;
  name: string;
}

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<Array<any>>([]);

  const handleGetNotes = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token found!");
      const response = await axios.get<Array<NoteLookupDto>>(
        "https://192.168.5.109:44376/",
        {
          headers: {
            Authorization: "Bearer ${token}",
          },
        }
      );
      setNotes(response.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to fetch notes: ", error);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get<UserProfile>(
            "https://192.168.5.109:44337/",
            {
              headers: {
                Authorization: "Bearer ${token}",
              },
            }
          );
          setUser(response.data);
        } catch (error) {
          setIsLoading(false);
          navigation.navigate("Login");
          console.log("NO TOKEN");
        }
      } else {
        setIsLoading(false);
        navigation.navigate("Login");
        console.log("NO TOKEN");
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Get Notes" onPress={handleGetNotes} />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text>
              {item.id} - {item.name}
            </Text>
          )}
        />
      )}
      <Button title="Logout" onPress={handleLogout} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default HomeScreen;
