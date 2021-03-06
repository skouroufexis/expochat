import { StatusBar } from 'expo-status-bar';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { CAMERA } from 'expo-permissions';

export default class CustomActions extends React.Component{

  constructor(props){
    super(props);
    this.state={image:[]}
    
  }

  render() {
        return (
          <TouchableOpacity style={[styles.container]} onPress={this.onActionPress}
            accessibilityLabel='Send an image or your location' accessibilityHint='Displays options for taking a photograph to send, or selecting one from your library and for sending your current location'>
            <View style={[styles.wrapper, this.props.wrapperStyle]}>
              <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
            </View>
          </TouchableOpacity>
        );
      }

      /** 
       * displays the different options of custom actions
       * @function onActionPress
      */
      onActionPress = () => {
        const options = ['Add Image From Library', 'Take Picture', 'Send Location', 'Cancel'];
        const cancelButtonIndex = options.length - 1;
        this.context.actionSheet().showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex,
          },

          /** 
           * anonymous function inside onActionPress().
           *  Triggers the corresponding functions for each custom action
           * @async 
           * @function onActionPress.function () {
             
           }
           @param {number} buttonIndex ex. 1,2,3
           
           * 
          */
          async (buttonIndex) => {
            try
            {
              switch (buttonIndex) {
                case 0:
                  console.log('user wants to pick an image');
                  this.uploadPhoto();
                  return;
                case 1:
                  console.log('user wants to take a photo');
                  this.takePhoto();
                  return;
                case 2:
                  console.log('user wants to get their location');
                  this.sendLocation();
                default:
              }
            }
            catch (error)
            {
              console.log(`error executing custom action: ${error}`);
            }
            
          },
        );
      }; 


      /** 
       * adds the image url to the State of Chat.js
       * called from Chat.js  
           * @async
           * @function addImageUrl
           * @param {string} imageUrl
      */
      addImageUrl=(imageUrl)=>this.props.addImageUrl(imageUrl);

      /** 
       * function  to add the location to the State of Chat.js
       * called from Chat.js  
           * @async
           * @function addLocation
           * @param {number} longitude
           * @param {number} latitude
      */
      addLocation=(longitude,latitude)=>this.props.addLocation(longitude,latitude);

      /** 
       * function  to upload a photo from the device's library.
       *  Image uploaded on firestore and image url uploaded on firebase
       *   along with other fields of the sent message
         * @async
         * @function uploadPhoto
         * @returns {string} permissionUpload.status ex 'granted'
         * @returns {string} image.url
      */
      uploadPhoto = async ()=>{
        
        const permissionUpload=await Permissions.askAsync(Permissions.CAMERA_ROLL);

        if(permissionUpload.status=='granted')
          {

            let image = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: 'Images',
            }).catch(error => console.log(`error uploading image: ${error}` ));
       
            if (!image.cancelled) {
              let url=image.uri;

              try {
                //upload image to firebase and then get file download url
                let imageUrl=await this.uploadToFirebase(url);
                console.log(`successfully uploaded image to firebase: ${url}`);
                this.addImageUrl(imageUrl);

              }

              catch (error){
                console.log(`error uploading image: ${error}`);
              }
              
            }

          }

      }

      /** 
       * enables user to take a photo with the device's camera
       *  Image uploaded on firestore and image url uploaded on firebase
       *   along with other fields of the sent message
         * @async
         * @function takePhoto
         * @returns {string} permissionCamera.status ex 'granted'
         * @returns {string} image.url
      */
      takePhoto= async()=>{
        try
        {
          const permissionCameraRoll=await Permissions.askAsync(Permissions.CAMERA_ROLL);
          const permissionCamera= await Permissions.askAsync(Permissions.CAMERA);
          if(permissionCamera.status=='granted' && permissionCameraRoll.status=='granted')
  
            {
              let image = await ImagePicker.launchCameraAsync({
                mediaTypes: 'Images',
              }).catch(error => console.log(`error taking image: ${error}`));
         
              if (!image.cancelled) {
                try {
                  let url=image.uri;
                  //upload image to firebase and then get file download url
                  let imageUrl=await this.uploadToFirebase(url);
                  console.log(`successfully uploaded image ${url}`);
                  this.addImageUrl(imageUrl);
                }
  
                catch (error){
                  console.log(`error uploading image: ${error}`);
                }
              }
  
            }
        }

        catch (error)
        {
          console.log(`error taking picture: ${error}`);
        }
        
        

      }


      /** 
       * Sends the user location as a chat message
       *  Location uploaded on firebase along with other fields of the sent message
         * @async
         * @function sendLocation
         * @returns {string} permissionLocation
         * @returns {number} longitude
         * @returns {number} latitude
      */
      sendLocation = async ()=>{

        try
        {

          const permissionLocation = await Permissions.askAsync(Permissions.LOCATION);
          if(permissionLocation.status === 'granted') {
            let location = await Location.getCurrentPositionAsync({});
       
            if (location) {
             
             try {
              let longitude=location.coords.longitude;
              let latitude=location.coords.latitude;
              this.addLocation(longitude,latitude);
              console.log(`successfully sent location. Longitude: ${longitude}, latitude: ${latitude}`);
  
            }
  
            catch (error){
              console.log(`error sending loation: ${error}`);
            }
            }
          }

        }
        catch(error)
        {
          console.log(`error sending loation: ${error}`)
        }

      }

      /** 
        * function  to upload the image to firebase
        * @async
        * @function uploadToFirebase
        * @param {string} url the url of the image taken or uploaded from the device
        * @returns {string} the image url
      */
      uploadToFirebase = async (url)=>{
       
      try
      {

        const firebase = require ('firebase');
        let storage = firebase.storage();
        let storageRef = storage.ref();  

        const response = await fetch(url);
        const blob = await response.blob();
      
        //retrieve image name
        url=url.split('/');
        url=url[url.length-1];

        let imagePath = await storageRef.child(url).put(blob);
        imagePath =storageRef.child(url).getDownloadURL().then((imageUrl)=>{
                return imageUrl;
        });
        return imagePath;

      }
       catch(error)
       {
         console.log(`error uploading image to firebase: ${error}`)
       } 
    }


}
  

CustomActions.contextTypes = {
    actionSheet: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
      width: 26,
      height: 26,
      marginLeft: 10,
      marginBottom: 10,
    },
    wrapper: {
      borderRadius: 13,
      borderColor: '#b2b2b2',
      borderWidth: 2,
      flex: 1,
    },
    iconText: {
      color: '#b2b2b2',
      fontWeight: 'bold',
      fontSize: 16,
      backgroundColor: 'transparent',
      textAlign: 'center',
    },
   });