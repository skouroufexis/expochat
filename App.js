import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, TextInput,Switch } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import Start from './components/Start';
import Chat from './components/Chat';
import { render } from 'react-dom';
const Stack = createStackNavigator();
export default class App extends React.Component {
  constructor(props){
    super(props)
   this.state={colour:'black',
               username:'Stavros'
          } 
  }
  render(){
    return (
      <NavigationContainer >
        
        <Stack.Navigator 
          initialRouteName="Start"
        >
            <Stack.Screen
              name="Start"
              
              component={Start}
              setColour={this.setColour}
            />
            <Stack.Screen
              name="Chat"
              component={Chat}
            />
        </Stack.Navigator>
        
      </NavigationContainer>

      // <View style={styles.container} >
      // <Start   />
      // {/* <Chat name={this.state.setName} colour={this.state.colour} /> */}
      // </View>
    );
  }

  setColour=(colour)=>{
    this.setState({colour:colour});
    alert(colour);
  }
  
  setName=(name)=>{
    this.setState({name:name});
  }


}


