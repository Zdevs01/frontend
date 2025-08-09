import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import Colors from '@/assets/fonts/color.js';
import { useFonts } from 'expo-font';
import Nav from '@/components/nav2';

const profil = () =>  {

  const [fontsLoaded] = useFonts({
      'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
      return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <>
      <View style={{ flex: 1 }}>
        <Nav />
      </View>
      <View style={styles.content}>
        <View style={styles.zprofil}>
          <View style={styles.pic}>
            <View style={styles.pica}>
              <Image
                source={require('@/assets/images/user.png')}
                style={styles.img}
              />
            </View>
            <TouchableOpacity style={styles.pen}>
              <Image
                source={require('@/assets/images/pen.png')}
                style={styles.imgs}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.tex}>
            <View>
              <Text style={styles.text1}>
              Chargement...
              </Text>
            </View>
            <View>
              <Text style={styles.text2}>
                Membre depuis le 20 decembre 2020
              </Text>
            </View>
          </View>
        </View>

        {/* Follower */}
        <View style={styles.follow}>
          <View style={styles.count_text}>
            <View>
                <Text style={styles.text1}>
                  887 K
                </Text>
            </View>
            <View>
                <Text style={styles.text2}>
                  Follower
                </Text>
            </View>
          </View>
          <View style={styles.count_text}>
            <View>
                <Text style={styles.text1}>
                  887 K
                </Text>
            </View>
            <View>
                <Text style={styles.text2}>
                  Follower
                </Text>
            </View>
          </View>
          <View style={styles.count_text}>
            <View>
                <Text style={styles.text1}>
                  887 K
                </Text>
            </View>
            <View>
                <Text style={styles.text2}>
                  Follower
                </Text>
            </View>
          </View>
        </View>

        {/* Bouttons */}
        <View style={styles.stat}>
          <View style={styles.group}>
            <TouchableOpacity style={styles.mod}>
                <View>
                  <View style={styles.imgt}>
                    <Image
                        source={require('@/assets/images/pen.png')}
                        style={styles.img}
                    />
                  </View>
                </View>
                <View>
                  <View>
                    <Text style={styles.text3}>Modifier</Text>
                  </View>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sms}>
                <View>
                  <View style={styles.imgt}>
                    <Image
                        source={require('@/assets/images/msg.png')}
                        style={styles.img}
                    />
                  </View>
                </View>
                <View>
                  <View>
                    <Text style={styles.text4}>Messages</Text>
                  </View>
                </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistique */}
        <View style={styles.stat}>
          <View>
              <Text style={styles.text1}>
                  Vos Statistiques 
                  <View style={styles.uml}>
                    <Image
                      source={require('@/assets/images/stat.png')}
                      style={styles.imgX}
                    />
                  </View>
              </Text>
          </View>
          <View style={styles.group}>
            <View style={styles.bx}>
              <View>
                <View style={styles.imgh}>
                  <Image
                      source={require('@/assets/images/water.png')}
                      style={styles.img}
                  />
                </View>
              </View>
              <View>
                <View>
                  <Text style={styles.text1}>256</Text>
                </View>
                <View>
                  <Text style={styles.text2}>Challenges</Text>
                </View>
              </View>
            </View>
            <View style={styles.bx}>
              <View>
                <View style={styles.imgh}>
                  <Image
                      source={require('@/assets/images/book.png')}
                      style={styles.img}
                  />
                </View>
              </View>
              <View>
                <View>
                  <Text style={styles.text1}>256</Text>
                </View>
                <View>
                  <Text style={styles.text2}>Leçons terminés</Text>
                </View>
              </View>
            </View>   
          </View>
          <View style={styles.group}>
            <View style={styles.bx}>
              <View>
                <View style={styles.imgh}>
                  <Image
                      source={require('@/assets/images/thunder.png')}
                      style={styles.img}
                  />
                </View>
              </View>
              <View>
                <View>
                  <Text style={styles.text1}>256</Text>
                </View>
                <View>
                  <Text style={styles.text2}>Total XP</Text>
                </View>
              </View>
            </View>
            <View style={styles.bx}>
              <View>
                <View style={styles.imgh}>
                  <Image
                      source={require('@/assets/images/cible.png')}
                      style={styles.img}
                  />
                </View>
              </View>
              <View>
                <View>
                  <Text style={styles.text1}>256</Text>
                </View>
                <View>
                  <Text style={styles.text2}>Challenge</Text>
                </View>
              </View>
            </View>   
          </View>
        </View>
      </View>
      
    </>
  );
};

const styles = StyleSheet.create({
  content:{position:'relative',marginTop:60,height:'100%',paddingBottom:80,backgroundColor:Colors.white,flexDirection:'column',gap:'3%',justifyContent:'center'},
  zprofil:{gap:10},
  mod:{flexDirection:'row',borderColor:Colors.white,borderWidth:2,borderRadius:Colors.radius2,height:50,padding:Colors.padding,width:'49%',
  backgroundColor:Colors.logo,gap:Colors.padding,alignItems:'center',outline:'none'},

  sms:{flexDirection:'row',borderColor:Colors.logo,borderWidth:2,borderRadius:Colors.radius2,height:50,padding:Colors.padding,width:'49%',
    backgroundColor:Colors.white,gap:Colors.padding,alignItems:'center',outline:'none'},
  
  img:{width:'100%',height:'100%',},
  imgs:{width:'60%',height:'60%',},
  imgh:{width:30,height:30,},
  imgt:{width:20,height:20,},
  imgX:{width:30,height:30,marginHorizontal:10},
  
  pic:{flexDirection:'row',justifyContent:'center',alignItems:'center',borderRadius:'50%',overflow:'hidden'},
  pica:{border:4,borderRadius:'50%',overflow:'hidden',borderWidth:2,width:80,height:80,backgroundColor:Colors.gris2,borderColor:Colors.gris},
  pen:{width:30,height:30,backgroundColor:Colors.logo,borderRadius:8,justifyContent:'center',alignItems:'center',position:'relative',left:-25,top:25,outline:'none'},
  tex:{alignItems:'center',gap:'6px'},    
  text1:{fontFamily: Colors.font,fontSize:Colors.tsize,color:Colors.black,fontWeight:'600',},
  text2:{color:Colors.black,opacity:0.5,textAlign:'center',fontSize:11},
  text3:{color:Colors.white,opacity:1,textAlign:'center',fontSize:11,fontWeight:509},
  text4:{color:Colors.logo,opacity:1,textAlign:'center',fontSize:11,fontWeight:509},
  follow:{flexDirection:'row',justifyContent:'space-around',marginTop:20},
  count_text:{textAlign:'center',},
  stat:{marginTop:20,paddingHorizontal:Colors.padding,gap:20},
  stats:{marginTop:20,paddingHorizontal:Colors.padding,gap:20},
  uml:{width:20,height:20},
  group:{flexDirection:'row',justifyContent:'space-between',gap:10},
  bx:{flexDirection:'row',borderColor:Colors.gris,borderWidth:2,borderRadius:Colors.radius2,padding:Colors.padding,width:'49%',backgroundColor:Colors.white,gap:5,overflow:'hidden'},
});

export default profil;