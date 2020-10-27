import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {Platform, KeyboardAvoidingView , StyleSheet, Text, View, TextInput,Button,TouchableOpacity,Image, ImageBackground } from 'react-native';
import { roundToNearestPixel } from 'react-native/Libraries/Utilities/PixelRatio';
import { GiftedChat,Bubble,InputToolbar } from 'react-native-gifted-chat'
import CustomActions from './CustomActions'; 
import { LogBox } from 'react-native';
import { firestore } from 'firebase/app';
import AsyncStorage from '@react-native-community/async-storage';

//checks internet connection
import NetInfo from '@react-native-community/netinfo';

import MapView from 'react-native-maps';


const firebase = require('firebase/app');
require('firebase/firestore');
require('firebase/auth');

LogBox.ignoreLogs(['Setting a timer','Animated.event']);

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoN3Db3pyo9r3ccoVOF5j8uHpji2KMKFg",
  authDomain: "chat-4ab1f.firebaseapp.com",
  databaseURL: "https://chat-4ab1f.firebaseio.com",
  projectId: "chat-4ab1f",
  storageBucket: "chat-4ab1f.appspot.com",
  messagingSenderId: "999572426899",
  appId: "1:999572426899:web:1539ee2cde3a0e5dd53d66",
  measurementId: "G-VH0DMRBQPM"
};


if (!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
  }
const db=firebase.firestore();
const auth=firebase.auth();

class Chat extends React.Component{

    constructor(){
        super();
        this.state={username:'',
                    colour:'',
                    messages:[],
                    image:[],
                    location:[],
                    lastMessageId:'',
                    userID:'',
                    userConnected:false
                    }
    }
    
    render(){

       if(this.state.messages.length!=0)
       {
        
        return(
          <View style={[styles.container,{backgroundColor: this.state.colour}]}>
 
              <GiftedChat
              
              renderBubble={this.renderBubble.bind(this)}
              messages={this.state.messages}
              onSend={messages => this.onSend(messages)}
              renderUsernameOnMessage={true}
              renderInputToolbar={this.renderInputToolbar}
              isTyping={true}
              user={{
                  _id:this.state.userID
              }}

              renderActions={this.renderCustomActions}

              renderCustomView = {this.renderCustomView}

                

              />
              { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
              }
          </View>

      )
    }
    else
    {
      return(

        <View style={[styles.container,{backgroundColor: this.state.colour}]}>
 
            <Text>Loading</Text>
        
        </View>
        )
    }
      
    }

    renderCustomActions = (props) => {
      
      return <CustomActions currentMessage={this.state.messages}  addLocation={(longitude,latitude)=>this.addLocation(longitude,latitude)} addImageUrl={(image)=>this.addImageUrl(image)}  {...props} />;
    };


    renderCustomView (props) {
      const { currentMessage} = props;
      
      if (currentMessage.location) {
        
        return (
            <MapView
              style={{width: 150,
                height: 100,
                borderRadius: 13,
                margin: 3}}
              region={{
                latitude: currentMessage.location.latitude,
                longitude: currentMessage.location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            />
        );
      }
      return null;
    }

    

    addImageUrl=(image)=>{

        //empty the location State
        this.setState({location:''});

        //set image url to the State
        this.setState({image:image},()=>{this.onSend();});
        
        

    }

    addLocation=(longitude,latitude)=>{

      //empty the image State
      this.setState({image:''});
      this.setState({location:{longitude:longitude,latitude:latitude}},()=>{this.onSend();});
      
    }

    componentDidMount(){

        
       //get username and background colour values
       let username=this.props.route.params.username;
       let colour=this.props.route.params.colour;
       this.setState({username:username});
       this.setState({colour:colour});
       this.props.navigation.setOptions({title:username});


        //check connection
        NetInfo.fetch().then(connection=>{
          if(connection.isConnected)
            {
              this.setState({userConnected:true});
              auth.signInAnonymously();
              auth.onAuthStateChanged(user=>{
                this.setState({userID:user.uid});
              })

              let messages=[];  

              db.collection('messages').orderBy('_id','desc').get().then((data)=>{
          
                //get the last inserted _id  
                let lastId=data.docs[0].data()._id  
                
                //when adding a new document, the _id will be lastMessageId+1
                this.setState({lastMessageId:lastId})  
                
                data.docs.forEach(doc=>{
                    let data = doc.data();
      
                    //adding the username to the system message
                    if(data.system==true)
                    {
                      data.text=(this.state.username+ ' has entered the chat');
                    }
      
                    //formatting date. The first two entries were strings
                    if (typeof data.createdAt!='string')
                      {
                        data.createdAt=data.createdAt.toDate();  
                      }
      
                    if(data.system)
                    {
                      messages.push(data)
      
                    }
                    else
                    {
                      messages.push(
                        {
                          _id:data._id,
                          text:data.text,
                          image:data.image,
                          location:data.location,
                          createdAt:data.createdAt,
                          user:{_id:data.user._id,
                                name: data.user.name,
                                avatar:data.user.avatar
                          }
                        }
                      )
                    }
                    });
                    
                }).then(()=>{
                    this.setState({messages:messages})
                })

                db.collection('messages').onSnapshot(snapshot=>{
                  let changes = snapshot.docChanges();
                  this.updateMessages(changes);
                
                });

            }
          else //user not connected
            {
              this.retrieveOfflineMessages();
            }

              
        });

    }

    componentWillUnmount(){

      //unsibscribe from two processes

      let unsubscribe = auth.onAuthStateChanged(user=>{
        this.setState({userID:user.uid});
      })
      
      
      let unsubscribe1=db.collection('messages').onSnapshot(snapshot=>{
        let changes = snapshot.docChanges();
        this.updateMessages(changes);
      });
      unsubscribe();
      unsubscribe1();
    }

    onSend(messages){

      let text; 
      let image;
      let location;


      //define fields of new message

      //if user sends image or location without text
       if(!messages)
       {
          text='';
          if(this.state.image!='')//user sends image and no location
            {
              image=this.state.image;
              location='';
              
            }
          else if (this.state.location!='') //user sends location and no image
            {
              

              location={latitude:this.state.location.latitude,
                longitude:this.state.location.longitude
                }

              image='';
            }  
          
            
       } 
       else
       {

        //if user types a message, it means that location and image will not be included
        //in the message
        text=messages[0].text;
        image="";
        location="";

       }   

        let _id=this.state.lastMessageId;
        _id=_id+1;
      //update the last inserted id
      this.setState({lastMessageId:_id});
      
      //new message parameters
      
      let createdAt=new Date();

      // //user info
      let username=this.state.username;
      let avatar='https://placeimg.com/140/140/any';

      // //add new message to database
      db.collection('messages').add(

          {
            _id:_id,
            text:text,
            image:image,
            location:location,
            createdAt:createdAt,
            user: {_id:this.state.userID,
                    name: username,
                    avatar:avatar
                  }
          }
      );


      //display the messages from the updated database
      let newMessages=[];
          db.collection('messages').orderBy('_id','desc').get().then((data)=>{
          
          //get the last inserted _id  
          let lastId=data.docs[0].data()._id  
          
          //when adding a new document, the _id will be lastMessageId+1
          this.setState({lastMessageId:lastId})  
          
          data.docs.forEach(doc=>{
              let data = doc.data();

              //adding the username to the system message
              if(data.system==true)
              {
                data.text=(this.state.username+ ' has entered the chat');
              }

              //formatting date. The first two entries were strings
              if (typeof data.createdAt!='string')
                {
                  data.createdAt=data.createdAt.toDate();  
                }

              if(data.system)
              {
                newMessages.push(data)

              }
              else
              {
                newMessages.push(
                  {
                    _id:data._id,
                    text:data.text,
                    image:data.image,
                    location:data.location,
                    createdAt:data.createdAt,
                    user:{_id:data.user._id,
                          name: data.user.name,
                          avatar:data.user.avatar
                    }
                  }
                )
              }
              
              });
              
          }).then(()=>{
              this.setState({messages:newMessages})
          }).then(()=>{
            this.storeOfflineMessages();

          });
              
            

    }

    storeOfflineMessages=async()=>{
      let messages=this.state.messages;
      messages=JSON.stringify(messages);
      try {
        await AsyncStorage.setItem('messages',messages);
        console.log('successfully stored');
        
      } catch (error) {
        console.log(`error storing messages: ${error}`);
        
      }
    }


    retrieveOfflineMessages = async()=>{
      
      let messages = [];
      try {
        messages = (await AsyncStorage.getItem('messages')) || [];
        this.setState({
          messages: JSON.parse(messages)
        });
        console.log('successfully retrieved');
      } catch (error) {
        console.log(`error retrieving message: ${error.message}`);
        
      }
    }


    deleteOfflineMessages=async()=>{

      try {
        
        await AsyncStorage.removeItem('messages');
        console.log('offline messages successfully removed');
      } catch (error) {
        console.log(`error removing offline messages: ${error}`);
        
      }
    }


    updateMessages(changes){
        //at a later stage check whether the change is adding or deleting a message   
        changes.forEach(change=>{
        
        console.log(change.doc.data())
        })

        //display the messages from the updated database
      let newMessages=[];
      db.collection('messages').orderBy('_id','desc').get().then((data)=>{
      
      //get the last inserted _id  
      let lastId=data.docs[0].data()._id  
      
      //when adding a new document, the _id will be lastMessageId+1
      this.setState({lastMessageId:lastId})  
      
      data.docs.forEach(doc=>{
          let data = doc.data();

          //adding the username to the system message
          if(data.system==true)
          {
            data.text=(this.state.username+ ' has entered the chat');
          }

          //formatting date. The first two entries were strings
          if (typeof data.createdAt!='string')
            {
              data.createdAt=data.createdAt.toDate();  
            }

          if(data.system)
          {
            newMessages.push(data)

          }
          else
          {
            newMessages.push(
              {
                _id:data._id,
                text:data.text,
                image:data.image,
                location:data.location,
                createdAt:data.createdAt,
                user:{_id:data.user._id,
                      name: data.user.name,
                      avatar:data.user.avatar
                }
              }
            )
          }
          
          });
          
      }).then(()=>{
          this.setState({messages:newMessages})
      }).then(()=>{
        this.storeOfflineMessages();
      });  
      
    
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

    renderInputToolbar=(props)=> {
      if (this.state.userConnected == false) {
      } else {
        return(
          <InputToolbar
          {...props}
          />
        );
      }
    }

    
    
}

const styles = StyleSheet.create({
    container:{
        flex:1
    }
  });

export default Chat;




