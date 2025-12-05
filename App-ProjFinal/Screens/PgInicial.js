import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Dimensions} from 'react-native';

const { height } = Dimensions.get('window');

const logoEducaFacil = require('../Img/LogoEducaFacil-Inicial.png');
const IconPginicial = require('../Img/Icon-PgInicial.png');

const PgInicial = ({ navigation }) => {
  const handleEnter = () => {
    navigation.navigate('AppTabs');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* --- Logo --- */}
        <View style={styles.logoContainer}>
          <Image
            source={logoEducaFacil}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* --- Icon do meio Pginicial --- */}
        <Image
          source={IconPginicial}
          style={styles.mainImage}
          resizeMode="contain"
        />

        {/* --- Botão e Texto Inferior --- */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.enterButton} onPress={handleEnter}>
            <Text style={styles.enterButtonText}>ENTRAR COMO PROFESSOR</Text>
          </TouchableOpacity>
          
          <Text style={styles.bottomText}>
            Gerencie suas turmas e alunos com facilidade
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbd4b1', 
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: height * 0.1,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 250,
    height: 100,
    marginBottom: 0,
  },
  mainImage: {
    width: '80%',
    height: height * 0.35,
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  enterButton: {
    backgroundColor: '#FF9800', 
    paddingVertical: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 0,
  },
});

export default PgInicial;