import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, TextInput,Button,TouchableOpacity,Image, ImageBackground } from 'react-native';
import { roundToNearestPixel } from 'react-native/Libraries/Utilities/PixelRatio';





class Chat extends React.Component{

    constructor(){
        super();
        this.state={username:'',
                    colour:''    
                    }
    }
    
    render(){

        return(
            <View style={[styles.container,{backgroundColor: this.state.colour}]}>
   
                  <Text>Empty chat</Text>
                
            </View>

        )
    }


    componentDidMount(){
        let username=this.props.route.params.username;
        let colour=this.props.route.params.colour;
        this.setState({username:username});
        this.setState({colour:colour});
        this.props.navigation.setOptions({title:username});
    }

    
    
}



const styles = StyleSheet.create({
    container:{
        flex:1
    }


  });

export default Chat;
