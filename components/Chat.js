import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {Platform, KeyboardAvoidingView , StyleSheet, Text, View, TextInput,Button,TouchableOpacity,Image, ImageBackground } from 'react-native';
import { roundToNearestPixel } from 'react-native/Libraries/Utilities/PixelRatio';
import { GiftedChat,Bubble,InputToolbar } from 'react-native-gifted-chat'
import { LogBox } from 'react-native';
import { firestore } from 'firebase/app';



import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';


const firebase = require('firebase/app');
require('firebase/firestore');
require('firebase/auth');

LogBox.ignoreLogs(['Setting a timer']);

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


    componentDidMount(){

       //get username and background colour values
       let username=this.props.route.params.username;
       let colour=this.props.route.params.colour;
       this.setState({username:username});
       this.setState({colour:colour});
       this.props.navigation.setOptions({title:username});



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

      var unsubscribe = auth.onAuthStateChanged(user=>{
        this.setState({userID:user.uid});
      })
      
      
      var unsubscribe1=db.collection('messages').onSnapshot(snapshot=>{
        let changes = snapshot.docChanges();
        this.updateMessages(changes);
      });
      unsubscribe();
      unsubscribe1();
    }

    onSend(messages){
      
        //define fields of new message
        let _id=this.state.lastMessageId;
        _id=_id+1;
      //update the last inserted id
      this.setState({lastMessageId:_id});
      
      //new message parameters
      let text=messages[0].text;
      let createdAt=new Date();

      // //user info
      let username=this.state.username;
      let avatar='https://placeimg.com/140/140/any';
      
      // //add new message to database
      db.collection('messages').add(

          {
            _id:_id,
            text:text,
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
          });
          
          this.storeOfflineMessages();

    }

    storeOfflineMessages=async()=>{
      let messages=this.state.messages;
      messages=JSON.stringify(messages);
      try {
        await AsyncStorage.setItem('messages',messages);
        console.log('successfully stored');
      } catch (error) {
        console.log('error storing messages:'+ error);
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
        console.log(error.message);
      }
    }


    deleteOfflineMessages=async()=>{
      try {
        await AsyncStorage.removeItem('messages');
        console.log('offline messages successfully removed');
      } catch (error) {
        console.log('error removing offline messages: '+ error);
      }
    }


    updateMessages(changes){
        //at a later stage check whether the change is adding or deleting a message   
        changes.forEach(change=>{
        
        // console.log(change.doc.data())
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
      });  
      this.storeOfflineMessages();
    
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




