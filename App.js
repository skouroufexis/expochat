import { StatusBar } from 'expo-status-bar';

/**
* Importing dependencies
*  -Stack Navigator from React Navigation ((https://reactnavigation.org)  to enable navigation from one screen to another 
* -the application components: Start.js and Chat.js
*/


import React from 'react';
import { StyleSheet, Text, View, TextInput,Switch } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Start from './components/Start';
import Chat from './components/Chat';
import { render } from 'react-dom';

/**
* Initializing the React Navigation (Stack Navigator)
*/
const Stack = createStackNavigator();


export default class App extends React.Component {
  constructor(props){
    super(props)
   this.state={colour:'black',
               username:'Stavros'

          } 
  }

/**
* renders the App
@returns {component} NavigationContainer
*/
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
    );
  }



/** 
 * function for setting the background colour of the chat screen (Chat.js component)
 * @function setColour
* @param {string} colour
* sets the colour to the State
*/
  setColour=(colour)=>{
    this.setState({colour:colour}); 
  }
  
/** 
 * function for setting the username (Chat.js component)
* @function setName
* @param {string} name
* sets the username to the State
*/
  setName=(name)=>{
    this.setState({name:name});
  }
}
