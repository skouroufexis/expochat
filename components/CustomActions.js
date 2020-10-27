import { StatusBar } from 'expo-status-bar';

import PropTypes from 'prop-types';
import React from 'react';
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


      onActionPress = () => {
        const options = ['Add Image From Library', 'Take Picture', 'Send Location', 'Cancel'];
        const cancelButtonIndex = options.length - 1;
        this.context.actionSheet().showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex,
          },

          async (buttonIndex) => {
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
          },
        );
      }; 


      addImageUrl=(imageUrl)=>this.props.addImageUrl(imageUrl);
      addLocation=(longitude,latitude)=>this.props.addLocation(longitude,latitude);


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

      takePhoto= async()=>{
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

      sendLocation = async ()=>{

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


      uploadToFirebase = async (url)=>{

      const firebase = require ('firebase');
      var storage = firebase.storage();
      var storageRef = storage.ref();  

      const response = await fetch(url);
      const blob = await response.blob();
      
      //retrieve image name
      url=url.split('/');
      url=url[url.length-1];

        let imagePath = await storageRef.child(url).put(blob);
        imagePath =storageRef.child(url).getDownloadURL().then(function(imageUrl){
                return imageUrl;
        });
        return imagePath;
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