import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {Platform, KeyboardAvoidingView , StyleSheet, Text, View, TextInput,Button,TouchableOpacity,Image, ImageBackground } from 'react-native';
import { roundToNearestPixel } from 'react-native/Libraries/Utilities/PixelRatio';
import { GiftedChat,Bubble } from 'react-native-gifted-chat'





class Chat extends React.Component{

    constructor(){
        super();
        this.state={username:'',
                    colour:'',
                    messages:[]    
                    }
    }
    
    render(){

        return(
            <View style={[styles.container,{backgroundColor: this.state.colour}]}>
   
                <GiftedChat
                renderBubble={this.renderBubble.bind(this)}
                messages={this.state.messages}
                onSend={messages => this.onSend(messages)}
                user={{
                    _id: 1,
                }}
                />
                { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
                }
            </View>

        )
    }


    componentDidMount(){

        //get username and background colour values
        let username=this.props.route.params.username;
        let colour=this.props.route.params.colour;
        this.setState({username:username});
        this.setState({colour:colour});
        this.props.navigation.setOptions({title:username});

        
        this.setState({messages:[
                    {
                        _id: 1,
                        text: 'Hello developer',
                        createdAt: new Date(),
                        user: {
                        _id: 2,
                        name: 'React Native',
                        avatar: 'https://placeimg.com/140/140/any',
                        }
                    },
                    {
                        _id: 2,
                        text:username +' has entered the chat',
                        createdAt: new Date(),
                        system: true,
                    }

             ]})
    }


    onSend(messages = []) {
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, messages),
        }))
      }


      renderBubble(props) {
        return (
          <Bubble
            {...props}
            wrapperStyle={{
              right: {
                        backgroundColor: 'green',
                
                        },

              left: {
                    backgroundColor:'black',
                    }
            }}
            textStyle={{
                        right:{color:'white'}, 
                        left:{color:'white'}
        

                        }}
          />
        )
      }

    
    
}



const styles = StyleSheet.create({
    container:{
        flex:1
    }


  });

export default Chat;
