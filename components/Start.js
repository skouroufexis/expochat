


import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {Platform, KeyboardAvoidingView , StyleSheet, Text, View, TextInput,Button,TouchableOpacity,Image, ImageBackground } from 'react-native';


import { event } from 'react-native-reanimated';

//background image path
const image ='./Background.png';


class Start extends React.Component{

    constructor(){
        super();
        this.state={username:'',
                    colour:'',
                    }
    }
    
    render(){
        return(

            <View style={styles.container}>
                
                <ImageBackground style={styles.background} source={require(image)}>
                    
                    
                    <View style={styles.main}>
                        
                        <TextInput style={styles.textInput} 
                                placeholder='Your Name' onChangeText={(username)=>this.setName(username)}
                                
                        />
                        
                        <View style={styles.label}><Text style={styles.label} >Choose background colour</Text></View>   
                        <View style={styles.horizontalFlex} >

                            <TouchableOpacity style={[styles.colourCircles,{backgroundColor:'floralwhite'}]} onPress={()=>this.setColour('floralwhite')} ></TouchableOpacity>
                            <TouchableOpacity style={[styles.colourCircles,{backgroundColor:'whitesmoke'}]} onPress={()=>this.setColour('whitesmoke')}></TouchableOpacity>
                            <TouchableOpacity style={[styles.colourCircles,{backgroundColor:'beige'}]} onPress={()=>this.setColour('beige')}></TouchableOpacity>
                            <TouchableOpacity style={[styles.colourCircles,{backgroundColor:'azure'}]} onPress={()=>this.setColour('azure')}></TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.button} onPress={()=>{this.openChat()}}>
                            <Text style={{color:'white',fontWeight:'bold'}} >Start Chatting</Text>
                        </TouchableOpacity>
                        
                    </View>
                    
                </ImageBackground>
                
            </View>
        )
    }

/**
* navigates to the Chat screen (Chat.js)
* @function openChat
*/
    openChat=()=>{
        
        /**
        * sets default values for username and colour
        * @async
        * @function openChat.defaultValues () {
        }
        * @param {string} name the username
        * @param {string} colour the background colour
        */
        let defaultValues= async (name='User 1',colour='azure')=>{

            
            // default values are set if user doesn't set his/her own custom values
            if(this.state.username=='')
                {
                this.setState({username:name});
                }

                if(this.state.colour=='')
                {
                this.setState({colour:colour});
                
                }

                return;
        }

        defaultValues().then(()=>{
            this.props.navigation.navigate('Chat',{
            username:this.state.username,
            colour:this.state.colour});
        })        
    }

    /**
    * updates the State with the selected colour
    * @function setColour 
    * @param {string} colour
    */
    //
    setColour=(colour)=>{
        this.setState({colour:colour});   
    }

    /**
    * updates the State with the typed-in username
    * @function setName 
    * @param {string} username
    */
    setName=(username)=>{
        this.setState({username:username});
    }
}

const styles = StyleSheet.create({
    keyboard:{

        flex:1
    },

    container:{
        flex:1
    },

    background:{
        width:'100%',height:'100%',
        
    },

    main: {
       
      height:'44%',
      alignSelf:'center',
      marginTop:'56%',
      marginBottom:'20%',
      width:'88%',
      backgroundColor: 'white',
      alignItems:'center',
      justifyContent: 'center',
    },
    label:{
        color:'rgba(0,0,0,0.4)',
        fontWeight:'bold',
        width:'88%',
        marginTop:'2%'
    },
  
    textInput: {
        borderStyle:'solid',  
        backgroundColor:'white',
        position:'absolute',
        top:'4%',
        zIndex:1,
        borderColor:'rgba(0,0,0,0.1)',
        borderWidth:0.9,
        width:'88%',
        padding:'2%',
    },
    
    button: {
        
        width:'88%',
        backgroundColor:'green',
        height:40,
        padding:'1%',
        justifyContent:'center',
        alignItems:'center',
        marginTop:'5%' 
    },

    horizontalFlex:{
        flexDirection:'row'
    },

    colourCircles:{
        marginLeft:'4%',
        marginTop:'3%',
        width:50,
        height:50,
        borderRadius:25,
    },

  });


export default Start;